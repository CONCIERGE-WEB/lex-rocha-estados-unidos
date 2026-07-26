import { describe, expect, it } from "vitest";

import type { EntradaBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/schemas";
import { carregarBancoPrecedentes } from "@/lib/pipeline-confiavel/banco/loader";
import {
  R3_DIVULGACAO_COMERCIAL,
  montarAlertaSignalHub,
  montarR2DoBanco,
  postDentroDaRecencia,
  r2DerivadoDoBanco,
  urlJaAlertada,
} from "@/lib/pipeline-confiavel/signalhub-alerta";

function entradaValidada(): EntradaBancoPrecedentes {
  const base = carregarBancoPrecedentes("negativacao_indevida");
  return { ...base, citacoes_conferidas: true, conferido_por: "Time Lex Rocha" };

}

describe("pipeline-confiavel/signalhub-alerta (Módulo 9)", () => {
  const agora = new Date("2026-07-03T12:00:00.000Z");

  it("R2 é palavra por palavra o texto_resumido do banco", () => {
    const entrada = entradaValidada();
    const r2 = montarR2DoBanco(entrada);
    expect(r2DerivadoDoBanco(r2, entrada)).toBe(true);
    for (const f of entrada.fundamentos_legais) {
      expect(r2).toContain(f.texto_resumido);
    }
  });

  it("citacoes_conferidas false nunca gera alerta", () => {
    const entrada = carregarBancoPrecedentes("negativacao_indevida");
    expect(entrada.citacoes_conferidas).toBe(false);
    const r = montarAlertaSignalHub({
      post: {
        url: "https://reddit.com/r/brasil/comments/abc",
        texto: "Fui negativado no SPC sem dever nada",
        publicadoEm: "2026-06-20T00:00:00.000Z",
      },
      historico: [],
      entradaBanco: entrada,
      categoriaForcada: "fcra_credit_reporting",
      agora,
    });
    expect(r.status).toBe("suprimido");
    if (r.status === "suprimido") {
      expect(r.motivo).toBe("citacoes_nao_conferidas");
    }
  });

  it("mesma URL duas vezes na janela de dedup: segundo alerta suprimido", () => {
    const entrada = entradaValidada();
    const post = {
      url: "https://www.reddit.com/r/brasil/comments/xyz/thread",
      texto: "Negativação indevida no Serasa",
      publicadoEm: "2026-06-20T00:00:00.000Z",
    };
    const primeiro = montarAlertaSignalHub({
      post,
      historico: [],
      entradaBanco: entrada,
      categoriaForcada: "fcra_credit_reporting",
      agora,
    });
    expect(primeiro.status).toBe("ok");

    const segundo = montarAlertaSignalHub({
      post,
      historico: [{ url: post.url, alertadoEm: "2026-07-01T00:00:00.000Z" }],
      entradaBanco: entrada,
      categoriaForcada: "fcra_credit_reporting",
      agora,
    });
    expect(segundo.status).toBe("suprimido");
    if (segundo.status === "suprimido") {
      expect(segundo.motivo).toBe("url_duplicada");
      expect(segundo.detalhe).toMatch(/já alertada/i);
    }
  });

  it("post antigo acima do limite de recência é descartado", () => {
    expect(
      postDentroDaRecencia({
        publicadoEm: "2018-01-01T00:00:00.000Z",
        recenciaMaxDias: 21,
        agora,
      })
    ).toBe(false);

    const r = montarAlertaSignalHub({
      post: {
        url: "https://reddit.com/r/brasil/comments/old",
        texto: "Negativado no SPC",
        publicadoEm: "2018-05-01T00:00:00.000Z",
      },
      historico: [],
      entradaBanco: entradaValidada(),
      categoriaForcada: "fcra_credit_reporting",
      agora,
      config: { recenciaMaxDias: 21, dedupJanelaDias: 30 },
    });
    expect(r.status).toBe("suprimido");
    if (r.status === "suprimido") expect(r.motivo).toBe("post_antigo");
  });

  it("R3 contém divulgação comercial explícita em 100% dos alertas ok", () => {
    const r = montarAlertaSignalHub({
      post: {
        url: "https://reddit.com/r/brasil/comments/novo",
        texto: "Meu nome foi para o Serasa indevidamente",
        publicadoEm: "2026-06-25T00:00:00.000Z",
      },
      historico: [],
      entradaBanco: entradaValidada(),
      categoriaForcada: "fcra_credit_reporting",
      agora,
    });
    expect(r.status).toBe("ok");
    if (r.status === "ok") {
      expect(r.r3).toBe(R3_DIVULGACAO_COMERCIAL);
      expect(r.r3.toLowerCase()).toContain("paid");
      expect(urlJaAlertada({
        url: "https://x.com/a",
        historico: [],
        dedupJanelaDias: 30,
      })).toBe(false);
    }
  });
});
