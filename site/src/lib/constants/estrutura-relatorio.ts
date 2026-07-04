/** Estrutura padrão do relatório entregue (site + PDF) */

export const TITULO_RELATORIO_PDF = "Relatório de Pesquisa de Jurisprudência";

export const AVISO_DESTAQUE_PDF =
  "Pesquisa documental de jurisprudência pública. Não constitui consultoria jurídica, parecer ou petição. Decisões processuais cabem exclusivamente a advogado(a) habilitado(a) na OAB.";

export const SECOES_RELATORIO_ORDEM = [
  "DESTINATÁRIO E FINALIDADE",
  "RESUMO EXECUTIVO DOS FATOS",
  "LINHA DO TEMPO",
  "FUNDAMENTOS JURÍDICOS APLICÁVEIS",
  "PRECEDENTES JURISPRUDENCIAIS IDENTIFICADOS",
  "SÍNTESE FINAL",
] as const;

/** Aliases de seções antigas (relatórios já gerados) */
export const ALIASES_SECAO: Record<string, (typeof SECOES_RELATORIO_ORDEM)[number]> = {
  "RESUMO DOS FATOS": "RESUMO EXECUTIVO DOS FATOS",
  "PRECEDENTES JURISPRUDENCIAIS IDENTIFICADOS": "PRECEDENTES JURISPRUDENCIAIS IDENTIFICADOS",
  "FUNDAMENTOS JURÍDICOS APLICÁVEIS": "FUNDAMENTOS JURÍDICOS APLICÁVEIS",
  "CONSIDERAÇÕES FINAIS": "SÍNTESE FINAL",
  "SÍNTESE PARA REUNIÃO COM ADVOGADO(A)": "SÍNTESE FINAL",
};

/** Parágrafo padrão sobre OAB — síntese e relatórios (neutro, sem recomendar ação). */
export const PARAGRAFO_LIMITE_OAB_SINTESE =
  "Cada situação é diferente. Saber se esses precedentes se aplicam ao seu caso e se faz sentido ingressar com uma ação na Justiça é análise de um(a) advogado(a) inscrito(a) na OAB. A Lex Rocha entrega apenas a pesquisa documental organizada neste relatório — não indica esse passo nem substitui essa avaliação.";

/** Instruções para a seção final em prompts de geração. */
export function instrucoesPromptSinteseFinal(): string {
  return `4. SÍNTESE FINAL (título alternativo aceito: CONSIDERAÇÕES FINAIS)
(Resumo claro do que a pesquisa documentou em casos semelhantes aos fatos narrados: o que tribunais costumaram decidir, com quais fundamentos legais e quais resultados nas decisões públicas consultadas — ex.: restabelecimento de serviço, indenização quando constar nas decisões.
Linguagem descritiva da pesquisa, em português acessível. Não concluir sobre o mérito do caso do solicitante, não prever resultado nem recomendar contratar advogado(a) ou ajuizar ação.
Encerrar informando, em linguagem natural, que avaliar se os precedentes se aplicam ao caso específico e se cabe ingressar com uma ação na Justiça é atribuição de advogado(a) inscrito(a) na OAB, sem pressionar esse passo.)`;
}

export function textoDestinatarioFinalidade(referenciaInterna?: string): string {
  const ref = referenciaInterna?.trim()
    ? `identificado internamente como "${referenciaInterna.trim()}".`
    : "identificado pela referência deste relatório.";

  return (
    `Relatório de pesquisa documental sobre o caso do solicitante ${ref}\n\n` +
    "Organizamos, em linguagem clara, os fatos narrados, fundamentos legais frequentes em demandas similares e precedentes públicos com fonte para conferência. " +
    "O documento é apenas informativo: não indicamos se deve contratar advogado(a), ajuizar ação ou qualquer outro passo — essa decisão é exclusivamente sua."
  );
}

export function normalizarTituloSecao(titulo: string): string {
  const limpo = titulo
    .replace(/^\d+\.\s*/, "")
    .replace(/\*+/g, "")
    .trim()
    .toUpperCase();
  return ALIASES_SECAO[limpo] ?? limpo;
}

export function parseSecoesRelatorio(conteudo: string): Map<string, string> {
  const mapa = new Map<string, string>();
  const texto = conteudo.replace(/^---[\s\S]*?---\s*/m, "").trim();

  const regex =
    /(?:^|\n)(?:\d+\.\s*)?([A-ZÁÉÍÓÚÃÕÂÊÔÇ][A-ZÁÉÍÓÚÃÕÂÊÔÇ0-9\s()\/\-–—]+?)\s*\n([\s\S]*?)(?=(?:\n(?:\d+\.\s*)?[A-ZÁÉÍÓÚÃÕÂÊÔÇ][A-ZÁÉÍÓÚÃÕÂÊÔÇ0-9\s()\/\-–—]{8,}\s*\n)|$)/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(texto)) !== null) {
    const titulo = normalizarTituloSecao(match[1] ?? "");
    const corpo = (match[2] ?? "").trim();
    if (titulo.length >= 8 && corpo.length > 0) {
      mapa.set(titulo, corpo);
    }
  }

  if (mapa.size === 0) {
    mapa.set("CONTEÚDO DA PESQUISA", texto);
  }

  return mapa;
}

export function limparMarkdownPdf(texto: string): string {
  return texto
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^---$/gm, "")
    .trim();
}
