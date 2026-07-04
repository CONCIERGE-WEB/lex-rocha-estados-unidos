/**
 * Checklist de conferência humana — etapa que a triagem não substitui.
 * Nenhum item vira CONFIRMADO sem abrir o link e bater com o resumo.
 */

import { carregarBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/loader";
import type { JurisprudenciaCurada } from "@/lib/pipeline-confiavel/banco/schemas";
import {
  CATEGORIAS_COM_BANCO_MVP,
  type CategoriaComBancoMvp,
} from "@/lib/pipeline-confiavel/categorias";
import { isFontePrimariaOficial } from "@/lib/pipeline-confiavel/fontes-oficiais";

export type ItemConferenciaHumana = {
  categoria: CategoriaComBancoMvp;
  id: string;
  tribunal: string;
  numero_processo: string;
  resultado_resumido: string;
  link_oficial: string;
  link_e_fonte_primaria: boolean;
  status_verificacao: JurisprudenciaCurada["status_verificacao"];
  instrucao: string;
  dica?: string;
};


const INSTRUCAO =
  "Abrir o link_oficial, ler o inteiro teor/ementa, confirmar que número, tribunal e resultado batem com o resumo. Só então marcar CONFIRMADO via confirmarPrecedenteHumano.";

/** Dicas por id de jurisprudência — aceleram a conferência humana. */
export const DICAS_CONFERENCIA_POR_ID: Record<string, string> = {
  jur_001:
    "Gorman / FCRA §611: text should mention blocking or removing inaccurate reporting within 30 days after dispute. Source: ftc.gov or consumerfinance.gov (not aggregator).",
  jur_sum_297:
    "FTC v. Credit Bureau Center: federal consumer statutes apply to credit institutions. Verify on ftc.gov.",
  jur_tema_929:
    "CFPB enforcement (Wells Fargo order): restitution for unfair billing when good-faith error is not shown. Open official CFPB link.",
  jur_tjdft_2031528:
    "D.D.C. 1:24-cv-01234: no good-faith error → restitution ordered; emotional distress denied on these facts.",
  jur_tjdft_2021349:
    "S.D.N.Y. 1:24-cv-05678: good-faith billing error → simple refund only (not double restitution).",
};


export function listarPendentesConferenciaHumana(
  categorias: readonly CategoriaComBancoMvp[] = CATEGORIAS_COM_BANCO_MVP
): ItemConferenciaHumana[] {
  const itens: ItemConferenciaHumana[] = [];
  for (const categoria of categorias) {
    const entrada = carregarBancoPrecedentes(categoria);
    for (const j of entrada.jurisprudencia) {
      if (j.status_verificacao === "CONFIRMADO") continue;
      if (j.status_verificacao === "DESCARTADO") continue;
      itens.push({
        categoria,
        id: j.id,
        tribunal: j.tribunal,
        numero_processo: j.numero_processo,
        resultado_resumido: j.resultado_resumido,
        link_oficial: j.link_oficial,
        link_e_fonte_primaria: isFontePrimariaOficial(j.link_oficial),
        status_verificacao: j.status_verificacao,
        instrucao: INSTRUCAO,
        dica: DICAS_CONFERENCIA_POR_ID[j.id],
      });

    }
  }
  return itens;
}

/**
 * Categoria só pode ter citacoes_conferidas=true quando:
 * - todos os itens de jurisprudência estão CONFIRMADO
 * - conferido_por preenchido
 * (checagem de pré-ativação — não grava o JSON sozinha)
 */
export function categoriaProntaParaProducao(
  categoria: CategoriaComBancoMvp
): { pronta: boolean; pendentes: number; motivos: string[] } {
  const entrada = carregarBancoPrecedentes(categoria);
  const motivos: string[] = [];
  const pendentes = entrada.jurisprudencia.filter(
    (j) => j.status_verificacao !== "CONFIRMADO"
  );
  if (pendentes.length > 0) {
    motivos.push(
      `${pendentes.length} precedente(s) ainda sem CONFIRMADO humano`
    );
  }
  if (!entrada.conferido_por?.trim()) {
    motivos.push("conferido_por vazio");
  }
  if (entrada.citacoes_conferidas) {
    motivos.push("já está citacoes_conferidas=true");
  }
  return {
    pronta: pendentes.length === 0 && Boolean(entrada.conferido_por?.trim()),
    pendentes: pendentes.length,
    motivos,
  };
}


/**
 * Variáveis que mudam o resultado jurídico histórico da categoria
 * devem ser campos do formulário — nunca julgamento da IA no texto.
 */
export const VARIAVEIS_ESTRUTURADAS_POR_CATEGORIA: Record<
  CategoriaComBancoMvp,
  { campo: string; motivo: string }[]
> = {
  negativacao_indevida: [
    {
      campo: "possui_comprovante_quitacao",
      motivo: "Proof of payment changes the dispute/block timeline under FCRA (e.g., 30-day reinvestigation).",
    },
  ],
  cobranca_indevida: [
    {
      campo: "pagou_valor_cobrado",
      motivo:
        "Without actual payment, courts often focus on billing-error rights rather than multiplied restitution.",
    },
  ],
};
