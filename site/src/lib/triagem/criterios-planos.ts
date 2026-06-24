import { PLANOS } from "@/lib/constants/empresa";

/** Public criteria — mirror what the site promises in each plan */
export const CRITERIOS_PLANOS = {
  essencial: {
    id: "essencial" as const,
    nome: "Essential",
    preco: 29,
    ideal_para:
      "Relatively simple situation, one clear problem, few parties involved.",
    inclui: [
      "Your case explained in plain language",
      "Up to 2 public decisions in similar cases",
      "Estimated timelines and amounts",
      "Suggested next steps",
    ],
    nao_inclui: [
      "Detailed timeline of multiple events",
      "Extended comparative value overview",
      "More than 2 in-depth precedents",
    ],
  },
  padrao: {
    id: "padrao" as const,
    nome: "Standard",
    preco: 39,
    ideal_para:
      "Case with some complexity, several related issues, or significant amount in dispute.",
    inclui: [
      "In-depth case analysis",
      "3 to 5 public decisions in similar cases",
      "Position traffic light (strong / moderate / difficult)",
      "Detailed timeline and amount estimates",
    ],
    nao_inclui: [
      "Detailed multi-party timeline",
      "Extensive report for complex litigation",
    ],
  },
  completo: {
    id: "completo" as const,
    nome: "Complete",
    preco: 59,
    ideal_para:
      "Situation with multiple phases, multiple entities, high amounts in dispute, or need for rigorous timeline.",
    inclui: [
      "Detailed report with timeline",
      "Extended precedent overview",
      "Complete position and probability analysis",
      "Estimated court and out-of-court timelines",
    ],
    nao_inclui: ["Legal representation or court action"],
  },
} as const;

export type PlanoId = keyof typeof CRITERIOS_PLANOS;

export const AREAS_CASO = [
  { id: "compras_online", label: "Online shopping / retail" },
  { id: "telecom", label: "Telecom / internet / cable" },
  { id: "energia", label: "Utilities (electric, gas, water)" },
  { id: "banco", label: "Bank / credit card / lending" },
  { id: "seguros", label: "Insurance" },
  { id: "viagens", label: "Travel / transportation" },
  { id: "habitacao", label: "Housing / HOA / landlord" },
  { id: "saude", label: "Healthcare / pharmacies" },
  { id: "outro", label: "Other (consumer)" },
] as const;

export function planoPorId(id: string) {
  return PLANOS.find((p) => p.id === id) ?? PLANOS[1];
}

export function textoCriteriosParaIA(): string {
  return Object.values(CRITERIOS_PLANOS)
    .map(
      (p) =>
        `## ${p.nome} ($${p.preco})\nIdeal: ${p.ideal_para}\nIncludes: ${p.inclui.join("; ")}\nDoes not cover: ${p.nao_inclui.join("; ")}`
    )
    .join("\n\n");
}
