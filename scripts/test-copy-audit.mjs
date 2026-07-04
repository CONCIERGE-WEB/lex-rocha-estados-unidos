#!/usr/bin/env node
/**
 * Auditoria de copy proibido no código público (src/app, src/components).
 * Uso: npm run test:copy
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { COPY_PROIBIDO } from "./copy-governance.mjs";

const ROOT = join(import.meta.dirname, "..");
const COPY_PROIBIDO_EXTRA = ["Sim — o nome correto é"];

const dirs = [
  join(ROOT, "src", "app"),
  join(ROOT, "src", "components"),
  join(ROOT, "src", "lib", "constants", "copy-site.ts"),
];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (/\.(tsx?|md)$/.test(name)) files.push(p);
  }
  return files;
}

let falhas = 0;

for (const dir of dirs) {
  const files = statSync(dir).isDirectory() ? walk(dir) : [dir];
  for (const file of files) {
    if (file.includes("pesquisa-documental-workspace")) continue;
    if (file.includes("triagem.ts") || file.includes("groq")) continue;
    const texto = readFileSync(file, "utf8");
    for (const frase of [...COPY_PROIBIDO, ...COPY_PROIBIDO_EXTRA]) {
      if (file.endsWith("copy-site.ts") && texto.includes(`"${frase}"`)) continue;
      if (texto.includes(frase)) {
        console.error(`✗ "${frase}" em ${file.replace(ROOT, "")}`);
        falhas += 1;
      }
    }
  }
}

if (falhas === 0) {
  console.log("✓ Auditoria de copy: nenhuma frase proibida em páginas públicas.");
} else {
  console.error(`\n${falhas} ocorrência(s) encontrada(s).`);
  process.exit(1);
}
