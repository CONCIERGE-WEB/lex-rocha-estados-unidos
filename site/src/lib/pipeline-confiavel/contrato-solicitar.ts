/**
 * Contrato /solicitar → extrator → pipeline (Rota A).
 * Texto livre extenso não entra no montador.
 */

import { existsSync } from "fs";
import { join } from "path";

import type { AreaProblema } from "@/lib/constants/pesquisa-documental";
import {
  CATEGORIA_LABELS,
  CATEGORIAS_COM_BANCO_MVP,
  type CategoriaComBancoMvp,
  type CategoriaPipeline,
  isCategoriaComBancoMvp,
  isCategoriaPipeline,
} from "@/lib/pipeline-confiavel/categorias";
import {
  extrairDadosCobranca,
  extrairDadosNegativacao,
  type DadosEstruturadosCliente,
} from "@/lib/pipeline-confiavel/extrator";
import { parseWizardSolicitacao } from "@/lib/pipeline-confiavel/schemas-formulario";

export { CATEGORIAS_COM_BANCO_MVP, type CategoriaComBancoMvp };


const AREA_POR_CATEGORIA: Record<CategoriaComBancoMvp, AreaProblema> = {
  negativacao_indevida: "Negativação indevida (SPC/Serasa)",
  cobranca_indevida: "Cobrança indevida/cartão/banco",
};

export function categoriaTemBancoArquivo(categoria: CategoriaPipeline): boolean {
  const path = join(
    process.cwd(),
    "src",
    "lib",
    "pipeline-confiavel",
    "banco",
    `${categoria}.json`
  );
  return existsSync(path);
}

export function mapCategoriaParaArea(categoria: CategoriaComBancoMvp): AreaProblema {
  return AREA_POR_CATEGORIA[categoria];
}

export function narrativaFactualParaArmazenamento(
  estruturado: DadosEstruturadosCliente
): string {
  const linhas = [
    `Categoria: ${estruturado.categoria_titulo} (${estruturado.categoria_id})`,
    `Solicitante: ${estruturado.nome_cliente}`,
    `Empresa: ${estruturado.empresa_envolvida}`,
    ...estruturado.linha_do_tempo.map((l) => `${l.rotulo}: ${l.valor}`),
    ...estruturado.valores.map((v) => `${v.rotulo}: R$ ${v.valorReais}`),
    ...Object.entries(estruturado.flags).map(([k, v]) => `${k}: ${v}`),
  ];
  return linhas.join("\n");
}

export type ResultadoContratoSolicitar =
  | {
      ok: true;
      categoria_id: CategoriaComBancoMvp;
      area: AreaProblema;
      descricao: string;
      estruturado: DadosEstruturadosCliente;
      nome: string;
      email: string;
      telefone?: string;
      cpf_cliente: string;
    }
  | { ok: false; erro: string };

/**
 * Valida payload do wizard Rota A e produz entrada para persistência + extrator.
 */
export function processarPayloadSolicitarPipeline(
  body: unknown
): ResultadoContratoSolicitar {
  const parsed = parseWizardSolicitacao(body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    return { ok: false, erro: msg || "Dados do formulário inválidos." };
  }

  const data = parsed.data;
  const categoria = data.categoria;
  if (!isCategoriaComBancoMvp(categoria)) {
    return {
      ok: false,
      erro: "Categoria ainda não disponível no informe de referência (MVP).",
    };
  }

  if (!isCategoriaPipeline(categoria) || !categoriaTemBancoArquivo(categoria)) {
    return {
      ok: false,
      erro: `Banco de precedentes ausente para a categoria ${categoria}.`,
    };
  }

  const cat = categoria;
  let estruturado: DadosEstruturadosCliente;

  if (cat === "negativacao_indevida") {
    const d = data as {
      nome_cliente: string;
      empresa_reclamada: string;
      data_negativacao: string;
      valor_negativado_centavos: number;
      ja_tentou_resolver_diretamente: boolean;
      canal_tentativa?: string;
      possui_comprovante_quitacao: boolean;
      motivo_alegado_pela_empresa?: string;
    };
    estruturado = extrairDadosNegativacao(d);
  } else {
    const d = data as {
      nome_cliente: string;
      empresa_reclamada: string;
      data_cobranca: string;
      valor_cobrado_centavos: number;
      tipo_cobranca: string;
      pagou_valor_cobrado: boolean;
      ja_tentou_resolver_diretamente: boolean;
      canal_tentativa?: string;
      outro_detalhe?: string;
    };
    estruturado = extrairDadosCobranca(d);
  }

  return {
    ok: true,
    categoria_id: cat,
    area: mapCategoriaParaArea(cat),
    descricao: narrativaFactualParaArmazenamento(estruturado),
    estruturado,
    nome: data.nome_cliente,
    email: data.email_cliente,
    telefone: data.telefone_cliente,
    cpf_cliente: data.cpf_cliente,
  };
}

export function labelCategoriaPipeline(id: CategoriaPipeline): string {
  return CATEGORIA_LABELS[id];
}
