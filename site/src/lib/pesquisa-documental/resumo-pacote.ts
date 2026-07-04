import type { PacotePesquisaDocumental } from "@/lib/pesquisa-documental/retrieval/schemas";

/** Resumo serializável do pacote para UI/API (sem trechos longos). */
export type ResumoPacotePesquisa = {
  montadoEm: string;
  plano: PacotePesquisaDocumental["plano"];
  qtdPrecedentes: number;
  qtdLegislacao: number;
  urlsAutorizadas: string[];
};

export function resumoPacoteParaApi(pacote: PacotePesquisaDocumental): ResumoPacotePesquisa {
  return {
    montadoEm: pacote.montadoEm,
    plano: pacote.plano,
    qtdPrecedentes: pacote.precedentes.length,
    qtdLegislacao: pacote.legislacao.length,
    urlsAutorizadas: pacote.urlsAutorizadas,
  };
}
