import { completarGroq } from "@/lib/groq";
import { promptTriagemSistema } from "@/lib/prompts/triagem-system";
import {
  CRITERIOS_PLANOS,
  type PlanoId,
} from "@/lib/triagem/criterios-planos";

export type NivelPrecedente = "forte" | "medio" | "fraco" | "nenhum";

export type ResultadoTriagem = {
  planoId: PlanoId;
  planoNome: string;
  preco: number;
  confianca: "alta" | "media" | "baixa";
  precedente: NivelPrecedente;
  casoFavoravel: boolean;
  resumo: string;
  justificativa: string;
  incluiNoPlano: string[];
  mensagemCliente: string;
};

type Entrada = {
  area: string;
  descricao: string;
};

function normalizarPlano(id: string): PlanoId {
  if (id === "essencial" || id === "padrao" || id === "completo") return id;
  return "padrao";
}

function normalizarPrecedente(v: string | undefined): NivelPrecedente {
  if (v === "forte" || v === "medio" || v === "fraco" || v === "nenhum") return v;
  return "medio";
}

function fallback(entrada: Entrada): ResultadoTriagem {
  const len = entrada.descricao.length;
  const planoId: PlanoId = len > 600 ? "completo" : len > 250 ? "padrao" : "essencial";
  const p = CRITERIOS_PLANOS[planoId];
  return {
    planoId,
    planoNome: p.nome,
    preco: p.preco,
    confianca: "media",
    precedente: "medio",
    casoFavoravel: len >= 120,
    resumo: entrada.descricao.slice(0, 120) + (entrada.descricao.length > 120 ? "…" : ""),
    justificativa: "Automatic triage by length and area (AI unavailable).",
    incluiNoPlano: p.inclui.slice(0, 3),
    mensagemCliente:
      `Based on your description, the ${p.nome} plan ($${p.preco}) covers the right level of analysis for your case.`,
  };
}

export async function analisarCaso(entrada: Entrada): Promise<ResultadoTriagem> {
  try {
    const raw = await completarGroq(
      [
        { role: "system", content: promptTriagemSistema() },
        {
          role: "user",
          content: `Area: ${entrada.area}\n\nClient description:\n${entrada.descricao}`,
        },
      ],
      { temperature: 0.25, maxTokens: 1000 }
    );

    const limpo = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(limpo) as {
      plano_id?: string;
      confianca?: string;
      precedente?: string;
      caso_favoravel?: boolean;
      resumo?: string;
      justificativa?: string;
      inclui_no_plano?: string[];
      mensagem_cliente?: string;
    };

    const precedente = normalizarPrecedente(parsed.precedente);
    let planoId = normalizarPlano(parsed.plano_id ?? "padrao");

    if (precedente === "fraco" || precedente === "nenhum") {
      planoId = "essencial";
    }

    const p = CRITERIOS_PLANOS[planoId];
    const conf =
      parsed.confianca === "alta" || parsed.confianca === "baixa"
        ? parsed.confianca
        : "media";

    const casoFavoravel =
      precedente === "nenhum" ? false : Boolean(parsed.caso_favoravel);

    return {
      planoId,
      planoNome: p.nome,
      preco: p.preco,
      confianca: conf,
      precedente,
      casoFavoravel,
      resumo: parsed.resumo?.trim() || entrada.descricao.slice(0, 100),
      justificativa: parsed.justificativa?.trim() || "",
      incluiNoPlano: Array.isArray(parsed.inclui_no_plano)
        ? parsed.inclui_no_plano.slice(0, 5)
        : p.inclui.slice(0, 3),
      mensagemCliente:
        parsed.mensagem_cliente?.trim() ||
        `The ${p.nome} plan ($${p.preco}) matches what you need for this case.`,
    };
  } catch {
    return fallback(entrada);
  }
}
