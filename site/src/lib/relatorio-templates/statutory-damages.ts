/**
 * Catalogued statutory-damages reference (normative text only).
 * Never invent case-specific awards.
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";

import type { CategoriaPipeline } from "@/lib/pipeline-confiavel/categorias";

export type StatutoryDamagesEntry = {
  id: string;
  statute: string;
  category_ids: string[];
  range_usd: string;
  notes: string;
};

export type StatutoryDamagesBank = {
  version: string;
  disclaimer: string;
  entries: StatutoryDamagesEntry[];
};

let CACHE: StatutoryDamagesBank | null = null;

export function carregarStatutoryDamagesReference(
  cwd = process.cwd()
): StatutoryDamagesBank | null {
  if (CACHE) return CACHE;
  const path = join(
    cwd,
    "src",
    "lib",
    "relatorio-templates",
    "dados",
    "statutory-damages-reference.json"
  );
  if (!existsSync(path)) return null;
  try {
    CACHE = JSON.parse(readFileSync(path, "utf8")) as StatutoryDamagesBank;
    return CACHE;
  } catch {
    return null;
  }
}

export function entradasStatutoryPorCategoria(
  categoria: CategoriaPipeline | string,
  cwd = process.cwd()
): StatutoryDamagesEntry[] {
  const bank = carregarStatutoryDamagesReference(cwd);
  if (!bank) return [];
  return bank.entries.filter((e) => e.category_ids.includes(categoria));
}

export function formatarBlocoStatutoryDamagesMarkdown(
  categoria: CategoriaPipeline | string,
  cwd = process.cwd()
): string {
  const bank = carregarStatutoryDamagesReference(cwd);
  const entries = entradasStatutoryPorCategoria(categoria, cwd);
  const lines = [
    "### Statutory damages (normative reference)",
    "",
    bank?.disclaimer ??
      "Normative reference only — not a prediction of your case.",
    "",
  ];
  if (entries.length === 0) {
    lines.push(
      "_No statutory dollar range is catalogued for this category in the current reference file._"
    );
    return lines.join("\n");
  }
  for (const e of entries) {
    lines.push(`- **${e.statute}**: ${e.range_usd}`);
    if (e.notes.trim()) lines.push(`  - _${e.notes.trim()}_`);
  }
  return lines.join("\n");
}
