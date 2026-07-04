/**
 * Módulo 8 — delimitação de escopo (Rota A).
 * Não é texto jurídico final — revisar com profissional habilitado antes de publicar.
 */

import { BLOCO_FONTES_POLITICA_ESTENDIDO } from "@/lib/pipeline-confiavel/blocos-fontes-fixos";

export { BLOCO_FONTES_POLITICA_ESTENDIDO };

export const DIRETRIZES_ESCOPO_SERVICO = {
  natureza: "informativo_estatistico",
  rota: "A",
  evitaTermos: [
    "parecer",
    "consultoria jurídica",
    "assessoria jurídica",
    "orientação jurídica",
    "garantia de resultado",
    "seu caso se enquadra",
    "você tem direito",
  ] as const,
  formulacoesRecomendadas: [
    "O relatório é informativo: organiza fundamentos e estatísticas de decisões públicas por categoria de caso.",
    "Não individualiza aconselhamento jurídico nem garante resultado.",
    "Casos com fatos semelhantes aos relatados (mesma categoria) são o objeto do panorama — não o enquadramento individual do solicitante.",
    "Recomenda-se a conferência dos links oficiais indicados antes de qualquer decisão.",
    "A seção final deve usar 'síntese informativa' ou 'panorama estatístico'.",
  ] as const,
  secaoFinalPermitida: "síntese informativa",
  secaoFinalProibida: "parecer",
} as const;

export function textoContemTermoProibido(texto: string): string[] {
  const lower = texto.toLowerCase();
  return DIRETRIZES_ESCOPO_SERVICO.evitaTermos.filter((t) =>
    lower.includes(t.toLowerCase())
  ) as unknown as string[];
}

export function secaoFinalConforme(tituloSecao: string): boolean {
  const t = tituloSecao.toLowerCase();
  if (t.includes(DIRETRIZES_ESCOPO_SERVICO.secaoFinalProibida)) return false;
  return (
    t.includes("síntese") ||
    t.includes("sintese") ||
    t.includes("informativ") ||
    t.includes("panorama") ||
    t.includes("estatíst") ||
    t.includes("estatist")
  );
}
