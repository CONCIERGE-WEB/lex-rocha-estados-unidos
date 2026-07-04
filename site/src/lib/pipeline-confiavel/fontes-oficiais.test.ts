import { describe, expect, it } from "vitest";

import {
  isAgregadorJurisprudencia,
  isFontePrimariaOficial,
  priorizarLinkOficial,
  resolverLinkOficialPreferido,
} from "@/lib/pipeline-confiavel/fontes-oficiais";

describe("pipeline-confiavel/fontes-oficiais", () => {
  it("prioriza tribunal/Planalto sobre Jusbrasil", () => {
    const oficial = "https://scon.stj.jus.br/SCON/sumstj/";
    const agregador =
      "https://www.jusbrasil.com.br/topicos/10601910/artigo-42-da-lei-n-8078";
    expect(isAgregadorJurisprudencia(agregador)).toBe(true);
    expect(isFontePrimariaOficial(oficial)).toBe(true);
    expect(
      priorizarLinkOficial({
        preferido: agregador,
        candidatoOficial: oficial,
      })
    ).toBe(oficial);

    const r = resolverLinkOficialPreferido(agregador, [oficial]);
    expect(r.trocouPorOficial).toBe(true);
    expect(r.link).toBe(oficial);
  });

  it("mantém link já oficial", () => {
    const oficial = "https://www.tjdft.jus.br/consultas/jurisprudencia/x";
    const r = resolverLinkOficialPreferido(oficial, [
      "https://www.jusbrasil.com.br/outro",
    ]);
    expect(r.trocouPorOficial).toBe(false);
    expect(r.link).toBe(oficial);
  });
});
