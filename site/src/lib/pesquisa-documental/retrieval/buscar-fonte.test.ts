import { describe, expect, it, vi } from "vitest";

import { RetrievalError } from "@/lib/pesquisa-documental/retrieval/errors";
import { buscarFontePublica } from "@/lib/pesquisa-documental/retrieval/buscar-fonte";

const URL_PLANALTO = "https://www.planalto.gov.br/ccivil_03/leis/l8078.htm";

describe("retrieval/buscar-fonte", () => {
  it("rejeita domínio fora da allowlist antes do fetch", async () => {
    await expect(
      buscarFontePublica("https://evil.example/doc", vi.fn() as unknown as typeof fetch)
    ).rejects.toMatchObject({ codigo: "URL_NAO_PERMITIDA" });
  });

  it("busca fonte permitida e extrai texto", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("<html><body><p>Art. 14 CDC texto de teste suficiente para validação.</p></body></html>", {
        status: 200,
        headers: { "Content-Type": "text/html" },
      })
    );

    const resultado = await buscarFontePublica(URL_PLANALTO, fetchMock);
    expect(resultado.url).toBe(URL_PLANALTO);
    expect(resultado.trechoFonte).toContain("Art. 14");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("propaga HTTP_ERRO em status não-ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("", { status: 503 }));

    await expect(buscarFontePublica(URL_PLANALTO, fetchMock)).rejects.toBeInstanceOf(
      RetrievalError
    );
  });
});
