const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export function groqConfigurado(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

type Mensagem = { role: "system" | "user" | "assistant"; content: string };

export async function completarGroq(
  mensagens: Mensagem[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY ausente");
  }

  const model = process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: mensagens,
      temperature: opts?.temperature ?? 0.35,
      max_tokens: opts?.maxTokens ?? 4096,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Groq ${res.status}: ${txt.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const texto = data.choices?.[0]?.message?.content?.trim();
  if (!texto) {
    throw new Error("Groq devolveu resposta vazia");
  }
  return texto;
}
