/**
 * Triagem automatizada de precedentes.
 * Classifica confiança (ALTA | MEDIA | BAIXA) — nunca declara "confirmado".
 * CONFIRMADO só via confirmarPrecedenteHumano().
 */

import { z } from "zod";

import { isFontePrimariaOficial } from "@/lib/pipeline-confiavel/fontes-oficiais";


export const PROMPT_SISTEMA_TRIAGEM_PRECEDENTES = `Você é um agente de triagem de precedentes judiciais. Sua função é CLASSIFICAR o nível
de confiança de um precedente candidato, nunca declarar que ele está "confirmado" ou
"correto" de forma definitiva — essa palavra final é sempre humana.

PARA CADA CANDIDATO, você deve:
1. Buscar e tentar acessar o link_fonte fornecido.
2. Extrair do texto acessado: número do processo, tribunal/câmara, data de julgamento,
   resultado (procedente/improcedente/parcial), valor de indenização se houver.
3. Comparar CAMPO A CAMPO com o resumo alegado que foi fornecido a você.
4. Classificar como ALTA, MÉDIA ou BAIXA conforme os critérios abaixo — nunca use uma
   palavra de confiança fora dessas três categorias.

CRITÉRIOS:
- ALTA: você acessou o texto integral na fonte primária (site do tribunal) e todos os
  campos batem exatamente.
- MÉDIA: você não acessou a fonte primária diretamente (paywall/indisponível), mas
  encontrou o mesmo processo, com ementa completa reproduzida, em uma fonte secundária
  íntegra — ou os campos batem apenas parcialmente na fonte primária.
- BAIXA: você só encontrou um resumo/trecho curto, não a decisão completa; ou encontrou
  mais de um processo com número parecido e não consegue distinguir com segurança qual é
  o correto; ou não encontrou o processo em nenhuma fonte.

REGRAS ABSOLUTAS:
- Se BAIXA, você recomenda descarte do candidato — nunca "descarte com ressalva" ou
  "aceitar mesmo assim".
- Você nunca infere ou completa um campo que não conseguiu verificar.
- Sua saída sempre inclui o link exato que você usou para chegar à classificação.

Formato de saída:
{
  "numero_processo": "...",
  "classificacao": "ALTA | MEDIA | BAIXA",
  "campos_conferidos": {"tribunal": true/false, "data": true/false, "resultado": true/false},
  "link_usado_na_verificacao": "...",
  "observacao": "texto curto, só se houver ambiguidade"
}`;

export type ClassificacaoConfianca = "ALTA" | "MEDIA" | "BAIXA";

export type StatusVerificacaoPrecedente =
  | "PENDENTE_CONFERENCIA_HUMANA"
  | "REVISAO_MANUAL_COMPLETA"
  | "DESCARTADO"
  | "CONFIRMADO";

export type CandidatoPrecedente = {
  tribunal: string;
  numero_processo: string;
  resumo_alegado: string;
  link_fonte: string;
  /** ISO YYYY-MM-DD, opcional — se ausente, campo data fica não conferido (não estimado). */
  data_julgamento?: string;
  /** Links secundários se a primária falhar (paywall/403). */
  links_secundarios?: string[];
};

export type CamposConferidos = {
  numero_processo: boolean;
  tribunal: boolean;
  data: boolean;
  resultado: boolean;
};

export type ResultadoTriagemPrecedente = {
  numero_processo: string;
  classificacao: ClassificacaoConfianca;
  campos_conferidos: CamposConferidos;
  link_usado_na_verificacao: string;
  observacao?: string;
  /** Roteamento — nunca CONFIRMADO aqui. */
  roteamento: Exclude<StatusVerificacaoPrecedente, "CONFIRMADO">;
  fonte_primaria_acessivel: boolean;
  texto_integral_aparente: boolean;
};

export const resultadoTriagemSchema = z.object({
  numero_processo: z.string().min(1),
  classificacao: z.enum(["ALTA", "MEDIA", "BAIXA"]),
  campos_conferidos: z.object({
    numero_processo: z.boolean(),
    tribunal: z.boolean(),
    data: z.boolean(),
    resultado: z.boolean(),
  }),
  link_usado_na_verificacao: z.string().url(),
  observacao: z.string().optional(),
  roteamento: z.enum([
    "PENDENTE_CONFERENCIA_HUMANA",
    "REVISAO_MANUAL_COMPLETA",
    "DESCARTADO",
  ]),
});

export type FetchTextoFn = (
  url: string
) => Promise<{ status: number; texto: string; urlFinal: string }>;

const FETCH_PADRAO: FetchTextoFn = async (url) => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: {
      Accept: "text/html,application/xhtml+xml,text/plain",
      "User-Agent": "Mozilla/5.0 (compatible; LexRocha-Triagem/1.0)",
    },
    redirect: "follow",
  });
  const texto = await response.text();
  return {
    status: response.status,
    texto,
    urlFinal: response.url || url,
  };
};

function normalizarTexto(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}


function numeroProcessoNoTexto(texto: string, numero: string): boolean {
  const norm = texto.replace(/\s/g, "");
  const alvo = numero.replace(/\s/g, "");
  return norm.includes(alvo);
}

function tribunalNoTexto(texto: string, tribunal: string): boolean {
  const n = normalizarTexto(texto);
  const t = normalizarTexto(tribunal);
  return n.includes(t);
}

function dataNoTexto(texto: string, iso?: string): boolean | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return null;
  const variantes = [
    iso,
    `${d}/${m}/${y}`,
    `${d}-${m}-${y}`,
    `${d}.${m}.${y}`,
    `${y}${m}${d}`,
  ];
  const n = texto.replace(/\s/g, "");
  return variantes.some((v) => n.includes(v.replace(/\s/g, "")));
}

/** Tokens de resultado extraídos do resumo alegado (sem inventar). */
export function tokensResultadoDoResumo(resumo: string): string[] {
  const n = normalizarTexto(resumo);
  const candidatos = [
    "procedente",
    "improcedente",
    "parcialmente procedente",
    "em dobro",
    "repeticao em dobro",
    "restituicao simples",
    "devolucao simples",
    "dano moral",
    "indenizacao",
    "engano justificavel",
    "sumula",
    "restitution ordered",
    "restitution",
    "emotional distress",
    "simple refund",
    "good-faith",
    "good faith",
    "billing error",
  ];
  return candidatos.filter((c) => n.includes(c));
}

function resultadoBate(texto: string, resumo: string): boolean {
  const tokens = tokensResultadoDoResumo(resumo);
  if (tokens.length === 0) return false;
  const n = normalizarTexto(texto);
  const hits = tokens.filter((t) => n.includes(t)).length;
  return hits >= Math.min(2, tokens.length);
}

function pareceTextoIntegral(texto: string, status: number): boolean {
  if (status !== 200) return false;
  const limpo = texto.replace(/<[^>]+>/g, " ").trim();
  // Heurística: ementa/acórdão costuma ter corpo longo
  return limpo.length >= 800;
}

function pareceFontePrimaria(url: string): boolean {
  return isFontePrimariaOficial(url);
}


function classificarERotear(params: {
  campos: CamposConferidos;
  fontePrimaria: boolean;
  textoIntegral: boolean;
  acessivel: boolean;
}): Pick<
  ResultadoTriagemPrecedente,
  "classificacao" | "roteamento" | "observacao"
> {
  const { campos, fontePrimaria, textoIntegral, acessivel } = params;
  const obrigatoriosOk =
    campos.numero_processo && campos.tribunal && campos.resultado;
  // data false means we had a date to check and it failed
  const dataFalhou = campos.data === false;

  if (!acessivel || !campos.numero_processo) {
    return {
      classificacao: "BAIXA",
      roteamento: "DESCARTADO",
      observacao: "Processo não localizado ou fonte inacessível.",
    };
  }

  if (fontePrimaria && textoIntegral && obrigatoriosOk && !dataFalhou) {
    return {
      classificacao: "ALTA",
      roteamento: "PENDENTE_CONFERENCIA_HUMANA",
    };
  }

  if (obrigatoriosOk && (textoIntegral || !fontePrimaria)) {
    return {
      classificacao: "MEDIA",
      roteamento: "REVISAO_MANUAL_COMPLETA",
      observacao: fontePrimaria
        ? "Campos batem parcialmente ou texto integral incerto na primária."
        : "Fonte primária indisponível; conferência em fonte secundária.",
    };
  }

  if (campos.numero_processo && (campos.tribunal || campos.resultado)) {
    return {
      classificacao: "MEDIA",
      roteamento: "REVISAO_MANUAL_COMPLETA",
      observacao: "Bate parcial — revisão humana completa.",
    };
  }

  return {
    classificacao: "BAIXA",
    roteamento: "DESCARTADO",
    observacao: "Evidência insuficiente — descarte automático.",
  };
}

/**
 * Triagem determinística (fetch + comparação campo a campo).
 * Não usa IA para classificar; o prompt exportado é para uso assistido opcional
 * com o mesmo schema de saída.
 */
export async function triarPrecedenteCandidato(
  candidato: CandidatoPrecedente,
  fetchTexto: FetchTextoFn = FETCH_PADRAO
): Promise<ResultadoTriagemPrecedente> {
  const urls = [
    candidato.link_fonte,
    ...(candidato.links_secundarios ?? []),
  ];

  let melhor:
    | {
        status: number;
        texto: string;
        urlFinal: string;
        /** True só se a URL solicitada como link_fonte primária respondeu 200. */
        primariaSolicitadaOk: boolean;
      }
    | undefined;

  let primariaSolicitadaOk = false;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const ehLinkFonteOriginal = i === 0;
    try {
      const r = await fetchTexto(url);
      const primariaHost = pareceFontePrimaria(r.urlFinal);
      if (
        ehLinkFonteOriginal &&
        r.status === 200 &&
        primariaHost &&
        pareceTextoIntegral(r.texto, r.status)
      ) {
        primariaSolicitadaOk = true;
        melhor = { ...r, primariaSolicitadaOk: true };
        break;
      }
      if (!melhor) {
        melhor = {
          ...r,
          primariaSolicitadaOk: ehLinkFonteOriginal && r.status === 200 && primariaHost,
        };
      }
      if (r.status === 200 && r.texto.length > (melhor.texto?.length ?? 0)) {
        melhor = {
          ...r,
          primariaSolicitadaOk:
            ehLinkFonteOriginal && r.status === 200 && primariaHost,
        };
      }
      if (
        ehLinkFonteOriginal &&
        r.status === 200 &&
        primariaHost &&
        pareceTextoIntegral(r.texto, r.status)
      ) {
        primariaSolicitadaOk = true;
      }
    } catch {
      // tenta próxima URL
    }
  }


  if (!melhor) {
    return {
      numero_processo: candidato.numero_processo,
      classificacao: "BAIXA",
      campos_conferidos: {
        numero_processo: false,
        tribunal: false,
        data: false,
        resultado: false,
      },
      link_usado_na_verificacao: candidato.link_fonte,
      observacao: "Falha de rede ao acessar fontes.",
      roteamento: "DESCARTADO",
      fonte_primaria_acessivel: false,
      texto_integral_aparente: false,
    };
  }

  const acessivel = melhor.status === 200 && melhor.texto.length > 40;
  const textoPlano = melhor.texto.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ");
  const dataCheck = dataNoTexto(textoPlano, candidato.data_julgamento);

  const campos: CamposConferidos = {
    numero_processo: numeroProcessoNoTexto(
      textoPlano,
      candidato.numero_processo
    ),
    tribunal: tribunalNoTexto(textoPlano, candidato.tribunal),
    data: dataCheck === null ? true : dataCheck, // sem data alegada: não falha o campo
    resultado: resultadoBate(textoPlano, candidato.resumo_alegado),
  };

  // Se data não foi fornecida, marcar como não conferida sem inventar
  if (candidato.data_julgamento === undefined) {
    campos.data = false;
  } else if (dataCheck === false) {
    campos.data = false;
  } else if (dataCheck === true) {
    campos.data = true;
  }

  const textoIntegral = pareceTextoIntegral(textoPlano, melhor.status);
  const fontePrimariaOk =
    primariaSolicitadaOk || melhor.primariaSolicitadaOk;
  const { classificacao, roteamento, observacao } = classificarERotear({
    campos: {
      ...campos,
      // para ALTA, se não havia data no candidato, não exigir data
      data:
        candidato.data_julgamento === undefined ? true : campos.data,
    },
    fontePrimaria: fontePrimariaOk && melhor.status === 200,
    textoIntegral,
    acessivel: acessivel && campos.numero_processo,
  });


  // Recalcular data no output honesto: se não havia data, reportar false (não conferido)
  const camposSaida: CamposConferidos = {
    ...campos,
    data:
      candidato.data_julgamento === undefined ? false : campos.data,
  };

  const resultado: ResultadoTriagemPrecedente = {
    numero_processo: candidato.numero_processo,
    classificacao,
    campos_conferidos: camposSaida,
    link_usado_na_verificacao: melhor.urlFinal,
    roteamento,
    fonte_primaria_acessivel: fontePrimariaOk && melhor.status === 200,
    texto_integral_aparente: textoIntegral,
  };
  if (observacao) resultado.observacao = observacao;

  // Schema público (sem CONFIRMADO no roteamento)
  resultadoTriagemSchema.parse({
    numero_processo: resultado.numero_processo,
    classificacao: resultado.classificacao,
    campos_conferidos: resultado.campos_conferidos,
    link_usado_na_verificacao: resultado.link_usado_na_verificacao,
    observacao: resultado.observacao,
    roteamento: resultado.roteamento,
  });

  if (resultado.roteamento === ("CONFIRMADO" as string)) {
    throw new Error("Triagem não pode emitir status CONFIRMADO.");
  }

  return resultado;
}


/**
 * Única forma de chegar a CONFIRMADO: humano abriu o link e confirmou.
 */
export function confirmarPrecedenteHumano(params: {
  resultadoTriagem: ResultadoTriagemPrecedente;
  confirmadoPor: string;
  linkAbertoPeloHumano: string;
  agora?: Date;
}): {
  status_verificacao: "CONFIRMADO";
  verificado_por: string;
  data_verificacao_link: string;
  link_usado_na_verificacao: string;
} {
  if (!params.confirmadoPor.trim()) {
    throw new Error("confirmadoPor é obrigatório.");
  }
  if (
    params.resultadoTriagem.roteamento === "DESCARTADO" ||
    params.resultadoTriagem.classificacao === "BAIXA"
  ) {
    throw new Error(
      "Precedente com confiança BAIXA/DESCARTADO não pode ser confirmado."
    );
  }
  const linkTriagem = params.resultadoTriagem.link_usado_na_verificacao;
  if (
    params.linkAbertoPeloHumano.trim().toLowerCase() !==
    linkTriagem.trim().toLowerCase()
  ) {
    throw new Error(
      "O link aberto pelo humano deve ser exatamente o link_usado_na_verificacao da triagem."
    );
  }
  const agora = params.agora ?? new Date();
  const data = agora.toISOString().slice(0, 10);
  return {
    status_verificacao: "CONFIRMADO",
    verificado_por: params.confirmadoPor.trim(),
    data_verificacao_link: data,
    link_usado_na_verificacao: linkTriagem,
  };
}

export function podeEntrarNoBancoComoPendente(
  r: ResultadoTriagemPrecedente
): boolean {
  return r.roteamento === "PENDENTE_CONFERENCIA_HUMANA";
}
