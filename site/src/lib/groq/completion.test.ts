import { describe, expect, it, vi } from "vitest";

import { groqChatCompletion } from "@/lib/groq/completion";
import { GroqError } from "@/lib/groq/errors";

describe("groq/completion", () => {
  it("falha explícita sem GROQ_API_KEY", async () => {
    const prev = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;
    await expect(
      groqChatCompletion({ system: "s", user: "u" }, vi.fn() as unknown as typeof fetch)
    ).rejects.toMatchObject({ codigo: "CONFIG_AUSENTE" });
    process.env.GROQ_API_KEY = prev;
  });

  it("parseia resposta da API", async () => {
    process.env.GROQ_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: '{"ok":true}' } }],
          usage: { prompt_tokens: 10, completion_tokens: 5 },
        }),
        { status: 200 }
      )
    );

    const r = await groqChatCompletion(
      { system: "sys", user: "usr", jsonMode: true },
      fetchMock
    );
    expect(r.texto).toContain("ok");
    expect(r.tokensEntrada).toBe(10);
  });

  it("HTTP não-ok lança GroqError", async () => {
    process.env.GROQ_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue(new Response("erro", { status: 429 }));
    await expect(
      groqChatCompletion({ system: "s", user: "u" }, fetchMock)
    ).rejects.toBeInstanceOf(GroqError);
  });
});
