import { GROQ_CHAT_COMPLETIONS_URL, groqApiKey, groqModel } from "@/lib/groq/config";
import { GroqError } from "@/lib/groq/errors";

export type GroqMessage = { role: "system" | "user"; content: string };

export type GroqCompletionResult = {
  texto: string;
  modelo: string;
  tokensEntrada: number;
  tokensSaida: number;
};

export type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

export async function groqChatCompletion(
  params: {
    system: string;
    user: string;
    maxTokens?: number;
    temperature?: number;
    jsonMode?: boolean;
  },
  fetchImpl: FetchFn = fetch
): Promise<GroqCompletionResult> {
  const apiKey = groqApiKey();
  const model = groqModel();

  const body: Record<string, unknown> = {
    model,
    max_tokens: params.maxTokens ?? 800,
    temperature: params.temperature ?? 0.2,
    messages: [
      { role: "system", content: params.system },
      { role: "user", content: params.user },
    ],
  };

  if (params.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  let response: Response;
  try {
    response = await fetchImpl(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new GroqError(
      "HTTP_ERRO",
      `Falha de rede na API Groq: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  if (!response.ok) {
    const detalhe = await response.text().catch(() => "");
    throw new GroqError(
      "HTTP_ERRO",
      `Groq HTTP ${response.status}${detalhe ? `: ${detalhe.slice(0, 200)}` : ""}`
    );
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const texto = json.choices?.[0]?.message?.content?.trim();
  if (!texto) {
    throw new GroqError("RESPOSTA_VAZIA", "Groq retornou resposta vazia.");
  }

  return {
    texto,
    modelo: model,
    tokensEntrada: json.usage?.prompt_tokens ?? 0,
    tokensSaida: json.usage?.completion_tokens ?? 0,
  };
}
