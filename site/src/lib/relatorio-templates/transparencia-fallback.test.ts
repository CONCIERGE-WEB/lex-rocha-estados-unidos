/**
 * Unit tests for irrevocable US transparency protocol.
 */
import { describe, expect, it } from "vitest";

import {
  MARCA_JUDICIAL_INTELLIGENCE,
  notaTransparenciaFallbackUs,
  rotuloSupportingCaseLaw,
} from "@/lib/relatorio-templates/transparencia-fallback";

describe("transparencia-fallback (US)", () => {
  it("lockup uses Judicial Intelligence | Tiago A. Rocha", () => {
    expect(MARCA_JUDICIAL_INTELLIGENCE).toBe(
      "Judicial Intelligence | Tiago A. Rocha"
    );
  });

  it("Supporting Case Law label is explicit", () => {
    expect(rotuloSupportingCaseLaw("ca")).toBe(
      "**Supporting Case Law - State/District CA**"
    );
  });

  it("fallback note covers sincerity + neutral cause + supporting label", () => {
    const nota = notaTransparenciaFallbackUs({
      stateCliente: "WY",
      stateUsado: "US",
      nivel: "federal",
    });
    expect(nota).toMatch(/Judicial Intelligence\s*\|\s*Tiago A\.\s*Rocha/);
    expect(nota).toMatch(/no identical public precedents were index-matched/i);
    expect(nota).toMatch(/out-of-court settlements|indexing latency|factual search/i);
    expect(nota).toMatch(/Supporting Case Law - State\/District US/);
  });
});
