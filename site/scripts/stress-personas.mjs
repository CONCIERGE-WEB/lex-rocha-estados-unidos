#!/usr/bin/env node
/**
 * Persona stress test for the free triage endpoint (/api/triagem).
 *
 * Fires many concurrent requests across diverse consumer personas and
 * validates the JSON contract returned by the Groq-backed analysis. It also
 * checks invalid inputs (short description / bad area) and flags any text that
 * leaks recommendations or forbidden references (attorneys, URLs).
 *
 * Usage:
 *   node scripts/stress-personas.mjs
 *   BASE_URL=http://localhost:3010 ROUNDS=3 CONCURRENCY=4 node scripts/stress-personas.mjs
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3010";
const ROUNDS = Number(process.env.ROUNDS ?? 2);
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 4);

const PLANOS = new Set(["essencial", "padrao", "completo"]);
const CONFIANCAS = new Set(["alta", "media", "baixa"]);
const PRECEDENTES = new Set(["forte", "medio", "fraco", "nenhum"]);
const FORBIDDEN = [/\byou should\b/i, /https?:\/\//i, /\battorney\b/i, /\blawyer\b/i, /\bBBB\b/];

/** @type {{nome:string, area:string, descricao:string}[]} */
const PERSONAS = [
  {
    nome: "Strong — wireless overbilling",
    area: "telecom",
    descricao:
      "I canceled my wireless plan in writing on January 3rd within the trial window. The carrier kept billing me $89 a month for three months and refused to issue a credit even after I sent the cancellation confirmation email twice.",
  },
  {
    nome: "E-commerce defective product",
    area: "compras_online",
    descricao:
      "I bought a laptop online in March. It arrived with a cracked screen and would not turn on. The store refused a return for over three weeks claiming the warranty window had closed, although I reported it the same day it arrived.",
  },
  {
    nome: "Bank unauthorized charges",
    area: "banco",
    descricao:
      "My credit card shows four charges I never authorized from a subscription service I canceled last year. The bank opened a dispute but then closed it without explanation and the charges keep recurring every month.",
  },
  {
    nome: "Utilities billing spike",
    area: "energia",
    descricao:
      "My electricity bill tripled in a single month with no change in usage. The utility says the meter is fine but refuses to send a technician or provide the actual meter readings that justify the new amount they are charging me.",
  },
  {
    nome: "Travel cancellation refund",
    area: "viagens",
    descricao:
      "The airline canceled my flight and rebooked me two days later, causing me to miss a paid hotel reservation. They offered only a travel voucher and refused the cash refund I am entitled to under their own published policy.",
  },
  {
    nome: "Housing deposit dispute",
    area: "habitacao",
    descricao:
      "My landlord kept my entire $1,500 security deposit claiming cleaning fees, but the apartment was returned in the same condition with photos and a signed move-out checklist. He never sent the itemized list of deductions required.",
  },
  {
    nome: "Weak — vague healthcare complaint",
    area: "saude",
    descricao:
      "I went to a clinic and felt the service was not great and the waiting time was long. I am not sure if I was overcharged but the whole experience left me unhappy and I would like to understand if there is anything to it.",
  },
  {
    nome: "Insurance claim denial",
    area: "seguros",
    descricao:
      "My home insurer denied a water-damage claim saying it was gradual leakage, but the plumber's report clearly states a sudden pipe burst. They have not responded to my appeal for six weeks despite repeated written follow-ups.",
  },
];

const INVALID_CASES = [
  { nome: "Too short", body: { area: "telecom", descricao: "Too short to analyze." }, expect: 400 },
  { nome: "Bad area", body: { area: "not_an_area", descricao: "x".repeat(120) }, expect: 400 },
];

async function callTriagem(body) {
  const started = Date.now();
  let status = 0;
  let json = null;
  let netError = null;
  try {
    const res = await fetch(`${BASE_URL}/api/triagem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    status = res.status;
    json = await res.json().catch(() => null);
  } catch (e) {
    netError = e instanceof Error ? e.message : String(e);
  }
  return { ms: Date.now() - started, status, json, netError };
}

function validateResultado(json) {
  const problems = [];
  const r = json?.resultado;
  if (!r) return ["missing resultado"];
  if (!PLANOS.has(r.planoId)) problems.push(`planoId=${r.planoId}`);
  if (!CONFIANCAS.has(r.confianca)) problems.push(`confianca=${r.confianca}`);
  if (!PRECEDENTES.has(r.precedente)) problems.push(`precedente=${r.precedente}`);
  if (typeof r.casoFavoravel !== "boolean") problems.push("casoFavoravel not boolean");
  if (typeof r.preco !== "number") problems.push("preco not number");
  if (!r.mensagemCliente || typeof r.mensagemCliente !== "string") problems.push("empty mensagemCliente");
  const blob = `${r.mensagemCliente ?? ""} ${r.resumo ?? ""}`;
  for (const re of FORBIDDEN) if (re.test(blob)) problems.push(`forbidden text: ${re}`);
  return problems;
}

function pct(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

async function runPool(tasks, concurrency) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
  return results;
}

async function main() {
  console.log(`\n=== Persona stress test ===`);
  console.log(`BASE_URL=${BASE_URL}  ROUNDS=${ROUNDS}  CONCURRENCY=${CONCURRENCY}`);
  console.log(`Personas: ${PERSONAS.length}  Total valid calls: ${PERSONAS.length * ROUNDS}\n`);

  const tasks = [];
  for (let round = 0; round < ROUNDS; round++) {
    for (const p of PERSONAS) {
      tasks.push(async () => {
        const out = await callTriagem({ area: p.area, descricao: p.descricao });
        const problems =
          out.status === 200 ? validateResultado(out.json) : [`HTTP ${out.status}`];
        if (out.netError) problems.push(`net: ${out.netError}`);
        return { persona: p.nome, ...out, problems };
      });
    }
  }

  const t0 = Date.now();
  const results = await runPool(tasks, CONCURRENCY);
  const wall = Date.now() - t0;

  const latencies = results.map((r) => r.ms);
  const passed = results.filter((r) => r.problems.length === 0);
  const failed = results.filter((r) => r.problems.length > 0);

  console.log("Persona results (first occurrence shown):");
  const seen = new Set();
  for (const r of results) {
    if (seen.has(r.persona)) continue;
    seen.add(r.persona);
    const rr = r.json?.resultado;
    const tag = r.problems.length === 0 ? "OK " : "ERR";
    const detail = rr
      ? `${rr.planoId}/${rr.precedente}/fav=${rr.casoFavoravel}`
      : `status ${r.status}`;
    console.log(
      `  [${tag}] ${r.persona.padEnd(34)} ${detail.padEnd(26)} ${r.ms}ms` +
        (r.problems.length ? `  -> ${r.problems.join(", ")}` : "")
    );
  }

  console.log("\nInvalid-input checks:");
  for (const c of INVALID_CASES) {
    const out = await callTriagem(c.body);
    const ok = out.status === c.expect;
    console.log(`  [${ok ? "OK " : "ERR"}] ${c.nome.padEnd(12)} expected ${c.expect}, got ${out.status}`);
  }

  console.log("\n=== Summary ===");
  console.log(`Total valid calls : ${results.length}`);
  console.log(`Passed            : ${passed.length}`);
  console.log(`Failed            : ${failed.length}`);
  console.log(`Latency ms        : min ${Math.min(...latencies)} | avg ${Math.round(
    latencies.reduce((a, b) => a + b, 0) / latencies.length
  )} | p95 ${pct(latencies, 95)} | max ${Math.max(...latencies)}`);
  console.log(`Wall clock        : ${wall}ms (concurrency ${CONCURRENCY})`);

  if (failed.length > 0) {
    console.log("\nFailures detail:");
    for (const f of failed) console.log(`  - ${f.persona}: ${f.problems.join(", ")}`);
    process.exitCode = 1;
  } else {
    console.log("\nAll personas passed the contract + content checks. ✅");
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exitCode = 1;
});
