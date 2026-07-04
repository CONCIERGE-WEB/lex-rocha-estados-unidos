import { describe, expect, it } from "vitest";

import {
  assertCitacoesRelatorioValidas,
  montarBlocoPacoteParaClaude,
  montarPacotePesquisaDocumentalBasico,
} from "@/lib/pesquisa-documental/retrieval";

describe("retrieval integração geração", () => {
  const URL = "https://www.tjpr.jus.br/jurisprudencia/123";

  it("fluxo pacote → contexto Claude → validação de citações", () => {
    const pacote = montarPacotePesquisaDocumentalBasico({
      precedentesTexto: `Caso TJPR\n${URL}`,
      fundamentosIds: ["cdc_14"],
    });

    const bloco = montarBlocoPacoteParaClaude(pacote);
    expect(bloco).toContain(URL);

    const relatorioOk = `## PRECEDENTES\nFonte: ${URL}`;
    expect(() =>
      assertCitacoesRelatorioValidas({
        conteudoRelatorio: relatorioOk,
        urlsAutorizadas: pacote.urlsAutorizadas,
      })
    ).not.toThrow();

    const relatorioRuim = "Fonte inventada: https://www.tjsp.jus.br/fake";
    expect(() =>
      assertCitacoesRelatorioValidas({
        conteudoRelatorio: relatorioRuim,
        urlsAutorizadas: pacote.urlsAutorizadas,
      })
    ).toThrow();
  });
});
