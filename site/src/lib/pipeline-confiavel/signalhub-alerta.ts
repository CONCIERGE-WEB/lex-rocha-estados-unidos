/**
 * Módulo 9 — montagem de alertas SignalHub-BR a partir do banco curado.
 * R2 nunca é gerado por IA livre: só texto_resumido do banco.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

import { carregarBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/loader";
import type { EntradaBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/schemas";
import {
  CATEGORIAS_PIPELINE,
  type CategoriaPipeline,
  isCategoriaPipeline,
} from "@/lib/pipeline-confiavel/categorias";

export const R3_DIVULGACAO_COMERCIAL =
  "Judicial Intelligence is a paid legal research service for cases like this. If you want, https://www.judicialintelligence.com/solicitar";

export type ConfigSignalHubAlerta = {
  recenciaMaxDias: number;
  dedupJanelaDias: number;
};

export function carregarConfigSignalHubAlerta(
  env: NodeJS.ProcessEnv = process.env
): ConfigSignalHubAlerta {
  return {
    recenciaMaxDias: Number(env.SIGNALHUB_RECENCIA_MAX_DIAS ?? "21"),
    dedupJanelaDias: Number(env.SIGNALHUB_DEDUP_JANELA_DIAS ?? "30"),
  };
}

export type PostPublico = {
  url: string;
  texto: string;
  publicadoEm: string; // ISO
};

export type RegistroDedup = { url: string; alertadoEm: string };

export type ResultadoMontagemAlerta =
  | {
      status: "ok";
      categoria: CategoriaPipeline;
      r1: string;
      r2: string;
      r3: string;
    }
  | {
      status: "suprimido";
      motivo:
        | "categoria_nao_mapeada"
        | "citacoes_nao_conferidas"
        | "post_antigo"
        | "url_duplicada";
      detalhe: string;
    };

/** Classificador determinístico por palavras-chave (sem IA). */
export function classificarCategoriaPost(
  texto: string
): CategoriaPipeline | null {
  const t = texto.toLowerCase();
  const regras: { categoria: CategoriaPipeline; termos: string[] }[] = [
    {
      categoria: "negativacao_indevida",
      termos: ["negativ", "spc", "serasa", "nome sujo", "cadastro de inadimpl"],
    },
    {
      categoria: "cobranca_indevida",
      termos: ["cobrança indevida", "cobranca indevida", "cobrado indevid"],
    },
    {
      categoria: "cancelamento_nao_efetivado",
      termos: ["cancelei", "cancelamento", "continua cobrando", "após cancel"],
    },
    {
      categoria: "produto_defeito_atraso",
      termos: ["defeito", "não entreg", "nao entreg", "atraso na entrega", "produto veio"],
    },
    {
      categoria: "fraude_conta_digital",
      termos: ["golpe", "fraude", "conta hackeada", "bloqueou minha conta"],
    },
    {
      categoria: "plano_seguro_negativa",
      termos: ["plano de saúde", "plano de saude", "negou cobertura", "seguro negou"],
    },
    {
      categoria: "score_credito",
      termos: ["score", "score de crédito", "score de credito"],
    },
  ];

  let melhor: { categoria: CategoriaPipeline; hits: number } | null = null;
  for (const r of regras) {
    const hits = r.termos.filter((term) => t.includes(term)).length;
    if (hits === 0) continue;
    if (!melhor || hits > melhor.hits) {
      melhor = { categoria: r.categoria, hits };
    }
  }
  // Exige pelo menos 1 termo; confiança mínima = 1 hit
  return melhor && melhor.hits >= 1 ? melhor.categoria : null;
}

export function postDentroDaRecencia(params: {
  publicadoEm: string;
  recenciaMaxDias: number;
  agora?: Date;
}): boolean {
  const pub = new Date(params.publicadoEm);
  if (Number.isNaN(pub.getTime())) return false;
  const agora = params.agora ?? new Date();
  const diffMs = agora.getTime() - pub.getTime();
  const dias = diffMs / (1000 * 60 * 60 * 24);
  return dias >= 0 && dias <= params.recenciaMaxDias;
}

export function urlJaAlertada(params: {
  url: string;
  historico: RegistroDedup[];
  dedupJanelaDias: number;
  agora?: Date;
}): boolean {
  const agora = params.agora ?? new Date();
  const norm = normalizarUrl(params.url);
  for (const h of params.historico) {
    if (normalizarUrl(h.url) !== norm) continue;
    const alertado = new Date(h.alertadoEm);
    const dias =
      (agora.getTime() - alertado.getTime()) / (1000 * 60 * 60 * 24);
    if (dias <= params.dedupJanelaDias) return true;
  }
  return false;
}

function normalizarUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

/**
 * R2 = concatenação literal dos texto_resumido do banco (sem IA).
 */
export function montarR2DoBanco(entrada: EntradaBancoPrecedentes): string {
  return entrada.fundamentos_legais.map((f) => f.texto_resumido).join(" ");
}

export function montarR1Acolhimento(): string {
  return "Entendo a frustração com essa situação — é bem comum em relações de consumo.";
}

export function montarR3Comercial(): string {
  return R3_DIVULGACAO_COMERCIAL;
}

export function montarAlertaSignalHub(params: {
  post: PostPublico;
  historico: RegistroDedup[];
  config?: ConfigSignalHubAlerta;
  agora?: Date;
  /** Override para testes (entrada com citacoes_conferidas controlado). */
  entradaBanco?: EntradaBancoPrecedentes;
  categoriaForcada?: CategoriaPipeline;
}): ResultadoMontagemAlerta {
  const config = params.config ?? carregarConfigSignalHubAlerta();
  const agora = params.agora ?? new Date();

  const categoria =
    params.categoriaForcada ?? classificarCategoriaPost(params.post.texto);
  if (!categoria || !isCategoriaPipeline(categoria)) {
    return {
      status: "suprimido",
      motivo: "categoria_nao_mapeada",
      detalhe: "Post não mapeou para nenhuma categoria com confiança suficiente.",
    };
  }

  let entrada: EntradaBancoPrecedentes;
  try {
    entrada = params.entradaBanco ?? carregarBancoPrecedentes(categoria);
  } catch {
    return {
      status: "suprimido",
      motivo: "categoria_nao_mapeada",
      detalhe: `Banco ausente para categoria ${categoria}.`,
    };
  }

  // Bloqueio absoluto: citacoes_conferidas false nunca gera alerta (produção ou não).
  if (!entrada.citacoes_conferidas) {
    return {
      status: "suprimido",
      motivo: "citacoes_nao_conferidas",
      detalhe: `Categoria ${categoria} com citacoes_conferidas=false (bloqueio absoluto no SignalHub).`,
    };
  }

  if (
    !postDentroDaRecencia({
      publicadoEm: params.post.publicadoEm,
      recenciaMaxDias: config.recenciaMaxDias,
      agora,
    })
  ) {
    return {
      status: "suprimido",
      motivo: "post_antigo",
      detalhe: `Post fora da recência de ${config.recenciaMaxDias} dias.`,
    };
  }

  if (
    urlJaAlertada({
      url: params.post.url,
      historico: params.historico,
      dedupJanelaDias: config.dedupJanelaDias,
      agora,
    })
  ) {
    return {
      status: "suprimido",
      motivo: "url_duplicada",
      detalhe: `URL já alertada na janela de ${config.dedupJanelaDias} dias.`,
    };
  }

  const r2 = montarR2DoBanco(entrada);
  return {
    status: "ok",
    categoria,
    r1: montarR1Acolhimento(),
    r2,
    r3: montarR3Comercial(),
  };
}

/** Persistência simples em arquivo (estado local do bot). */
export function caminhoEstadoDedup(cwd = process.cwd()): string {
  return join(cwd, "signalhub-br", "logs", "alertas-dedup.json");
}

export function carregarHistoricoDedup(path = caminhoEstadoDedup()): RegistroDedup[] {
  if (!existsSync(path)) return [];
  try {
    const bruto = JSON.parse(readFileSync(path, "utf-8")) as unknown;
    if (!Array.isArray(bruto)) return [];
    return bruto as RegistroDedup[];
  } catch {
    return [];
  }
}

export function gravarAlertaDedup(params: {
  url: string;
  historico: RegistroDedup[];
  path?: string;
  agora?: Date;
}): RegistroDedup[] {
  const path = params.path ?? caminhoEstadoDedup();
  const novo: RegistroDedup = {
    url: params.url,
    alertadoEm: (params.agora ?? new Date()).toISOString(),
  };
  const atualizado = [...params.historico, novo];
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(atualizado, null, 2), "utf-8");
  return atualizado;
}

export function r2DerivadoDoBanco(
  r2: string,
  entrada: EntradaBancoPrecedentes
): boolean {
  const esperado = montarR2DoBanco(entrada);
  return r2 === esperado;
}

export { CATEGORIAS_PIPELINE };
