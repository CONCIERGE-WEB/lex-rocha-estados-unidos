import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { gerarRelatorioPesquisaDocumental } from "@/lib/anthropic/pesquisa-documental";
import { resumoPacoteParaApi } from "@/lib/pesquisa-documental/resumo-pacote";
import { RetrievalError } from "@/lib/pesquisa-documental/retrieval";
import { pesquisaDocumentalSchema } from "@/lib/validations/pesquisa-documental";

export const runtime = "nodejs";

const gerarBodySchema = pesquisaDocumentalSchema.extend({
  enriquecerComFetch: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const dados = gerarBodySchema.parse(body);

    const resultado = await gerarRelatorioPesquisaDocumental(dados, {
      enriquecerComFetch: dados.enriquecerComFetch === true,
    });

    return NextResponse.json({
      conteudoGerado: resultado.conteudo,
      modeloIa: resultado.modelo,
      api: "claude",
      tokens: resultado.tokens,
      pacote: resumoPacoteParaApi(resultado.pacote),
    });
  } catch (error) {
    console.error("[pesquisa-documental/gerar]", error);

    if (error instanceof ZodError) {
      return NextResponse.json({ erro: "Dados inválidos para geração." }, { status: 400 });
    }

    if (error instanceof RetrievalError) {
      return NextResponse.json({ erro: error.message, codigo: error.codigo }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ erro: error.message }, { status: 503 });
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

    return NextResponse.json({ erro: "Erro ao gerar relatório." }, { status: 500 });
  }
}
