import { describe, expect, it } from "vitest";

import {
  contarVolumeCorpusCategoria,
  textoSeloVolume,
} from "@/lib/fontes-us/corpus-volume";
import { resolverCorpusComFallbackFederal } from "@/lib/fontes-us/corpus-loader";
import {
  disponibilidadeCategoria,
  nivelJurisdicaoCategoria,
} from "@/lib/pipeline-confiavel/jurisdicao-categorias";
import { tierDoPlano } from "@/lib/stripe/checkout-meta";

describe("checkout-meta tiers", () => {
  it("maps Essential/Standard/Premium to API tiers", () => {
    expect(tierDoPlano("essencial")).toBe("basic");
    expect(tierDoPlano("padrao")).toBe("pro");
    expect(tierDoPlano("completo")).toBe("enterprise");
    expect(tierDoPlano("nope")).toBeNull();
  });
});

describe("jurisdiction map", () => {
  it("marks DOT/FCRA/FDCPA/TCPA/Health as federal", () => {
    expect(nivelJurisdicaoCategoria("dot_flights_baggage")).toBe("federal");
    expect(nivelJurisdicaoCategoria("fcra_credit_reporting")).toBe("federal");
    expect(nivelJurisdicaoCategoria("health_plan_denial")).toBe("federal");
  });

  it("marks Lemon Law and UDAP as state-specific", () => {
    expect(nivelJurisdicaoCategoria("lemon_law_warranty")).toBe("estadual");
    expect(nivelJurisdicaoCategoria("udap_deceptive_practices")).toBe("estadual");
  });

  it("marks only DOT and Health as Live", () => {
    expect(disponibilidadeCategoria("dot_flights_baggage")).toBe("live");
    expect(disponibilidadeCategoria("health_plan_denial")).toBe("live");
    expect(disponibilidadeCategoria("tcpa_robocalls")).toBe("extended");
  });
});

describe("state-category fallback labeling", () => {
  it("does not silently treat federal cell as neighbor lemon-law statute", () => {
    const r = resolverCorpusComFallbackFederal("lemon_law_warranty", "WY");
    if (r.usado === "US" && r.notaFallback) {
      expect(r.notaFallback.toLowerCase()).toMatch(
        /neighbor|not the lemon|ucc|state-specific|statute/
      );
    }
  });
});

describe("corpus volume (honest unique opinions)", () => {
  it("counts unique cluster_ids for DOT (not inflated cell sums)", () => {
    const stats = contarVolumeCorpusCategoria("dot_flights_baggage");
    expect(stats).not.toBeNull();
    expect(stats!.uniqueOpinions).toBeGreaterThan(0);
    expect(stats!.uniqueOpinions).toBeLessThanOrEqual(stats!.cellTotalSum);
    expect(stats!.jurisdictionsWithItems).toBeGreaterThan(0);
    const badge = textoSeloVolume(stats!);
    expect(badge).toMatch(/CourtListener/);
    expect(badge).not.toMatch(/1,000\+/);
  });

  it("counts unique cluster_ids for health denial", () => {
    const stats = contarVolumeCorpusCategoria("health_plan_denial");
    expect(stats).not.toBeNull();
    expect(stats!.uniqueOpinions).toBeGreaterThan(0);
  });
});
