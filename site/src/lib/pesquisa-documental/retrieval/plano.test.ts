import { describe, expect, it } from "vitest";

import { resolverPlanoDocumental } from "@/lib/pesquisa-documental/retrieval/plano";

describe("retrieval/plano", () => {
  it("sem precedente comparável → sem cobrança", () => {
    const plano = resolverPlanoDocumental({
      qtdPrecedentes: 0,
      qtdFundamentos: 2,
      temPrecedenteComparavel: false,
    });
    expect(plano.tipo).toBe("sem_cobranca");
    if (plano.tipo === "sem_cobranca") {
      expect(plano.valor).toBe(0);
    }
  });

  it("2 precedentes → essencial R$ 49", () => {
    const plano = resolverPlanoDocumental({
      qtdPrecedentes: 2,
      qtdFundamentos: 2,
      temPrecedenteComparavel: true,
    });
    expect(plano.tipo).toBe("cobranca");
    if (plano.tipo === "cobranca") {
      expect(plano.faixa).toBe("essencial");
      expect(plano.valor).toBe(49);
    }
  });

  it("6 precedentes → completo R$ 119", () => {
    const plano = resolverPlanoDocumental({
      qtdPrecedentes: 6,
      qtdFundamentos: 3,
      temPrecedenteComparavel: true,
    });
    expect(plano.tipo).toBe("cobranca");
    if (plano.tipo === "cobranca") {
      expect(plano.faixa).toBe("completo");
      expect(plano.valor).toBe(119);
    }
  });
});
