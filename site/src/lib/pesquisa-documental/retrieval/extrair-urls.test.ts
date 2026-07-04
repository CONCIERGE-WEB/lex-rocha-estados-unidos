import { describe, expect, it } from "vitest";

import { extrairUrlsDeTexto } from "@/lib/pesquisa-documental/retrieval/extrair-urls";

describe("retrieval/extrair-urls", () => {
  it("extrai URLs únicas de texto colado", () => {
    const urls = extrairUrlsDeTexto(
      "Fonte: https://www.tjmt.jus.br/a e também https://www.tjmt.jus.br/a."
    );
    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain("tjmt.jus.br");
  });

  it("retorna vazio quando não há URL", () => {
    expect(extrairUrlsDeTexto("apenas texto sem link")).toEqual([]);
  });
});
