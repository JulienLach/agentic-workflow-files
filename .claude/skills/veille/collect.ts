/**
 * Collecte déterministe pour /veille : failles récentes qui touchent MA stack (stack.txt),
 * depuis les flux officiels (pas de moteur de recherche : ils ont des heures de retard).
 *   - CISA KEV      : CVE exploitées activement (toujours gardées si elles matchent la stack)
 *   - NVD API 2.0   : toutes les CVE publiées dans la fenêtre, filtrées stack + CVSS >= 7
 *   - GitHub GHSA   : advisories npm high/critical sur les paquets listés en "npm:"
 *   - CERT-FR       : alertes et avis (RSS), filtrés sur la stack
 *
 * Usage : node ~/.claude/skills/veille/collect.ts [heures]   (défaut : 48)
 */

import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const HOURS = Number(process.argv[2] ?? 48);
const SINCE = new Date(Date.now() - HOURS * 3600_000);
const SINCE_DAY = SINCE.toISOString().slice(0, 10);
const MIN_CVSS = 7;
const NVD_PAGE_SIZE = 2000;
const DESC_MAX = 220;
const FETCH_TIMEOUT_MS = 30_000;
const UA = { "User-Agent": "Mozilla/5.0 (veille-cve)" };

// kevOnly : techno à très gros volume de CVE mineures (noyau, navigateur) -> seulement si exploitée (KEV) ou CERT-FR.
interface Tech { label: string; re: RegExp; kevOnly: boolean }

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function loadStack(): { techs: Tech[]; npm: Set<string> } {
  const lines = readFileSync(new URL("./stack.txt", import.meta.url), "utf8")
    .split("\n").map((l) => l.replace(/\s#.*$/, "").trim()).filter((l) => l && !l.startsWith("#"));
  const npm = new Set(lines.filter((l) => l.startsWith("npm:")).map((l) => l.slice(4).toLowerCase()));
  const techs = lines.filter((l) => !l.startsWith("npm:")).map((line) => {
    const kevOnly = line.startsWith("kev:");
    const variants = line.replace(/^kev:/, "").split("|").map((v) => v.trim());
    return { label: variants[0], kevOnly, re: new RegExp(`(?<![\\w.])(${variants.map(escapeRegex).join("|")})(?![\\w])`, "i") };
  });
  return { techs, npm };
}

const { techs: TECHS, npm: NPM } = loadStack();
const matchStack = (text: string, includeKevOnly = true): string[] =>
  TECHS.filter((t) => (includeKevOnly || !t.kevOnly) && t.re.test(text)).map((t) => t.label);

// Le sujet d'une CVE NVD = sa 1re phrase + les produits CPE. Le reste de la description cite souvent
// d'autres outils en contexte ("derrière un reverse proxy nginx") -> faux positifs.
function nvdSubject(cve: NvdCve, desc: string): string {
  const firstSentence = desc.split(/\.\s/)[0];
  const cpes = JSON.stringify(cve.configurations ?? "").match(/cpe:2\.3:[^"]+/g) ?? [];
  return `${firstSentence} ${cpes.map((c) => c.split(":").slice(3, 5).join(":")).join(" ")}`;
}
const short = (s: string): string => (s.length > DESC_MAX ? `${s.slice(0, DESC_MAX)}...` : s).replace(/\s+/g, " ");

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return (await res.json()) as T;
}

// --- CISA KEV ---------------------------------------------------------------
interface KevVuln {
  cveID: string; vendorProject: string; product: string; vulnerabilityName: string;
  shortDescription: string; dateAdded: string; dueDate: string; requiredAction: string;
}

async function fetchKev(): Promise<KevVuln[]> {
  const data = await getJson<{ vulnerabilities: KevVuln[] }>(
    "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json");
  return data.vulnerabilities;
}

function kevSection(all: KevVuln[]): string[] {
  return all
    .filter((v) => v.dateAdded >= SINCE_DAY)
    .map((v) => ({ v, hits: matchStack(`${v.vendorProject} ${v.product} ${v.vulnerabilityName} ${v.shortDescription}`) }))
    .filter(({ hits }) => hits.length > 0)
    .map(({ v, hits }) => `${v.dateAdded}  ${v.cveID}  [${hits.join(", ")}]  ${v.vendorProject} ${v.product} - ${v.vulnerabilityName}\n` +
      `            ${short(v.shortDescription)}\n            action : ${short(v.requiredAction)}  https://nvd.nist.gov/vuln/detail/${v.cveID}`);
}

// --- NVD ----------------------------------------------------------------------
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

function nvdSection(all: NvdCve[], exploited: Set<string>): string[] {
  return all.flatMap((cve) => {
    const desc = cve.descriptions.find((d) => d.lang === "en")?.value ?? "";
    const isExploited = exploited.has(cve.id);
    const hits = matchStack(nvdSubject(cve, desc), isExploited);
    const score = cvss(cve);
    // Sans score (CVE trop fraîche, pas encore analysée) : gardée, à Claude de juger.
    if (hits.length === 0 || (score && score.score < MIN_CVSS && !isExploited)) return [];
    const flag = isExploited ? "  [EXPLOITÉE - KEV]" : "";
    return [`${cve.published.slice(0, 10)}  ${cve.id}  ${score?.label ?? "non scorée"}  [${hits.join(", ")}]${flag}\n` +
      `            ${short(desc)}  https://nvd.nist.gov/vuln/detail/${cve.id}`];
  });
}

// --- GitHub Advisories (npm) --------------------------------------------------
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

// --- CERT-FR --------------------------------------------------------------------
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
    if (hits.length === 0 || date < SINCE) return [];
    return [`${date.toISOString().slice(0, 10)}  [${hits.join(", ")}]  ${title}  ${tag(item, "link")}`];
  });
}

// --- main -----------------------------------------------------------------------
async function section(title: string, run: () => Promise<string[]>): Promise<string> {
  try {
    const lines = await run();
    return `== ${title} ==\n${lines.length > 0 ? lines.join("\n") : "(rien)"}`;
  } catch (err) {
    return `== ${title} ==\n[!] source en échec : ${err}`;
  }
}

async function main(): Promise<void> {
  const kev = await fetchKev().catch((err: unknown) => { console.error(`[!] KEV : ${err}`); return [] as KevVuln[]; });
  const exploited = new Set(kev.map((v) => v.cveID));
  const out = await Promise.all([
    section("CISA KEV - exploitées activement", async () => kevSection(kev)),
    section(`NVD - CVSS >= ${MIN_CVSS} ou non scorée`, async () => nvdSection(await fetchNvd(), exploited)),
    section("GITHUB ADVISORIES npm - high/critical", ghsaSection),
    section("CERT-FR - alertes et avis", certFrSection),
  ]);
  console.log(`Veille CVE stack - fenêtre ${HOURS} h (depuis ${SINCE.toISOString().slice(0, 16)}Z)\n`);
  console.log(out.join("\n\n"));
}

main().catch((err: unknown) => {
  console.error(`[!] collecte en échec : ${err}`);
  process.exitCode = 1;
});
