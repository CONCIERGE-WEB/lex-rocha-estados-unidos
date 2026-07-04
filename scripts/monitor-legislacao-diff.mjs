#!/usr/bin/env node
/**
 * Módulo 5 (CLI) — compara dois snapshots de texto (arquivos).
 * Uso:
 *   node scripts/monitor-legislacao-diff.mjs snapshots/cdc-antes.txt snapshots/cdc-depois.txt "CDC"
 *
 * Não usa IA para decidir mudança — só hash/diff.
 */
import { createHash, readFileSync } from "fs";

const [,, antesPath, depoisPath, label = "fonte"] = process.argv;
if (!antesPath || !depoisPath) {
  console.error("Uso: node scripts/monitor-legislacao-diff.mjs <antes.txt> <depois.txt> [label]");
  process.exit(1);
}

function hash(t) {
  return createHash("sha256").update(t.replace(/\r\n/g, "\n").trim(), "utf8").digest("hex");
}

const antes = readFileSync(antesPath, "utf8");
const depois = readFileSync(depoisPath, "utf8");
const ha = hash(antes);
const hd = hash(depois);
const agora = new Date().toISOString();

if (ha === hd) {
  console.log(`OK, sem alterações em ${label}, checado em ${agora}`);
  process.exit(0);
}

console.log(`ALERTA: mudança detectada em ${label}`);
console.log(`Checado em: ${agora}`);
console.log(`Hash anterior: ${ha}`);
console.log(`Hash novo: ${hd}`);
process.exit(2);
