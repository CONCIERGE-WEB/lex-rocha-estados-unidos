import { describe, expect, it } from "vitest";

import {
  isAgregadorJurisprudencia,
  isFontePrimariaOficial,
  priorizarLinkOficial,
  resolverLinkOficialPreferido,
} from "@/lib/pipeline-confiavel/fontes-oficiais";

describe("pipeline-confiavel/fontes-oficiais (US)", () => {
  it("priorizes .gov / uscourts over legal aggregators", () => {
    const oficial = "https://www.ftc.gov/legal-library/browse/cases-proceedings";
    const agregador = "https://law.justia.com/cases/federal/appellate-courts/example";
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

  it("keeps link that is already official", () => {
    const oficial = "https://www.uscourts.gov/data-news/judiciary-news";
    const r = resolverLinkOficialPreferido(oficial, [
      "https://law.justia.com/other",
    ]);
    expect(r.trocouPorOficial).toBe(false);
    expect(r.link).toBe(oficial);
  });
});
