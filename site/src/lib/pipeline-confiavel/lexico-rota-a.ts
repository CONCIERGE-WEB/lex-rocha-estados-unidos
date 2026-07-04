/**
 * Rota A — linter de individualização (Módulo 5.1).
 * Determinístico: regex/lista, sem IA.
 * Bloqueia linguagem de consultoria individualizada (Lei 8.906/94).
 */

/** Sem \\b após acentos — em JS \\b não trata ê/ç como word-char. */
export const EXPRESSOES_PROIBIDAS_ROTA_A = [
  { id: "seu_caso", padrao: /seu caso/i },
  { id: "o_seu_caso", padrao: /o seu caso/i },
  { id: "seu_caso_se_enquadra", padrao: /seu caso se enquadra/i },
  { id: "voce_tem_direito", padrao: /voc[eê] tem direito/i },
  { id: "no_seu_caso", padrao: /no seu caso/i },
  { id: "recomendamos_que_voce", padrao: /recomendamos que voc[eê]/i },
  { id: "aconselhamos", padrao: /aconselhamos/i },
  { id: "nossa_orientacao", padrao: /nossa orienta[cç][aã]o/i },
  { id: "fundamento_do_seu_caso", padrao: /fundamento (jur[ií]dico )?do seu caso/i },
  { id: "aplicavel_ao_seu_caso", padrao: /aplic[aá]vel ao seu caso/i },
  { id: "parecer", padrao: /parecer/i },
  { id: "consultoria_juridica", padrao: /consultoria jur[ií]dica/i },
  { id: "assessoria_juridica", padrao: /assessoria jur[ií]dica/i },
  { id: "orientacao_juridica", padrao: /orienta[cç][aã]o jur[ií]dica/i },
  { id: "voce_vai_ganhar", padrao: /voc[eê] vai ganhar/i },
  { id: "sua_chance", padrao: /sua chance (é|e) de/i },
  { id: "probabilidade_de_ganhar", padrao: /probabilidade de ganhar/i },
  { id: "resultado_esperado", padrao: /resultado esperado/i },
] as const;

export const FORMULACOES_PERMITIDAS_ROTA_A = [
  "casos com fatos semelhantes aos relatados",
  "mesma categoria",
  "essa categoria costuma ser fundamentada",
  "tribunais decidiram historicamente",
  "dado estatístico observado nessa categoria",
  "panorama estatístico",
  "síntese informativa",
  "informe de referência",
  "resultado histórico observado nessa categoria",
] as const;

export type OcorrenciaLinter = {
  id: string;
  trecho: string;
  indice: number;
};

export type ResultadoLinterIndividualizacao = {
  status: "pass" | "fail";
  ocorrencias: OcorrenciaLinter[];
};

/**
 * Varre o texto por expressões proibidas.
 * Qualquer ocorrência → fail (bloqueia entrega).
 */
export function lintarIndividualizacao(
  texto: string
): ResultadoLinterIndividualizacao {
  const ocorrencias: OcorrenciaLinter[] = [];

  for (const item of EXPRESSOES_PROIBIDAS_ROTA_A) {
    const flags = item.padrao.flags.includes("g")
      ? item.padrao.flags
      : `${item.padrao.flags}g`;
    const re = new RegExp(item.padrao.source, flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(texto)) !== null) {
      ocorrencias.push({
        id: item.id,
        trecho: m[0],
        indice: m.index,
      });
    }
  }

  return {
    status: ocorrencias.length === 0 ? "pass" : "fail",
    ocorrencias,
  };
}

export function assertSemIndividualizacao(texto: string): void {
  const r = lintarIndividualizacao(texto);
  if (r.status === "fail") {
    const trechos = r.ocorrencias.map((o) => `"${o.trecho}" (${o.id})`).join(", ");
    throw new Error(
      `Linter Rota A: individualização indevida detectada: ${trechos}`
    );
  }
}

/** Prompt de sistema do montador (Módulo 4) — Rota A. */
export const PROMPT_SISTEMA_MONTAGEM_ROTA_A = `Você é um agente de montagem de relatórios informativos e estatísticos sobre categorias
de casos de consumo. Você NÃO presta consultoria, assessoria ou direção jurídica — essas
são atividades privativas de advogado inscrito na OAB (art. 1º e 3º, Lei 8.906/94), e
você não está autorizado a exercê-las, mesmo que solicitado. Sua função é análoga à de
uma plataforma de jurimetria: reportar padrões estatísticos e decisões públicas por
categoria, nunca aplicar direito ao fato individual de quem paga pelo relatório.

REGRA ESTRUTURAL (não estilística — é o que define a natureza do produto):
O sujeito de toda frase jurídica do relatório deve ser a CATEGORIA ou o conjunto de
"casos semelhantes", nunca o cliente individual. Se uma frase pode ser reescrita
trocando "essa categoria de casos" por "o seu caso" sem soar estranha, ela está
individualizando indevidamente e deve ser reescrita.

PROIBIDO (nunca gerar, em nenhuma variação ou sinônimo):
- "seu caso", "o seu caso se enquadra em", "você tem direito a", "no seu caso"
- "recomendamos que você", "aconselhamos", "nossa orientação é"
- "o fundamento do seu caso é", "aplicável ao seu caso"
- "parecer", "consultoria jurídica", "assessoria jurídica", "orientação jurídica"
- qualquer afirmação de resultado individual ("você vai ganhar", "sua chance é de X%")

OBRIGATÓRIO (formulações-padrão a usar):
- "casos com fatos semelhantes aos relatados (mesma categoria: [nome da categoria])"
- "essa categoria costuma ser fundamentada em [artigo/lei], conforme o banco de decisões consultado"
- "tribunais decidiram historicamente da seguinte forma em casos dessa categoria: ..."
- "dado estatístico observado nessa categoria: [percentual/faixa de valor], com base em [fonte]"

REGRAS DE FONTE:
1. Você SÓ pode citar número de processo, súmula, tribunal ou link que estejam
   literalmente presentes no JSON da categoria fornecido no contexto.
2. Estatísticas só podem vir do campo estatisticas do JSON.
3. Se o JSON não tiver dado suficiente, declare a limitação explicitamente.

USO DOS DADOS DO CLIENTE:
Os dados estruturados do cliente (nome, datas, valores, empresa) servem SOMENTE para
personalizar a narrativa factual introdutória. Eles NUNCA devem ser combinados com
fundamentos jurídicos para produzir uma conclusão sobre o caso específico.

SAÍDA OBRIGATÓRIA:
Ao final, gerar seção "Fontes para conferência" listando cada link_oficial usado,
copiado exatamente como está no JSON.`;
