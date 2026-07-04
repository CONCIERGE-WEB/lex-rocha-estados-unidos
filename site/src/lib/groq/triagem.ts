import {
  resultadoTriagemSchema,
  type ResultadoTriagem,
} from "@/lib/constants/pesquisa-documental";
import { type FetchFn, groqChatCompletion } from "@/lib/groq/completion";
import { GroqError } from "@/lib/groq/errors";
import type { triagemInputSchema } from "@/lib/validations/pesquisa-documental";
import type { z } from "zod";

export type EntradaTriagemGroq = z.infer<typeof triagemInputSchema>;

export type ResultadoTriagemGroq = {
  triagem: ResultadoTriagem;
  modelo: string;
  tokens: { entrada: number; saida: number };
};

function extrairJsonObjeto(texto: string): unknown {
  const trimmed = texto.trim();
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new GroqError("JSON_INVALIDO", "Groq não retornou JSON válido para triagem.");
    }
    try {
      return JSON.parse(match[0]) as unknown;
    } catch {
      throw new GroqError("JSON_INVALIDO", "Groq retornou JSON malformado na triagem.");
    }
  }
}

export async function classificarTriagemGroq(
  entrada: EntradaTriagemGroq,
  promptSistema: string,
  opcoes?: { fetchImpl?: FetchFn }
): Promise<ResultadoTriagemGroq> {
  const system = promptSistema;

  const user = `Área selecionada pelo operador: ${entrada.area}

Fatos narrados (sem PII):
${entrada.fatos}

Responda APENAS com um objeto JSON válido conforme o schema indicado no prompt de sistema.`;

  const completion = await groqChatCompletion(
    {
      system,
      user,
      jsonMode: true,
      maxTokens: 900,
      temperature: 0.15,
    },
    opcoes?.fetchImpl
  );

  const bruto = extrairJsonObjeto(completion.texto);
  const parsed = resultadoTriagemSchema.safeParse(bruto);

  if (!parsed.success) {
    throw new GroqError(
      "TRIAGEM_INVALIDA",
      `Triagem Groq fora do schema esperado: ${parsed.error.message}`
    );
  }

  return {
    triagem: parsed.data,
    modelo: completion.modelo,
    tokens: { entrada: completion.tokensEntrada, saida: completion.tokensSaida },
  };
}
