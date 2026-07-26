import { PLANOS } from "@/lib/constants/empresa";

/** Public criteria — mirror what the site promises in each plan */
export const CRITERIOS_PLANOS = {
  essencial: {
    id: "essencial" as const,
    nome: "Essential",
    preco: 49,
    ideal_para:
      "Relatively simple situation, one clear problem, few parties involved.",
    inclui: [
      "Your case explained in plain language",
      "Up to 2 public decisions in similar cases",
      "What was granted in each cited case",
      "Practical results & statutory damages reference (where catalogued)",
    ],
    nao_inclui: [
      "Recommendations or next-step advice (research only)",
      "Extended comparative case overview",
      "More than 2 in-depth decided cases",
    ],
  },
  padrao: {
    id: "padrao" as const,
    nome: "Standard",
    preco: 79,
    ideal_para:
      "Case with some complexity, several related issues, or significant amount in dispute.",
    inclui: [
      "In-depth research of your case",
      "3 to 5 public decisions in similar cases",
      "What was granted in each cited case",
      "What U.S. consumer law says about your situation",
      "Practical results & statutory damages reference (where catalogued)",
    ],
    nao_inclui: [
      "Recommendations or next-step advice (research only)",
      "Detailed multi-party timeline",
    ],
  },
  completo: {
    id: "completo" as const,
    nome: "Premium",
    preco: 119,
    ideal_para:
      "Situation with multiple phases, multiple entities, high amounts in dispute, or need for rigorous timeline.",
    inclui: [
      "Detailed report with a factual timeline of the cited cases",
      "Extended set of public decisions in similar cases",
      "What was granted across the cited cases",
      "What U.S. consumer law says about your situation",
      "Practical results & statutory damages reference (where catalogued)",
    ],
    nao_inclui: [
      "Recommendations, strategy, or legal representation",
    ],
  },
} as const;

export type PlanoId = keyof typeof CRITERIOS_PLANOS;

/** Triage areas aligned to the U.S. category map (public labels). */
export const AREAS_CASO = [
  { id: "fcra_credit_reporting", label: "Credit reporting / FCRA" },
  { id: "fdcpa_debt_collection", label: "Debt collection / billing (FDCPA)" },
  { id: "tcpa_robocalls", label: "Robocalls / spam texts (TCPA)" },
  { id: "lemon_law_warranty", label: "Lemon Law / product warranty" },
  { id: "udap_deceptive_practices", label: "Unfair / deceptive practices (UDAP)" },
  { id: "dot_flights_baggage", label: "Flights / baggage (DOT)" },
  { id: "health_plan_denial", label: "Health plan / insurance denial" },
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
