import { describe, expect, it, vi } from "vitest";

import { classificarTriagemGroq } from "@/lib/groq/triagem";

const PROMPT_MIN = "Retorne JSON com classificacao_interna e analise_fatores.";

const TRIAGEM_OK = {
  classificacao_interna: {
    area: "Consumo digital",
    subarea: "Plataformas",
    grau_urgencia: "VERDE" as const,
  },
  analise_fatores: {
    complexidade: "medio" as const,
    faixa_estimada_causa: "MEDIO_VALOR" as const,
    via_sugerida_referencia_interna: "Juizado Especial Cível (referência interna)",
    risco_prescricao_evidente: false,
  },
  resumo_estruturado_fatos: "Cliente relata bloqueio reiterado de conta em plataforma digital.",
};

describe("groq/triagem", () => {
  it("valida JSON da Groq com Zod", async () => {
    process.env.GROQ_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify(TRIAGEM_OK) } }],
          usage: { prompt_tokens: 100, completion_tokens: 80 },
        }),
        { status: 200 }
      )
    );

    const r = await classificarTriagemGroq(
      {
        area: "Bloqueio/suspensão de conta digital",
        fatos: "Conta bloqueada sem motivo claro após uso normal do serviço contratado.",
      },
      PROMPT_MIN,
      { fetchImpl: fetchMock }
    );

    expect(r.triagem.classificacao_interna.grau_urgencia).toBe("VERDE");
    expect(r.modelo).toBeTruthy();
  });

  it("rejeita JSON fora do schema", async () => {
    process.env.GROQ_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: '{"invalido":true}' } }],
          usage: { prompt_tokens: 1, completion_tokens: 1 },
        }),
        { status: 200 }
      )
    );

    await expect(
      classificarTriagemGroq(
        { area: "Outro", fatos: "x".repeat(25) },
        PROMPT_MIN,
        { fetchImpl: fetchMock }
      )
    ).rejects.toMatchObject({ codigo: "TRIAGEM_INVALIDA" });
  });
});
