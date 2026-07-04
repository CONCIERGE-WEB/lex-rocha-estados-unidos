import { describe, expect, it } from "vitest";

import {
  secaoFinalConforme,
  textoContemTermoProibido,
} from "@/lib/pipeline-confiavel/termos-escopo";

describe("pipeline-confiavel/termos-escopo (Módulo 8)", () => {
  it("detecta termo parecer e aceita síntese informativa", () => {
    expect(textoContemTermoProibido("Este parecer recomenda")).toContain(
      "parecer"
    );
    expect(secaoFinalConforme("Síntese informativa")).toBe(true);
    expect(secaoFinalConforme("Parecer final")).toBe(false);
  });
});
