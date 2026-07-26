import { readFileSync } from "fs";
import { join } from "path";

import type { CategoriaPipeline } from "@/lib/pipeline-confiavel/categorias";
import {
  normalizarCategoriaPipeline,
  stemBancoCategoria,
} from "@/lib/pipeline-confiavel/categorias";
import {
  entradaBancoPrecedentesSchema,
  type EntradaBancoPrecedentes,
} from "@/lib/pipeline-confiavel/banco/schemas";

const CACHE = new Map<CategoriaPipeline, EntradaBancoPrecedentes>();

/**
 * Carrega entrada do banco curado (arquivo versionado).
 * Nunca escrito por IA em tempo de execução.
 */
export function carregarBancoPrecedentes(
  categoria: CategoriaPipeline | string
): EntradaBancoPrecedentes {
  const cat = normalizarCategoriaPipeline(categoria);
  if (!cat) {
    throw new Error(`Categoria de banco desconhecida: "${categoria}"`);
  }
  const cached = CACHE.get(cat);
  if (cached) return cached;

  const stem = stemBancoCategoria(cat);
  const path = join(
    process.cwd(),
    "src",
    "lib",
    "pipeline-confiavel",
    "banco",
    `${stem}.json`
  );

  let bruto: unknown;
  try {
    bruto = JSON.parse(readFileSync(path, "utf-8")) as unknown;
  } catch {
    throw new Error(
      `Banco de precedentes ausente para categoria "${cat}". Arquivo esperado: ${path}`
    );
  }

  const parsed = entradaBancoPrecedentesSchema.safeParse(bruto);
  if (!parsed.success) {
    throw new Error(
      `Banco de precedentes inválido para "${cat}": ${parsed.error.message}`
    );
  }

  CACHE.set(cat, parsed.data);
  return parsed.data;
}

/** Apenas para testes — limpa cache em memória. */
export function limparCacheBancoPrecedentes(): void {
  CACHE.clear();
}

export function urlsAutorizadasDoBanco(
  entrada: EntradaBancoPrecedentes
): string[] {
  const urls: string[] = [];
  for (const f of entrada.fundamentos_legais) {
    if (f.link_oficial) urls.push(f.link_oficial);
  }
  for (const j of entrada.jurisprudencia) {
    urls.push(j.link_oficial);
  }
  return urls;
}

export function numerosProcessoDoBanco(
  entrada: EntradaBancoPrecedentes
): string[] {
  return entrada.jurisprudencia.map((j) => j.numero_processo);
}

export function tribunaisDoBanco(entrada: EntradaBancoPrecedentes): string[] {
  return entrada.jurisprudencia.map((j) => j.tribunal);
}
