/**
 * Módulo 3 (Rota A) — extrator de dados estruturados.
 * Transcrição estruturada apenas; sem interpretação jurídica.
 */

import type { CategoriaPipeline } from "@/lib/pipeline-confiavel/categorias";
import { CATEGORIA_LABELS } from "@/lib/pipeline-confiavel/categorias";
import { centavosParaReais } from "@/lib/pipeline-confiavel/validacoes";

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
  const categoria_id = "negativacao_indevida" as const;
  return {
    categoria_id,
    categoria_titulo: CATEGORIA_LABELS[categoria_id],
    nome_cliente: dados.nome_cliente,
    empresa_envolvida: dados.empresa_reclamada,
    linha_do_tempo: [
      { rotulo: "Data da negativação informada", valor: dados.data_negativacao },
    ],
    valores: [
      {
        rotulo: "Valor informado",
        valorReais: centavosParaReais(dados.valor_negativado_centavos),
        centavos: dados.valor_negativado_centavos,
      },
    ],
    flags: {
      tentativa_resolucao: dados.ja_tentou_resolver_diretamente
        ? `sim${dados.canal_tentativa ? ` (${dados.canal_tentativa})` : ""}`
        : "não",
      comprovante_quitacao: dados.possui_comprovante_quitacao ? "sim" : "não",
      motivo_alegado: dados.motivo_alegado_pela_empresa?.trim() || "não informado",
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
  const categoria_id = "cobranca_indevida" as const;
  return {
    categoria_id,
    categoria_titulo: CATEGORIA_LABELS[categoria_id],
    nome_cliente: dados.nome_cliente,
    empresa_envolvida: dados.empresa_reclamada,
    linha_do_tempo: [
      { rotulo: "Data da cobrança informada", valor: dados.data_cobranca },
    ],
    valores: [
      {
        rotulo: "Valor cobrado informado",
        valorReais: centavosParaReais(dados.valor_cobrado_centavos),
        centavos: dados.valor_cobrado_centavos,
      },
    ],
    flags: {
      tipo_cobranca: dados.tipo_cobranca,
      pagou_valor_cobrado: dados.pagou_valor_cobrado ? "sim" : "não",
      tentativa_resolucao: dados.ja_tentou_resolver_diretamente
        ? `sim${dados.canal_tentativa ? ` (${dados.canal_tentativa})` : ""}`
        : "não",
      outro_detalhe: dados.outro_detalhe?.trim() || "não informado",
    },
  };
}

