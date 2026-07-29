import type { EntradaBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/schemas";
import {
  numerosProcessoDoBanco,
  tribunaisDoBanco,
  urlsAutorizadasDoBanco,
} from "@/lib/pipeline-confiavel/banco/loader";

export type ItemVerificacao = {
  tipo: "url" | "numero_processo" | "tribunal";
  valor: string;
  status: "ok" | "falha";
};

export type ResultadoVerificacaoDeterministica = {
  status: "pass" | "fail";
  itens: ItemVerificacao[];
  motivosFalha: string[];
  verificadoEm: string;
};

function normalizarUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

function extrairUrls(texto: string): string[] {
  return texto.match(/https?:\/\/[^\s)\]>"']+/g) ?? [];
}

function extrairNumerosProcesso(texto: string): string[] {
  const encontrados = new Set<string>();
  const sumulas = texto.match(/\bSúmula\s+\d+\/STJ\b/gi) ?? [];
  for (const m of sumulas) encontrados.add(m);
  const cnjs = texto.match(/\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b/g) ?? [];
  for (const m of cnjs) encontrados.add(m);
  return Array.from(encontrados);
}

function extrairTribunaisCitados(
  texto: string,
  tribunaisBanco: string[]
): string[] {
  const citados: string[] = [];
  for (const t of tribunaisBanco) {
    const re = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(texto)) citados.push(t);
  }
  // Foreign BR courts (clone contamination / invented citations) — always fail if not in bank.
  // Never treat CNJ TPU / TJ* as valid U.S. authorities.
  for (const t of ["STF", "STJ", "TJSP", "TJRJ", "TJMG", "TJRS", "TJPR", "TJMT", "TJMA", "CNJ"]) {
    const re = new RegExp(`\\b${t}\\b`, "i");
    if (re.test(texto) && !tribunaisBanco.some((b) => b.toUpperCase() === t)) {
      citados.push(t);
    }
  }
  return Array.from(new Set(citados));
}

/**
 * Módulo 4 — verificação determinística (regex + comparação literal).
 * Não usa IA.
 */
export function verificarRascunhoContraBanco(params: {
  rascunho: string;
  entradaBanco: EntradaBancoPrecedentes;
  agora?: Date;
}): ResultadoVerificacaoDeterministica {
  const agora = params.agora ?? new Date();
  const urlsBanco = new Set(
    urlsAutorizadasDoBanco(params.entradaBanco).map(normalizarUrl)
  );
  const processosBanco = new Set(
    numerosProcessoDoBanco(params.entradaBanco).map((p) => p.toLowerCase())
  );
  const tribunaisBanco = tribunaisDoBanco(params.entradaBanco);
  const tribunaisBancoSet = new Set(tribunaisBanco.map((t) => t.toUpperCase()));

  const itens: ItemVerificacao[] = [];
  const motivosFalha: string[] = [];

  for (const url of extrairUrls(params.rascunho)) {
    const ok = urlsBanco.has(normalizarUrl(url));
    itens.push({ tipo: "url", valor: url, status: ok ? "ok" : "falha" });
    if (!ok) {
      motivosFalha.push(`URL não consta no banco curado: ${url}`);
    }
  }

  for (const num of extrairNumerosProcesso(params.rascunho)) {
    const ok = processosBanco.has(num.toLowerCase());
    itens.push({
      tipo: "numero_processo",
      valor: num,
      status: ok ? "ok" : "falha",
    });
    if (!ok) {
      motivosFalha.push(`Número/identificador processual não consta no banco: ${num}`);
    }
  }

  for (const tribunal of extrairTribunaisCitados(params.rascunho, tribunaisBanco)) {
    const ok = tribunaisBancoSet.has(tribunal.toUpperCase());
    itens.push({
      tipo: "tribunal",
      valor: tribunal,
      status: ok ? "ok" : "falha",
    });
    if (!ok) {
      motivosFalha.push(`Tribunal não consta no banco curado: ${tribunal}`);
    }
  }

  return {
    status: motivosFalha.length === 0 ? "pass" : "fail",
    itens,
    motivosFalha,
    verificadoEm: agora.toISOString(),
  };
}
