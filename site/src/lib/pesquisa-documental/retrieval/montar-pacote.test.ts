import { describe, expect, it, vi } from "vitest";

import { RetrievalError } from "@/lib/pesquisa-documental/retrieval/errors";
import {
  enriquecerPacoteComFetch,
  montarPacotePesquisaDocumentalBasico,
} from "@/lib/pesquisa-documental/retrieval/montar-pacote";

const URL_TJ = "https://www.tjmt.jus.br/noticias/2026/caso-teste";

describe("retrieval/montar-pacote", () => {
  it("monta pacote com precedente e legislação", () => {
    const pacote = montarPacotePesquisaDocumentalBasico({
      precedentesTexto: `TJMT — bloqueio WhatsApp\n${URL_TJ}`,
      fundamentosIds: ["cdc_14", "marco_20"],
    });

    expect(pacote.precedentes).toHaveLength(1);
    expect(pacote.legislacao.length).toBeGreaterThanOrEqual(2);
    expect(pacote.plano.tipo).toBe("cobranca");
    expect(pacote.urlsAutorizadas).toContain(URL_TJ);
  });

  it("sem URL válida lança PACOTE_INVALIDO", () => {
    expect(() =>
      montarPacotePesquisaDocumentalBasico({
        precedentesTexto: "nenhum link aqui",
        fundamentosIds: [],
      })
    ).toThrow(RetrievalError);
  });

  it("enriquecerComFetch anexa trecho e data", async () => {
    const basico = montarPacotePesquisaDocumentalBasico({
      precedentesTexto: URL_TJ,
      fundamentosIds: ["cdc_14"],
    });

    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Response(
          "<html><body><p>Conteúdo oficial de teste com tamanho suficiente para validação do parser.</p></body></html>",
          { status: 200 }
        )
    );

    const enriquecido = await enriquecerPacoteComFetch(basico, fetchMock);
    expect(enriquecido.precedentes[0]?.trechoFonte).toContain("Conteúdo oficial");
    expect(enriquecido.precedentes[0]?.consultadoEm).toBeTruthy();
  });
});
