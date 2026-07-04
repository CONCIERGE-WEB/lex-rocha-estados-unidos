import { describe, expect, it } from "vitest";

import { montarPacotePesquisaDocumentalBasico } from "@/lib/pesquisa-documental/retrieval/montar-pacote";
import { montarBlocoPacoteParaClaude } from "@/lib/pesquisa-documental/retrieval/contexto-geracao";

describe("retrieval/contexto-geracao", () => {
  it("inclui URLs autorizadas e plano no bloco Claude", () => {
    const pacote = montarPacotePesquisaDocumentalBasico({
      precedentesTexto: "https://www.tjmt.jus.br/noticias/2026/x",
      fundamentosIds: ["cdc_14"],
    });
    const bloco = montarBlocoPacoteParaClaude(pacote);
    expect(bloco).toContain("PACOTE DE PESQUISA VALIDADO");
    expect(bloco).toContain("tjmt.jus.br");
    expect(bloco).toContain("não invente URL");
  });
});
