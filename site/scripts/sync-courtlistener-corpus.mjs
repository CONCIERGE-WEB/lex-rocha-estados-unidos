/**
 * Sync one category×state cell from CourtListener into report-models/granted.
 * Requires COURTLISTENER_API_TOKEN. Does not invent results.
 *
 * Usage:
 *   node scripts/sync-courtlistener-corpus.mjs --categoria=fcra_credit_reporting --state=US
 *   node scripts/sync-courtlistener-corpus.mjs --categoria=all --state=US --dry-run
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = join(__dirname, "..");

function loadEnvLocal() {
  const p = join(siteRoot, ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

loadEnvLocal();

const QUERIES = {
  fcra_credit_reporting:
    '"Fair Credit Reporting Act" OR FCRA (credit report OR consumer reporting) damages',
  fdcpa_debt_collection:
    '"Fair Debt Collection Practices Act" OR FDCPA (debt collector OR collection) damages',
  tcpa_robocalls:
    '"Telephone Consumer Protection Act" OR TCPA (robocall OR autodialer OR "text message") damages',
  lemon_law_warranty:
    '("lemon law" OR "Magnuson-Moss") (warranty OR defect OR vehicle OR automobile) consumer',
  udap_deceptive_practices:
    '(UDAP OR "unfair and deceptive" OR "unfair or deceptive" OR "junk fee") (consumer OR FTC) damages',
  dot_flights_baggage:
    '(airline OR "air carrier") (baggage OR delay OR cancellation) (DOT OR "Department of Transportation")',
  health_plan_denial:
    '(ERISA OR "health insurance" OR "bad faith") (denial OR "claim denied" OR coverage) benefits',
};

function arg(name, fallback = null) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

const categoriaArg = arg("categoria", "fcra_credit_reporting");
const state = (arg("state", "US") || "US").toUpperCase();
const dryRun = process.argv.includes("--dry-run");
const pageSize = Number(arg("page-size", "10")) || 10;

const token =
  process.env.COURTLISTENER_API_TOKEN?.trim() ||
  process.env.COURTLISTENER_TOKEN?.trim();

if (!token) {
  console.warn(
    "COURTLISTENER_API_TOKEN not set — calling public API without Token header."
  );
}

const categorias =
  categoriaArg === "all" ? Object.keys(QUERIES) : [categoriaArg];

function mapHit(row) {
  const caseName = row.caseName || row.case_name || "";
  const path = row.absolute_url || row.absoluteUrl || "";
  if (!caseName || !path) return null;
  const absolute_url = path.startsWith("http")
    ? path
    : `https://www.courtlistener.com${path.startsWith("/") ? "" : "/"}${path}`;
  const clusterRaw = row.cluster_id ?? row.id ?? null;
  return {
    state,
    court_id: row.court_id || row.court || null,
    case_name: String(caseName).trim(),
    cluster_id:
      typeof clusterRaw === "number"
        ? clusterRaw
        : /^\d+$/.test(String(clusterRaw ?? ""))
          ? Number(clusterRaw)
          : null,
    absolute_url,
    date_filed: row.dateFiled || row.date_filed || null,
    snippet: row.snippet
      ? String(row.snippet).replace(/<\/?[^>]+>/g, "").trim()
      : null,
    citation: Array.isArray(row.citation)
      ? row.citation[0] || null
      : row.citation || null,
    source: "courtlistener",
    fetched_at: new Date().toISOString(),
  };
}

async function syncOne(categoria) {
  const q = QUERIES[categoria];
  if (!q) {
    console.error("Unknown category:", categoria);
    return;
  }
  const url = new URL("https://www.courtlistener.com/api/rest/v4/search/");
  url.searchParams.set("q", q);
  url.searchParams.set("type", "o");
  url.searchParams.set("page_size", String(Math.min(pageSize, 20)));

  console.log(`→ ${categoria}/${state}: ${q.slice(0, 80)}…`);
  const headers = {
    Accept: "application/json",
    "User-Agent": "JudicialIntelligence-US-corpus-sync/1.0",
  };
  if (token) headers.Authorization = `Token ${token}`;
  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) {
    console.error(`  HTTP ${res.status}`, await res.text().catch(() => ""));
    return;
  }
  const json = await res.json();
  const itens = (json.results || []).map(mapHit).filter(Boolean);
  const corpus = {
    categoria,
    state,
    geradoEm: new Date().toISOString(),
    total: itens.length,
    status: itens.length >= 5 ? "pronto" : itens.length > 0 ? "parcial" : "aguardando_corpus",
    nota:
      itens.length > 0
        ? "Synced from CourtListener API — verify absolute_url before citing in a paid report."
        : "No hits returned for this query — cell left empty (nothing invented).",
    itens,
  };

  if (dryRun) {
    console.log(`  dry-run: would write ${itens.length} item(s)`);
    return;
  }

  const dir = join(siteRoot, "report-models", "granted", categoria, state);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "corpus.json"), JSON.stringify(corpus, null, 2) + "\n");
  console.log(`  wrote ${itens.length} item(s) → ${categoria}/${state}/corpus.json`);
}

for (const cat of categorias) {
  await syncOne(cat);
}
