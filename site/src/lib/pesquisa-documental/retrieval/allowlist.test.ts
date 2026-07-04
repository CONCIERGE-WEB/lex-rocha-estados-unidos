import { describe, expect, it } from "vitest";

import {
  assertUrlPermitidaParaRetrieval,
  hostPermitidoParaRetrieval,
  normalizarUrlParaComparacao,
  urlPermitidaParaRetrieval,
} from "@/lib/pesquisa-documental/retrieval/allowlist";
import { RetrievalError } from "@/lib/pesquisa-documental/retrieval/errors";

describe("retrieval/allowlist", () => {
  it("aceita domínios oficiais cadastrados", () => {
    expect(urlPermitidaParaRetrieval("https://www.tjmt.jus.br/noticias/2026")).toBe(true);
    expect(urlPermitidaParaRetrieval("https://www.planalto.gov.br/ccivil_03/leis/l8078.htm")).toBe(
      true
    );
    expect(urlPermitidaParaRetrieval("https://www.jusbrasil.com.br/jurisprudencia/tj-pr/1")).toBe(
      true
    );
    expect(hostPermitidoParaRetrieval("www.gov.br")).toBe(true);
  });

  it("rejeita domínios fora da allowlist", () => {
    expect(urlPermitidaParaRetrieval("https://example.com/caso")).toBe(false);
    expect(urlPermitidaParaRetrieval("https://reddit.com/r/direito")).toBe(false);
  });

  it("assertUrlPermitida lança RetrievalError explícito", () => {
    expect(() => assertUrlPermitidaParaRetrieval("https://evil.test/x")).toThrow(RetrievalError);
    try {
      assertUrlPermitidaParaRetrieval("https://evil.test/x");
    } catch (e) {
      expect(e).toBeInstanceOf(RetrievalError);
      expect((e as RetrievalError).codigo).toBe("URL_NAO_PERMITIDA");
    }
  });

  it("normaliza URL para comparação de citações", () => {
    const a = normalizarUrlParaComparacao("https://www.stj.jus.br/path/");
    const b = normalizarUrlParaComparacao("https://www.stj.jus.br/path");
    expect(a).toBe(b);
  });
});
