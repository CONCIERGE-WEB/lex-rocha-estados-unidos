import { describe, expect, it } from "vitest";

import { RetrievalError } from "@/lib/pesquisa-documental/retrieval/errors";
import {
  assertCitacoesRelatorioValidas,
  validarCitacoesRelatorio,
} from "@/lib/pesquisa-documental/retrieval/validar-citacoes";

const URL_OK = "https://www.tjmt.jus.br/noticias/2026/caso";

describe("retrieval/validar-citacoes", () => {
  it("aceita relatório que só cita URLs do pacote", () => {
    const r = validarCitacoesRelatorio({
      conteudoRelatorio: `Precedente: ${URL_OK}`,
      urlsAutorizadas: [URL_OK],
    });
    expect(r.status).toBe("ok");
  });

  it("rejeita URL inventada fora do pacote", () => {
    const r = validarCitacoesRelatorio({
      conteudoRelatorio: "Fonte: https://www.tjpr.jus.br/outro-caso",
      urlsAutorizadas: [URL_OK],
    });
    expect(r.status).toBe("erro");
    if (r.status === "erro") {
      expect(r.urlsNaoAutorizadas.length).toBeGreaterThan(0);
    }
  });

  it("assertCitacoes lança RetrievalError", () => {
    expect(() =>
      assertCitacoesRelatorioValidas({
        conteudoRelatorio: "https://evil.test/x",
        urlsAutorizadas: [URL_OK],
      })
    ).toThrow(RetrievalError);
  });
});
