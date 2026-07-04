#!/usr/bin/env node
/**
 * Suíte completa de boas práticas Lex-Rocha.
 * Uso: npm run test:all
 *
 * SKIP_BUILD=1        — não roda next build
 * SKIP_INTEGRACAO=1   — pula HTTP (sem dev server)
 * SKIP_PROD_CHECK=1   — não valida lexrocha.com.br
 * TEST_BASE_URL=…     — integração/mobile local (default http://localhost:3000)
 */

import { spawnSync } from "child_process";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const SKIP_BUILD = process.env.SKIP_BUILD === "1";
const SKIP_INTEGRACAO = process.env.SKIP_INTEGRACAO === "1";
const SKIP_PROD_CHECK = process.env.SKIP_PROD_CHECK === "1";

const resultados = [];

function rodar(nome, cmd, args, extraEnv = {}) {
  const inicio = Date.now();
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...extraEnv },
  });
  const ms = Date.now() - inicio;
  const passou = r.status === 0;
  resultados.push({ nome, passou, ms });
  return passou;
}

console.log("\n╔══════════════════════════════════════╗");
console.log("║   Lex-Rocha — test:all (boas práticas) ║");
console.log("╚══════════════════════════════════════╝\n");

const etapas = [
  ["Copy (auditoria + estrutura)", "npm", ["run", "test:copy:all"]],
  ["SemVer", "npm", ["run", "semver:check"]],
  ["ESLint", "npm", ["run", "lint"]],
  ["Supabase (REST direto)", "npm", ["run", "test:supabase"]],
];

if (!SKIP_BUILD) {
  etapas.push(["Build produção", "npm", ["run", "build"]]);
}

for (const [nome, cmd, args] of etapas) {
  console.log(`\n── ${nome} ──\n`);
  rodar(nome, cmd, args);
}

if (!SKIP_INTEGRACAO) {
  const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
  console.log(`\n── Integração HTTP (${base}) ──\n`);
  if (!rodar("Integração", "npm", ["run", "test:integracao"])) {
    console.log("\n  Dica: suba o dev com .\\scripts\\iniciar-dev.ps1\n");
  }

  console.log(`\n── Mobile / GPU no HTML (${base}) ──\n`);
  rodar("Mobile escopo (local)", "node", ["scripts/validate-mobile-escopo.mjs"], {
    BASE_URL: base,
  });
}

if (!SKIP_PROD_CHECK && !SKIP_INTEGRACAO) {
  console.log("\n── Produção — mobile (lexrocha.com.br) ──\n");
  rodar("Mobile escopo (produção)", "node", ["scripts/validate-mobile-escopo.mjs"], {
    BASE_URL: "https://lexrocha.com.br",
  });
}

console.log("\n══════════ RESUMO ══════════\n");
let totalFalhas = 0;
for (const r of resultados) {
  console.log(`${r.passou ? "✓" : "✗"} ${r.nome} (${(r.ms / 1000).toFixed(1)}s)`);
  if (!r.passou) totalFalhas += 1;
}

console.log(
  totalFalhas === 0
    ? "\n✓ Todos os testes automatizados passaram.\n"
    : `\n✗ ${totalFalhas} etapa(s) com falha.\n`
);

process.exit(totalFalhas ? 1 : 0);
