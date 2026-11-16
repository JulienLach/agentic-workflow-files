/**
 * Collecte déterministe pour /ai-news : stories Hacker News (filtrées par points
 * et mots-clés de titre) et releases GitHub stables récentes des outils suivis.
 *
 * Usage : node ~/.claude/skills/ai-news/collect.ts [heures]   (défaut : 48)
 * Node >= 23.6 exécute le TypeScript nativement (type stripping), sans dépendance.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const HOURS = Number(process.argv[2] ?? 48);
const SINCE = Math.floor(Date.now() / 1000) - HOURS * 3600;
const MIN_POINTS = 30;
const MAX_HN_ITEMS = 25;
const FETCH_TIMEOUT_MS = 15_000;

// Recherche dans le titre uniquement (sinon "local" ou "agent" matchent n'importe quoi).
const HN_QUERIES = [
  "llm", "llms", "gguf", "llama.cpp", "ollama", "mlx", "quantization", "quantized",
  "vram", "open weights", "open-weight", "inference", "moe", "qwen", "deepseek",
  "kimi", "mistral", "gemma", "llama", "local model", "language model", "gpu",
  "agent", "agents", "agentic", "coding agent", "claude", "codex", "opencode",
  "mcp", "prompt injection", "openai", "anthropic", "gemini", "gpt",
];

// Algolia fait du matching flou : on re-filtre sur un début de mot.
// Pas de \b final : "qwen" doit matcher "Qwen4-Max".
const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TITLE_RE = new RegExp(`\\b(${HN_QUERIES.map(escapeRegex).join("|")})`, "i");

// Releases stables uniquement (les pre-releases/nightlies sont du bruit).
const REPOS = [
  "anthropics/claude-code", "openai/codex", "sst/opencode", "All-Hands-AI/OpenHands",
  "Aider-AI/aider", "ollama/ollama", "ml-explore/mlx-lm", "vllm-project/vllm",
  "BerriAI/litellm", "modelcontextprotocol/modelcontextprotocol",
];

interface HnHit {
  objectID: string;
  title: string | null;
  url: string | null;
  points: number;
  created_at: string;
}

interface GhRelease {
  tag_name: string;
  html_url: string;
  published_at: string | null;
  prerelease: boolean;
  draft: boolean;
}

async function searchHn(query: string): Promise<HnHit[]> {
  const params = new URLSearchParams({
    tags: "story",
    query,
    numericFilters: `created_at_i>${SINCE},points>=${MIN_POINTS}`,
    restrictSearchableAttributes: "title",
    typoTolerance: "false",
    hitsPerPage: "20",
  });
  const res = await fetch(`https://hn.algolia.com/api/v1/search?${params}`, {
    headers: { "User-Agent": "news-digest/1.0" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { hits: HnHit[] };
  return data.hits.filter((hit) => TITLE_RE.test(hit.title ?? ""));
}

async function collectHn(): Promise<HnHit[]> {
  const results = await Promise.allSettled(HN_QUERIES.map(searchHn));
  const unique = new Map<string, HnHit>();
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[!] HN '${HN_QUERIES[i]}' : ${result.reason}`);
      return;
    }
    for (const hit of result.value) unique.set(hit.objectID, hit);
  });
  return [...unique.values()].sort((a, b) => b.points - a.points).slice(0, MAX_HN_ITEMS);
}

async function recentReleases(repo: string): Promise<string[]> {
  // --jq : ne récupérer que les champs utiles (les notes de release de Codex dépassent le buffer).
  const { stdout } = await execFileAsync("gh", [
    "api", `repos/${repo}/releases?per_page=5`,
    "--jq", "[.[] | {tag_name, html_url, published_at, prerelease, draft}]",
  ]);
  const releases = JSON.parse(stdout) as GhRelease[];
  return releases
    .filter((r) => !r.prerelease && !r.draft && r.published_at)
    .filter((r) => Date.parse(r.published_at!) / 1000 >= SINCE)
    .map((r) => `${r.published_at!.slice(0, 10)}  ${repo}  ${r.tag_name}  ${r.html_url}`);
}

async function collectReleases(): Promise<string[]> {
  const results = await Promise.allSettled(REPOS.map(recentReleases));
  return results.flatMap((result, i) =>
    result.status === "fulfilled" ? result.value : [`[!] ${REPOS[i]} : ${result.reason}`],
  );
}

function printHn(hits: HnHit[]): void {
  console.log(`== HACKER NEWS (>= ${MIN_POINTS} pts, ${HOURS} h) ==`);
  for (const hit of hits) {
    const url = hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`;
    console.log(`${String(hit.points).padStart(4)} pts  ${hit.created_at.slice(0, 10)}  ${hit.title}`);
    console.log(`          ${url}  (hn: ${hit.objectID})`);
  }
}

async function main(): Promise<void> {
  const [hits, releases] = await Promise.all([collectHn(), collectReleases()]);
  printHn(hits);
  console.log(`\n== RELEASES GITHUB STABLES (${HOURS} h) ==`);
  console.log(releases.length > 0 ? releases.join("\n") : "(aucune)");
}

main().catch((err: unknown) => {
  console.error(`[!] collecte en échec : ${err}`);
  process.exitCode = 1;
});
