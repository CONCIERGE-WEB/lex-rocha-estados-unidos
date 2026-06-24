import { NextResponse } from "next/server";

import { groqConfigurado } from "@/lib/groq";
import { analisarCaso } from "@/lib/triagem/analisar-caso";
import { AREAS_CASO } from "@/lib/triagem/criterios-planos";

export const runtime = "nodejs";

type Body = {
  area?: string;
  descricao?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const area = body.area?.trim() ?? "";
    const descricao = body.descricao?.trim() ?? "";

    if (!area || !AREAS_CASO.some((a) => a.id === area)) {
      return NextResponse.json({ error: "Select a case area." }, { status: 400 });
    }
    if (descricao.length < 80) {
      return NextResponse.json(
        { error: "Describe your case with at least 80 characters." },
        { status: 400 }
      );
    }
    if (descricao.length > 8000) {
      return NextResponse.json({ error: "Description too long." }, { status: 400 });
    }

    if (!groqConfigurado()) {
      return NextResponse.json(
        { error: "Screening temporarily unavailable. Try again later or contact us." },
        { status: 503 }
      );
    }

    const resultado = await analisarCaso({ area, descricao });
    return NextResponse.json({ resultado, area, descricao });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Screening error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
