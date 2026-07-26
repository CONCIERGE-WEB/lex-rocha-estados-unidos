/**
 * Seed report-models/granted/<cat>/<JURISDICTION>/corpus.json cells.
 * Never invents cases — empty cells stay aguardando_corpus until sync/seed.
 *
 * Matrix: 7 categories × (Federal + 50 states + DC + 5 territories) = 399 cells.
 *
 * Usage: node scripts/seed-report-models-granted.mjs
 */
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = join(__dirname, "..");

const CATEGORIAS = [
  "fcra_credit_reporting",
  "fdcpa_debt_collection",
  "tcpa_robocalls",
  "lemon_law_warranty",
  "udap_deceptive_practices",
  "dot_flights_baggage",
  "health_plan_denial",
];

/** Federal + 50 states + DC + major territories (USPS). */
const JURISDICTIONS = [
  "US",
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
  "PR",
  "GU",
  "VI",
  "AS",
  "MP",
];

const NOTA =
  "Corpus cell — structure only until CourtListener sync or federal_seed. " +
  "Never invent cases.";

const geradoEm = new Date().toISOString();
let created = 0;
let skipped = 0;

for (const cat of CATEGORIAS) {
  for (const state of JURISDICTIONS) {
    const dir = join(siteRoot, "report-models", "granted", cat, state);
    const file = join(dir, "corpus.json");
    mkdirSync(dir, { recursive: true });
    if (existsSync(file)) {
      skipped += 1;
      continue;
    }
    const body = {
      categoria: cat,
      state,
      geradoEm,
      total: 0,
      status: "aguardando_corpus",
      nota: NOTA,
      itens: [],
    };
    writeFileSync(file, JSON.stringify(body, null, 2) + "\n", "utf8");
    created += 1;
  }
}

const manifesto = {
  version: "2026-07-25",
  pasta: "report-models/granted",
  regra:
    "Only CourtListener (or federal_seed from US). Empty = aguardando_corpus. Never invent cases.",
  categorias: CATEGORIAS,
  jurisdictions: JURISDICTIONS,
  states_seed: JURISDICTIONS,
  coverage: {
    federal: 1,
    states: 50,
    district: 1,
    territories: 5,
    total_jurisdictions: JURISDICTIONS.length,
    cells: CATEGORIAS.length * JURISDICTIONS.length,
  },
  geradoEm,
  cells_created_this_run: created,
  cells_skipped_existing: skipped,
};

writeFileSync(
  join(siteRoot, "report-models", "granted", "manifesto.json"),
  JSON.stringify(manifesto, null, 2) + "\n",
  "utf8"
);

console.log(
  `Seed done: created=${created} skipped=${skipped} ` +
    `(categories=${CATEGORIAS.length} jurisdictions=${JURISDICTIONS.length} ` +
    `matrix=${CATEGORIAS.length * JURISDICTIONS.length})`
);
