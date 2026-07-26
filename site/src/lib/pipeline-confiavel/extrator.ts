/**
 * Module 3 (Route A) — structured data extractor.
 * Structured transcription only; no legal interpretation.
 */

import type { CategoriaPipeline } from "@/lib/pipeline-confiavel/categorias";
import { CATEGORIA_LABELS } from "@/lib/pipeline-confiavel/categorias";
import { centavosParaUsd } from "@/lib/pipeline-confiavel/validacoes";

export type DadosEstruturadosCliente = {
  categoria_id: CategoriaPipeline;
  categoria_titulo: string;
  nome_cliente: string;
  empresa_envolvida: string;
  linha_do_tempo: { rotulo: string; valor: string }[];
  valores: { rotulo: string; valorReais: string; centavos: number }[];
  flags: Record<string, string>;
};

export function extrairDadosNegativacao(dados: {
  nome_cliente: string;
  empresa_reclamada: string;
  data_negativacao: string;
  valor_negativado_centavos: number;
  ja_tentou_resolver_diretamente: boolean;
  canal_tentativa?: string;
  possui_comprovante_quitacao: boolean;
  motivo_alegado_pela_empresa?: string;
}): DadosEstruturadosCliente {
  const categoria_id = "fcra_credit_reporting" as const;
  return {
    categoria_id,
    categoria_titulo: CATEGORIA_LABELS[categoria_id],
    nome_cliente: dados.nome_cliente,
    empresa_envolvida: dados.empresa_reclamada,
    linha_do_tempo: [
      { rotulo: "Reported credit-event date", valor: dados.data_negativacao },
    ],
    valores: [
      {
        rotulo: "Amount reported",
        valorReais: centavosParaUsd(dados.valor_negativado_centavos),
        centavos: dados.valor_negativado_centavos,
      },
    ],
    flags: {
      tentativa_resolucao: dados.ja_tentou_resolver_diretamente
        ? `yes${dados.canal_tentativa ? ` (${dados.canal_tentativa})` : ""}`
        : "no",
      comprovante_quitacao: dados.possui_comprovante_quitacao ? "yes" : "no",
      motivo_alegado: dados.motivo_alegado_pela_empresa?.trim() || "not provided",
    },
  };
}

export function extrairDadosCobranca(dados: {
  nome_cliente: string;
  empresa_reclamada: string;
  data_cobranca: string;
  valor_cobrado_centavos: number;
  tipo_cobranca: string;
  pagou_valor_cobrado: boolean;
  ja_tentou_resolver_diretamente: boolean;
  canal_tentativa?: string;
  outro_detalhe?: string;
}): DadosEstruturadosCliente {
  const categoria_id = "fdcpa_debt_collection" as const;
  return {
    categoria_id,
    categoria_titulo: CATEGORIA_LABELS[categoria_id],
    nome_cliente: dados.nome_cliente,
    empresa_envolvida: dados.empresa_reclamada,
    linha_do_tempo: [
      { rotulo: "Reported charge/collection date", valor: dados.data_cobranca },
    ],
    valores: [
      {
        rotulo: "Amount charged",
        valorReais: centavosParaUsd(dados.valor_cobrado_centavos),
        centavos: dados.valor_cobrado_centavos,
      },
    ],
    flags: {
      tipo_cobranca: dados.tipo_cobranca,
      pagou_valor_cobrado: dados.pagou_valor_cobrado ? "yes" : "no",
      tentativa_resolucao: dados.ja_tentou_resolver_diretamente
        ? `yes${dados.canal_tentativa ? ` (${dados.canal_tentativa})` : ""}`
        : "no",
      outro_detalhe: dados.outro_detalhe?.trim() || "none",
    },
  };
}

/** Generic structured extract for categories without a dedicated bank extractor yet. */
export function extrairDadosGenericosUs(dados: {
  categoria_id: CategoriaPipeline;
  nome_cliente: string;
  empresa_reclamada: string;
  data_evento: string;
  valor_centavos?: number | null;
  ja_tentou_resolver_diretamente: boolean;
  canal_tentativa?: string;
  flags?: Record<string, string | undefined>;
}): DadosEstruturadosCliente {
  const valores =
    typeof dados.valor_centavos === "number" && dados.valor_centavos > 0
      ? [
          {
            rotulo: "Amount involved",
            valorReais: centavosParaUsd(dados.valor_centavos),
            centavos: dados.valor_centavos,
          },
        ]
      : [];

  const flags: Record<string, string> = {
    tentativa_resolucao: dados.ja_tentou_resolver_diretamente
      ? `yes${dados.canal_tentativa ? ` (${dados.canal_tentativa})` : ""}`
      : "no",
  };
  for (const [k, v] of Object.entries(dados.flags ?? {})) {
    if (v != null && String(v).trim()) flags[k] = String(v).trim();
  }

  return {
    categoria_id: dados.categoria_id,
    categoria_titulo: CATEGORIA_LABELS[dados.categoria_id],
    nome_cliente: dados.nome_cliente,
    empresa_envolvida: dados.empresa_reclamada,
    linha_do_tempo: dados.data_evento
      ? [{ rotulo: "Reported event date", valor: dados.data_evento }]
      : [],
    valores,
    flags,
  };
}
