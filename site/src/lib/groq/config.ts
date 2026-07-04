import { GroqError } from "@/lib/groq/errors";

export function groqApiKey(): string {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) {
    throw new GroqError(
      "CONFIG_AUSENTE",
      "GROQ_API_KEY não configurada. Adicione em .env.local."
    );
  }
  return key;
}

export function groqModel(): string {
  const model = process.env.GROQ_MODEL?.trim();
  if (!model) {
    return "openai/gpt-oss-120b";
  }
  return model;
}

export const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
