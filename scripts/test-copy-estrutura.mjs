#!/usr/bin/env node
/**
 * Valida estrutura de copy em camadas (docs/PROMPT_ADAPTACAO_NEUROCOMPORTAMENTAL.md).
 * Uso: npm run test:copy:estrutura
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import {
  COPY_NICHO_TI_TERMOS,
  COPY_PROIBIDO,
  COPY_SITE_KEYS,
  COMPONENTES_COPY_SITE,
} from "./copy-governance.mjs";

const ROOT = join(import.meta.dirname, "..");
const COPY_SITE_PATH = join(ROOT, "src", "lib", "constants", "copy-site.ts");
const PESQUISA_PATH = join(ROOT, "src", "lib", "constants", "pesquisa-documental.ts");
const PESQUISA_SHARED_PATH = join(
  ROOT,
  "src",
  "lib",
  "constants",
  "pesquisa-documental.shared.ts"
);
const COMPONENTS_DIR = join(ROOT, "src", "components", "organisms");

const copySite = readFileSync(COPY_SITE_PATH, "utf8");
// pesquisa-documental.ts hoje apenas reexporta; o domínio vive no .shared.ts
let pesquisa = readFileSync(PESQUISA_PATH, "utf8");
if (!pesquisa.includes("AREAS_PROBLEMA") && existsSync(PESQUISA_SHARED_PATH)) {
  pesquisa = readFileSync(PESQUISA_SHARED_PATH, "utf8");
}

let falhas = 0;

function ok(msg) {
  console.log(`OK — ${msg}`);
}

function fail(msg) {
  console.error(`FAIL — ${msg}`);
  falhas += 1;
}

console.log("=== Camada 1: copy-site.ts ===\n");

for (const key of COPY_SITE_KEYS) {
  if (copySite.includes(`${key}:`)) ok(`chave COPY_SITE.${key}`);
  else fail(`chave ausente: ${key}`);
}

if (copySite.includes("COPY_CATEGORIAS_DIGITAL")) ok("COPY_CATEGORIAS_DIGITAL definido");
else fail("COPY_CATEGORIAS_DIGITAL ausente");

if (/lista:\s*COPY_CATEGORIAS_DIGITAL\.map/.test(copySite)) {
  ok("areas.lista derivada de categorias digitais");
} else fail("areas.lista não vinculada a COPY_CATEGORIAS_DIGITAL");

for (const termo of COPY_NICHO_TI_TERMOS) {
  if (copySite.toLowerCase().includes(termo.toLowerCase())) ok(`nicho TI: "${termo}" em copy-site`);
  else fail(`nicho TI: termo "${termo}" ausente em copy-site`);
}

if (copySite.includes("direito digital")) ok("SEO: direito digital");
else fail('SEO: "direito digital" ausente');

if (copySite.includes("PROMPT_ADAPTACAO_NEUROCOMPORTAMENTAL")) {
  ok("referência ao prompt mestre no cabeçalho");
} else fail("cabeçalho sem referência ao prompt mestre");

console.log("\n=== Camada 2: pesquisa-documental + domínio ===\n");

const areasMatch = pesquisa.match(/AREAS_PROBLEMA = \[([\s\S]*?)\] as const/);
if (areasMatch) {
  const areas = areasMatch[1];
  if (areas.includes("conta digital")) ok("AREAS_PROBLEMA inclui conta/plataforma digital");
  else fail("AREAS_PROBLEMA sem conta/plataforma digital");
  if (areas.includes("Cobrança") || areas.includes("Cancelamento")) {
    ok("AREAS_PROBLEMA inclui consumo digital (cobrança/cancelamento)");
  } else fail("AREAS_PROBLEMA sem consumo digital");
  if (areas.includes("Plano de saúde") || areas.includes("SPC/Serasa")) {
    ok("AREAS_PROBLEMA inclui demanda CDC (saúde/negativação)");
  } else fail("AREAS_PROBLEMA sem demanda CDC");
} else {
  fail("AREAS_PROBLEMA não encontrado");
}

const precedentesPath = join(ROOT, "src", "lib", "data", "precedentes.ts");
if (existsSync(precedentesPath)) {
  const prec = readFileSync(precedentesPath, "utf8");
  if (prec.includes("LGPD") && prec.includes("Marco Civil")) ok("precedentes.ts: LGPD + Marco Civil");
  else fail("precedentes.ts incompleto");
  if (prec.includes("decisao") && prec.includes("CASOS_PRECEDENTES_AMOSTRA")) {
    ok("precedentes.ts: casos com explicação do que o juiz decidiu");
  } else fail("precedentes.ts sem estrutura de casos explicados");
}

const fontesPath = join(ROOT, "src", "lib", "constants", "fontes-publicas.ts");
if (existsSync(fontesPath)) {
  const fontes = readFileSync(fontesPath, "utf8");
  if (fontes.includes("ANPD")) ok("fontes-publicas.ts: ANPD");
  else fail("fontes-publicas.ts sem ANPD");
}

console.log("\n=== Camada 3: componentes ===\n");

for (const arquivo of COMPONENTES_COPY_SITE) {
  const path = join(COMPONENTS_DIR, arquivo);
  if (!existsSync(path)) {
    fail(`componente ausente: ${arquivo}`);
    continue;
  }
  const texto = readFileSync(path, "utf8");
  if (texto.includes("COPY_SITE")) ok(`${arquivo} importa COPY_SITE`);
  else fail(`${arquivo} não importa COPY_SITE`);
}

console.log("\n=== Camada 4: páginas App Router ===\n");

const paginasCopy = [
  "src/app/layout.tsx",
  "src/app/solicitar/page.tsx",
  "src/app/modelo-relatorio/page.tsx",
  "src/app/acompanhar/page.tsx",
  "src/app/parceiro/page.tsx",
];

for (const rel of paginasCopy) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) {
    fail(`página ausente: ${rel}`);
    continue;
  }
  const texto = readFileSync(path, "utf8");
  if (texto.includes("COPY_SITE")) ok(`${rel} usa COPY_SITE`);
  else fail(`${rel} não usa COPY_SITE`);
}

console.log("\n=== Governança: frases proibidas em copy-site (lista) ===\n");

for (const frase of COPY_PROIBIDO) {
  const escaped = frase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`"${escaped}"`);
  if (re.test(copySite)) ok(`COPY_PROIBIDO registrado: "${frase.slice(0, 40)}…"`);
  else fail(`COPY_PROIBIDO não listado em copy-site: "${frase}"`);
}

console.log(`\n${falhas === 0 ? "✓ Estrutura de copy validada em todas as camadas." : `✗ ${falhas} falha(s).`}`);
process.exit(falhas ? 1 : 0);
