import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { classificarTriagemGroq } from "@/lib/groq/triagem";
import { GroqError } from "@/lib/groq/errors";
import { getPromptClassificadorTriagem } from "@/lib/constants/pesquisa-documental.ip.server";
import { triagemInputSchema } from "@/lib/validations/pesquisa-documental";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const entrada = triagemInputSchema.parse(body);
    const resultado = await classificarTriagemGroq(entrada, getPromptClassificadorTriagem());

    return NextResponse.json({
      triagem: resultado.triagem,
      modelo: resultado.modelo,
      api: "groq",
      tokens: resultado.tokens,
    });
  } catch (error) {
    console.error("[pesquisa-documental/triagem]", error);

    if (error instanceof ZodError) {
      return NextResponse.json({ erro: "Dados inválidos para triagem." }, { status: 400 });
    }

    if (error instanceof GroqError) {
      return NextResponse.json({ erro: error.message, codigo: error.codigo }, { status: 502 });
    }

    if (error instanceof Error && error.message.includes("pesquisa-documental.ip.json")) {
      return NextResponse.json(
        {
          erro:
            "Configuração de prompts ausente. Crie private/pesquisa-documental.ip.json a partir do example.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ erro: "Erro na classificação do caso." }, { status: 500 });
  }
}
