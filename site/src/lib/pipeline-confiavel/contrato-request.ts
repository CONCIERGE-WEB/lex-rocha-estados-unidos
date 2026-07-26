/**
 * Contract /request → extractor → pipeline (Route A).
 * Long free-text does not enter the assembler.
 * EN alias of the former contrato-solicitar module.
 */

import { existsSync } from "fs";
import { join } from "path";

import type { AreaProblema } from "@/lib/constants/pesquisa-documental";
import {
  CATEGORIA_LABELS,
  CATEGORIAS_COM_BANCO_MVP,
  normalizarCategoriaPipeline,
  stemBancoCategoria,
  type CategoriaComBancoMvp,
  type CategoriaPipeline,
  isCategoriaComBancoMvp,
  isCategoriaPipeline,
} from "@/lib/pipeline-confiavel/categorias";
import {
  extrairDadosCobranca,
  extrairDadosGenericosUs,
  extrairDadosNegativacao,
  type DadosEstruturadosCliente,
} from "@/lib/pipeline-confiavel/extrator";
import { parseWizardSolicitacao } from "@/lib/pipeline-confiavel/schemas-formulario";

export { CATEGORIAS_COM_BANCO_MVP, type CategoriaComBancoMvp };

const AREA_POR_CATEGORIA: Record<CategoriaComBancoMvp, AreaProblema> = {
  fcra_credit_reporting: "FCRA — credit reporting / inaccurate file",
  fdcpa_debt_collection: "FDCPA — debt collection / abusive practices",
  tcpa_robocalls: "TCPA — robocalls, spam texts & autodialers",
  lemon_law_warranty:
    "Lemon Law / Magnuson-Moss — vehicle & product warranty",
  udap_deceptive_practices: "UDAP — unfair & deceptive acts / junk fees",
  dot_flights_baggage: "DOT — flights, delays, baggage",
  health_plan_denial: "Health insurance denial / bad faith coverage",
};

export function categoriaTemBancoArquivo(categoria: CategoriaPipeline): boolean {
  const stem = stemBancoCategoria(categoria);
  const path = join(
    process.cwd(),
    "src",
    "lib",
    "pipeline-confiavel",
    "banco",
    `${stem}.json`
  );
  return existsSync(path);
}

export function mapCategoriaParaArea(categoria: CategoriaComBancoMvp): AreaProblema {
  return AREA_POR_CATEGORIA[categoria];
}

export function narrativaFactualParaArmazenamento(
  estruturado: DadosEstruturadosCliente,
  stateUs?: string
): string {
  const linhas = [
    `Category: ${estruturado.categoria_titulo} (${estruturado.categoria_id})`,
    `Requester: ${estruturado.nome_cliente}`,
    `Company: ${estruturado.empresa_envolvida}`,
    ...(stateUs ? [`State: ${stateUs}`] : []),
    ...estruturado.linha_do_tempo.map((l) => `${l.rotulo}: ${l.valor}`),
    ...estruturado.valores.map((v) => `${v.rotulo}: $${v.valorReais}`),
    ...Object.entries(estruturado.flags).map(([k, v]) => `${k}: ${v}`),
  ];
  return linhas.join("\n");
}

export type ResultadoContratoRequest =
  | {
      ok: true;
      categoria_id: CategoriaComBancoMvp;
      area: AreaProblema;
      descricao: string;
      estruturado: DadosEstruturadosCliente;
      nome: string;
      email: string;
      telefone?: string;
      state_us: string;
    }
  | { ok: false; erro: string };

/** @deprecated Use ResultadoContratoRequest */
export type ResultadoContratoSolicitar = ResultadoContratoRequest;

/**
 * Validates Route A wizard payload and produces persistence + extractor input.
 */
export function processarPayloadRequestPipeline(
  body: unknown
): ResultadoContratoRequest {
  const parsed = parseWizardSolicitacao(body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    return { ok: false, erro: msg || "Invalid form data." };
  }

  const data = parsed.data;
  const categoriaNorm = normalizarCategoriaPipeline(data.categoria);
  if (!categoriaNorm || !isCategoriaComBancoMvp(categoriaNorm)) {
    return {
      ok: false,
      erro: "Category not yet available in the reference bank (MVP).",
    };
  }

  if (!isCategoriaPipeline(categoriaNorm)) {
    return { ok: false, erro: "Invalid category." };
  }

  const cat = categoriaNorm;
  let estruturado: DadosEstruturadosCliente;

  if (cat === "fcra_credit_reporting") {
    const d = data as unknown as {
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
  } else if (cat === "fdcpa_debt_collection") {
    const d = data as unknown as {
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
  } else {
    const d = data as Record<string, unknown>;
    estruturado = extrairDadosGenericosUs({
      categoria_id: cat,
      nome_cliente: String(d.nome_cliente ?? ""),
      empresa_reclamada: String(d.empresa_reclamada ?? ""),
      data_evento: String(
        d.data_evento ??
          d.data_compra ??
          d.data_negativa ??
          d.data_cobranca ??
          ""
      ),
      valor_centavos:
        typeof d.valor_produto_centavos === "number"
          ? d.valor_produto_centavos
          : typeof d.valor_envolvido_centavos === "number"
            ? d.valor_envolvido_centavos
            : typeof d.valor_cobrado_centavos === "number"
              ? d.valor_cobrado_centavos
              : null,
      ja_tentou_resolver_diretamente: Boolean(d.ja_tentou_resolver_diretamente),
      canal_tentativa:
        typeof d.canal_tentativa === "string" ? d.canal_tentativa : undefined,
      flags: {
        problema: d.problema != null ? String(d.problema) : undefined,
        tipo: d.tipo != null ? String(d.tipo) : undefined,
        tipo_contato: d.tipo_contato != null ? String(d.tipo_contato) : undefined,
        tipo_pratica: d.tipo_pratica != null ? String(d.tipo_pratica) : undefined,
        outro_detalhe:
          d.outro_detalhe != null ? String(d.outro_detalhe) : undefined,
      },
    });
  }

  return {
    ok: true,
    categoria_id: cat,
    area: mapCategoriaParaArea(cat),
    descricao: narrativaFactualParaArmazenamento(estruturado, data.state_us),
    estruturado,
    nome: data.nome_cliente,
    email: data.email_cliente,
    telefone: data.telefone_cliente,
    state_us: data.state_us,
  };
}

/** @deprecated Prefer processarPayloadRequestPipeline */
export function processarPayloadSolicitarPipeline(
  body: unknown
): ResultadoContratoRequest {
  return processarPayloadRequestPipeline(body);
}

export function labelCategoriaPipeline(id: CategoriaPipeline): string {
  return CATEGORIA_LABELS[id];
}
