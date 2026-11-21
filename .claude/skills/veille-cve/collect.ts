/**
 * Collecte déterministe pour /veille-cve : failles récentes qui touchent MA stack (stack.txt),
 * uniquement depuis des sources officielles et structurées (pas de moteur de recherche).
 *
 *   Découverte
 *   - NVD API 2.0 (NIST)          : toutes les CVE publiées dans la fenêtre
 *   - GitHub Advisories (npm)     : advisories high/critical sur les paquets "npm:"
 *   - CERT-FR (ANSSI)             : alertes et avis (RSS)
 *   Exploitation active
 *   - CISA KEV (US)               : catalogue des CVE exploitées
 *   - EUVD (ENISA, UE)            : vulnérabilités exploitées
 *   Confirmation et priorisation
 *   - CVE.org (CVE Program)       : éditeur/produit et versions corrigées déclarés par l'éditeur (CNA)
 *   - EPSS (FIRST)                : probabilité d'exploitation sous 30 jours
 *
 * Pipeline NVD : filtre large sur la stack (description + CPE) -> confirmation sur le produit
 * déclaré dans CVE.org (élimine les produits tiers) -> tri exploitée > EPSS > CVSS.
 *
 * Usage : node ~/.claude/skills/veille-cve/collect.ts [heures]   (défaut : 72)
 */

import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const HOURS = Number(process.argv[2] ?? 72);
const SINCE = new Date(Date.now() - HOURS * 3600_000);
const SINCE_DAY = SINCE.toISOString().slice(0, 10);
const MIN_CVSS = 7;
const NVD_PAGE_SIZE = 2000;
const CVE_ORG_BATCH = 10;
const EPSS_BATCH = 50;
const DESC_MAX = 220;
const FETCH_TIMEOUT_MS = 30_000;
const UA = { "User-Agent": "Mozilla/5.0 (veille-cve)" };

// kevOnly : techno à très gros volume de CVE mineures (noyau, navigateur) -> seulement si exploitée ou CERT-FR.
interface Tech { label: string; re: RegExp; kevOnly: boolean }

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function loadStack(): { techs: Tech[]; npm: Set<string> } {
  const lines = readFileSync(new URL("./stack.txt", import.meta.url), "utf8")
    .split("\n").map((l) => l.replace(/\s#.*$/, "").trim()).filter((l) => l && !l.startsWith("#"));
  const npm = new Set(lines.filter((l) => l.startsWith("npm:")).map((l) => l.slice(4).toLowerCase()));
  const techs = lines.filter((l) => !l.startsWith("npm:")).map((line) => {
    const kevOnly = line.startsWith("kev:");
    const variants = line.replace(/^kev:/, "").split("|").map((v) => v.trim());
    return { label: variants[0], kevOnly, re: new RegExp(`(?<![\\w.-])(${variants.map(escapeRegex).join("|")})(?![\\w-])`, "i") };
  });
  return { techs, npm };
}

const { techs: TECHS, npm: NPM } = loadStack();
const matchStack = (text: string, includeKevOnly = true): string[] =>
  TECHS.filter((t) => (includeKevOnly || !t.kevOnly) && t.re.test(text)).map((t) => t.label);
const short = (s: string): string => (s.length > DESC_MAX ? `${s.slice(0, DESC_MAX)}...` : s).replace(/\s+/g, " ");
const chunk = <T>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return (await res.json()) as T;
}

// --- Exploitation active : CISA KEV + ENISA EUVD --------------------------------
interface KevVuln {
  cveID: string; vendorProject: string; product: string; vulnerabilityName: string;
  shortDescription: string; dateAdded: string; requiredAction: string;
}
interface EuvdVuln { id: string; description: string; aliases?: string; exploitedSince?: string; enisaIdVendor?: unknown }

async function fetchKev(): Promise<KevVuln[]> {
  const data = await getJson<{ vulnerabilities: KevVuln[] }>(
    "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json");
  return data.vulnerabilities;
}

const fetchEuvd = (): Promise<EuvdVuln[]> =>
  getJson<EuvdVuln[]>("https://euvdservices.enisa.europa.eu/api/exploitedvulnerabilities");

const cveIdsIn = (v: unknown): string[] => JSON.stringify(v).match(/CVE-\d{4}-\d+/g) ?? [];

function exploitedSection(kev: KevVuln[], euvd: EuvdVuln[]): string[] {
  const fromKev = kev
    .filter((v) => v.dateAdded >= SINCE_DAY)
    .map((v) => ({ v, hits: matchStack(`${v.vendorProject} ${v.product} ${v.vulnerabilityName}`) }))
    .filter(({ hits }) => hits.length > 0)
    .map(({ v, hits }) => `${v.dateAdded}  ${v.cveID}  CISA KEV  [${hits.join(", ")}]  ${v.vendorProject} ${v.product} - ${v.vulnerabilityName}\n` +
      `            ${short(v.shortDescription)}\n            action : ${short(v.requiredAction)}  https://nvd.nist.gov/vuln/detail/${v.cveID}`);
  const kevIds = new Set(kev.map((v) => v.cveID));
  const fromEuvd = euvd
    .filter((v) => (v.exploitedSince ?? "") >= SINCE_DAY && !cveIdsIn(v.aliases).some((id) => kevIds.has(id)))
    .map((v) => ({ v, hits: matchStack(`${JSON.stringify(v.enisaIdVendor ?? "")} ${v.description.split(/\.\s/)[0]}`) }))
    .filter(({ hits }) => hits.length > 0)
    .map(({ v, hits }) => `${v.exploitedSince?.slice(0, 10)}  ${cveIdsIn(v.aliases)[0] ?? v.id}  ENISA EUVD  [${hits.join(", ")}]\n` +
      `            ${short(v.description)}  https://euvd.enisa.europa.eu/vulnerability/${v.id}`);
  return [...fromKev, ...fromEuvd];
}

// --- NVD : découverte -------------------------------------------------------------
interface NvdCve {
  id: string; published: string;
  descriptions: { lang: string; value: string }[];
  metrics?: Record<string, { cvssData: { baseScore: number; baseSeverity?: string } }[]>;
  configurations?: unknown;
}

async function fetchNvd(): Promise<NvdCve[]> {
  const nvdDate = (d: Date): string => d.toISOString().replace("Z", "");
  const out: NvdCve[] = [];
  for (let start = 0, total = 1; start < total; start += NVD_PAGE_SIZE) {
    const params = new URLSearchParams({
      pubStartDate: nvdDate(SINCE), pubEndDate: nvdDate(new Date()),
      resultsPerPage: String(NVD_PAGE_SIZE), startIndex: String(start),
    });
    const page = await getJson<{ totalResults: number; vulnerabilities: { cve: NvdCve }[] }>(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?${params}`);
    total = page.totalResults;
    out.push(...page.vulnerabilities.map((v) => v.cve));
  }
  return out;
}

function cvss(cve: NvdCve): { score: number; label: string } | null {
  for (const key of ["cvssMetricV40", "cvssMetricV31", "cvssMetricV30"]) {
    const m = cve.metrics?.[key]?.[0]?.cvssData;
    if (m) return { score: m.baseScore, label: `${m.baseScore} ${m.baseSeverity ?? ""}`.trim() };
  }
  return null;
}

// --- CVE.org : confirmation du produit + versions corrigées -------------------------
interface CnaAffected {
  vendor?: string; product?: string; packageName?: string;
  versions?: { version?: string; lessThan?: string; status?: string }[];
}
interface CveOrgInfo { products: string; fixed: string[] }

async function fetchCveOrg(id: string): Promise<CveOrgInfo | null> {
  try {
    const rec = await getJson<{ containers: { cna: { affected?: CnaAffected[] } } }>(`https://cveawg.mitre.org/api/cve/${id}`);
    const affected = rec.containers.cna.affected ?? [];
    if (affected.length === 0) return null;
    const products = affected.map((a) => [a.vendor, a.product, a.packageName].filter(Boolean).join(" / ")).join(" ; ");
    // "lessThan" (format structuré) ou "< x.y.z" dans la chaîne de version (format libre, ex. containerd).
    const fixed = affected.flatMap((a) => (a.versions ?? []).flatMap((v) => [
      ...(v.lessThan && v.lessThan !== "*" ? [v.lessThan] : []),
      ...[...(v.version ?? "").matchAll(/<\s*=?\s*([\w.-]+)/g)].map((m) => m[1]),
    ]));
    return { products, fixed: [...new Set(fixed)] };
  } catch {
    return null;
  }
}

async function fetchCveOrgAll(ids: string[]): Promise<Map<string, CveOrgInfo | null>> {
  const out = new Map<string, CveOrgInfo | null>();
  for (const batch of chunk(ids, CVE_ORG_BATCH)) {
    const infos = await Promise.all(batch.map(fetchCveOrg));
    batch.forEach((id, i) => out.set(id, infos[i]));
  }
  return out;
}

// --- EPSS : probabilité d'exploitation --------------------------------------------
async function fetchEpss(ids: string[]): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  for (const batch of chunk(ids, EPSS_BATCH)) {
    try {
      const data = await getJson<{ data: { cve: string; epss: string }[] }>(`https://api.first.org/data/v1/epss?cve=${batch.join(",")}`);
      for (const d of data.data) out.set(d.cve, Number(d.epss));
    } catch { /* EPSS indisponible : tri sur le CVSS seul */ }
  }
  return out;
}

interface Candidate { cve: NvdCve; desc: string; score: ReturnType<typeof cvss>; exploited: boolean }

async function nvdSection(exploited: Set<string>): Promise<string[]> {
  const candidates: Candidate[] = (await fetchNvd()).flatMap((cve) => {
    const desc = cve.descriptions.find((d) => d.lang === "en")?.value ?? "";
    const isExploited = exploited.has(cve.id);
    const score = cvss(cve);
    const cpes = JSON.stringify(cve.configurations ?? "").match(/cpe:2\.3:[^"]+/g) ?? [];
    if (matchStack(`${desc} ${cpes.join(" ")}`, isExploited).length === 0) return [];
    // Sans score (CVE trop fraîche) : gardée, la confirmation CVE.org et Claude tranchent.
    if (score && score.score < MIN_CVSS && !isExploited) return [];
    return [{ cve, desc, score, exploited: isExploited }];
  });

  const ids = candidates.map((c) => c.cve.id);
  const [cveOrg, epss] = await Promise.all([fetchCveOrgAll(ids), fetchEpss(ids)]);

  const rejected: string[] = [];
  const kept = candidates.flatMap((c) => {
    const info = cveOrg.get(c.cve.id) ?? null;
    // Confirmation déterministe : le produit déclaré par l'éditeur doit être dans la stack.
    const hits = info ? matchStack(info.products, c.exploited) : matchStack(c.desc.split(/\.\s/)[0], c.exploited);
    if (hits.length === 0) {
      rejected.push(info?.products.split(" ; ")[0].split(" / ").pop() ?? "?");
      return [];
    }
    return [{ ...c, hits, info, epss: epss.get(c.cve.id) ?? 0 }];
  });

  kept.sort((a, b) => Number(b.exploited) - Number(a.exploited) || b.epss - a.epss || (b.score?.score ?? 0) - (a.score?.score ?? 0));
  const lines = kept.map((k) => {
    const flag = k.exploited ? "  [EXPLOITÉE]" : "";
    const product = k.info ? k.info.products : "produit non confirmé par CVE.org";
    const fixed = k.info?.fixed.length ? `corrigé : ${k.info.fixed.join(", ")}` : "corrigé : non déclaré";
    return `${k.cve.published.slice(0, 10)}  ${k.cve.id}  CVSS ${k.score?.label ?? "non scorée"}  EPSS ${(k.epss * 100).toFixed(1)} %  [${k.hits.join(", ")}]${flag}\n` +
      `            produit : ${product}  |  ${fixed}\n` +
      `            ${short(k.desc)}  https://nvd.nist.gov/vuln/detail/${k.cve.id}`;
  });
  if (rejected.length > 0) {
    const counts = [...new Set(rejected)].map((p) => `${p}${rejected.filter((r) => r === p).length > 1 ? ` x${rejected.filter((r) => r === p).length}` : ""}`);
    lines.push(`(${rejected.length} écartées par CVE.org, produit hors stack : ${counts.join(", ")})`);
  }
  return lines;
}

// --- GitHub Advisories (npm) --------------------------------------------------------
interface Ghsa {
  ghsa_id: string; cve_id: string | null; severity: string; summary: string; published_at: string;
  html_url: string; vulnerabilities: { package: { name: string }; vulnerable_version_range: string; first_patched_version: string | null }[];
}

async function ghsaSection(): Promise<string[]> {
  const { stdout } = await execFileAsync("gh", [
    "api", "--paginate", `/advisories?ecosystem=npm&per_page=100&published=>=${SINCE_DAY}`,
    "--jq", ".[] | {ghsa_id, cve_id, severity, summary, published_at, html_url, vulnerabilities}",
  ], { maxBuffer: 20 * 1024 * 1024 });
  const advisories = stdout.trim().split("\n").filter(Boolean).map((l) => JSON.parse(l) as Ghsa);
  return advisories
    .filter((a) => ["high", "critical"].includes(a.severity) && Date.parse(a.published_at) >= SINCE.getTime())
    .flatMap((a) => {
      const pkgs = a.vulnerabilities.filter((v) => NPM.has(v.package.name.toLowerCase()));
      if (pkgs.length === 0) return [];
      const fix = pkgs.map((p) => `${p.package.name} ${p.vulnerable_version_range} -> ${p.first_patched_version ?? "pas de correctif"}`).join("; ");
      return [`${a.published_at.slice(0, 10)}  ${a.ghsa_id}${a.cve_id ? ` / ${a.cve_id}` : ""}  ${a.severity}  ${short(a.summary)}\n` +
        `            ${fix}  ${a.html_url}`];
    });
}

// --- CERT-FR (ANSSI) ----------------------------------------------------------------
async function certFrSection(): Promise<string[]> {
  const feeds = ["alerte", "avis"].map((kind) => `https://www.cert.ssi.gouv.fr/${kind}/feed/`);
  const xmls = await Promise.all(feeds.map(async (url) => {
    const res = await fetch(url, { headers: UA, redirect: "follow", signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
    return res.text();
  }));
  const tag = (item: string, name: string): string => item.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1]?.trim() ?? "";
  return xmls.flatMap((xml) => xml.split("<item>").slice(1)).flatMap((item) => {
    const title = tag(item, "title");
    const date = new Date(tag(item, "pubDate"));
    const hits = matchStack(title);
    const day = date.toISOString().slice(0, 10);
    if (hits.length === 0 || day < SINCE_DAY) return [];
    return [`${day}  [${hits.join(", ")}]  ${title}  ${tag(item, "link")}`];
  });
}

// --- main ---------------------------------------------------------------------------
async function section(title: string, run: () => Promise<string[]>): Promise<string> {
  try {
    const lines = await run();
    return `== ${title} ==\n${lines.length > 0 ? lines.join("\n") : "(rien)"}`;
  } catch (err) {
    return `== ${title} ==\n[!] source en échec : ${err}`;
  }
}

async function main(): Promise<void> {
  const [kev, euvd] = await Promise.all([
    fetchKev().catch((err: unknown) => { console.error(`[!] CISA KEV : ${err}`); return [] as KevVuln[]; }),
    fetchEuvd().catch((err: unknown) => { console.error(`[!] ENISA EUVD : ${err}`); return [] as EuvdVuln[]; }),
  ]);
  const exploited = new Set([...kev.map((v) => v.cveID), ...euvd.flatMap((v) => cveIdsIn(v.aliases))]);
  const out = await Promise.all([
    section("EXPLOITÉES ACTIVEMENT - CISA KEV + ENISA EUVD", async () => exploitedSection(kev, euvd)),
    section(`NVD -> confirmé CVE.org, CVSS >= ${MIN_CVSS} ou non scorée, tri exploitée > EPSS > CVSS`, () => nvdSection(exploited)),
    section("GITHUB ADVISORIES npm - high/critical", ghsaSection),
    section("CERT-FR (ANSSI) - alertes et avis", certFrSection),
  ]);
  console.log(`Veille CVE stack - fenêtre ${HOURS} h (depuis ${SINCE.toISOString().slice(0, 16)}Z)\n`);
  console.log(out.join("\n\n"));
}

main().catch((err: unknown) => {
  console.error(`[!] collecte en échec : ${err}`);
  process.exitCode = 1;
});
