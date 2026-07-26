import { z } from "zod";

import { isUsStateLancamento } from "@/lib/constants/us-states";
import {
  CATEGORIAS_PIPELINE,
  normalizarCategoriaPipeline,
  type CategoriaPipeline,
} from "@/lib/pipeline-confiavel/categorias";
import {
  dataNaoFutura,
  moedaUsdParaCentavos,
  nomeCompletoValido,
} from "@/lib/pipeline-confiavel/validacoes";

const canalTentativa = z.enum([
  "company",
  "cfpb",
  "state_ag",
  "nenhum",
]);

const nomeCliente = z
  .string()
  .min(5)
  .max(120)
  .refine(nomeCompletoValido, "Enter first and last name.");

const dataEvento = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date (use YYYY-MM-DD).")
  .refine(dataNaoFutura, "Date cannot be in the future.");

const valorCentavos = z
  .union([z.string(), z.number()])
  .transform((v, ctx) => {
    const c = moedaUsdParaCentavos(v);
    if (c === null) {
      ctx.addIssue({
        code: "custom",
        message: "Amount must be positive (USD, e.g. 150.00).",
      });
      return z.NEVER;
    }
    return c;
  });

const textoCurto = z.string().max(200).optional();
const textoOutro = z.string().max(120).optional();

const stateUs = z
  .string()
  .transform((s) => s.trim().toUpperCase())
  .refine(isUsStateLancamento, "Select a valid U.S. state or Federal.");

/** Shared contact + privacy confirmation (no SSN / CPF). */
export const camposContatoSchema = z.object({
  nome_cliente: nomeCliente,
  email_cliente: z.string().email("Invalid email."),
  telefone_cliente: z.string().max(20).optional(),
  state_us: stateUs,
  consentimento_privacidade: z.literal(true, {
    error: "You must accept the privacy terms to continue.",
  }),
});

export const fcraCreditReportingCamposSchema = z
  .object({
    empresa_reclamada: z.string().min(2).max(200),
    data_negativacao: dataEvento,
    valor_negativado_centavos: valorCentavos,
    motivo_alegado_pela_empresa: textoCurto,
    ja_tentou_resolver_diretamente: z.boolean(),
    canal_tentativa: canalTentativa.optional(),
    possui_comprovante_quitacao: z.boolean(),
    outro_detalhe: textoOutro,
  })
  .superRefine((data, ctx) => {
    if (data.ja_tentou_resolver_diretamente && !data.canal_tentativa) {
      ctx.addIssue({
        code: "custom",
        message: "Tell us how you tried to resolve it.",
        path: ["canal_tentativa"],
      });
    }
  });

export const fdcpaDebtCollectionCamposSchema = z
  .object({
    empresa_reclamada: z.string().min(2).max(200),
    data_cobranca: dataEvento,
    valor_cobrado_centavos: valorCentavos,
    tipo_cobranca: z.enum([
      "cartao",
      "emprestimo",
      "assinatura",
      "boleto",
      "outro",
    ]),
    pagou_valor_cobrado: z.boolean(),
    ja_tentou_resolver_diretamente: z.boolean(),
    canal_tentativa: canalTentativa.optional(),
    outro_detalhe: textoOutro,
  })
  .superRefine((data, ctx) => {
    if (data.ja_tentou_resolver_diretamente && !data.canal_tentativa) {
      ctx.addIssue({
        code: "custom",
        message: "Tell us how you tried to resolve it.",
        path: ["canal_tentativa"],
      });
    }
  });

export const dotFlightsCamposSchema = z.object({
  empresa_reclamada: z.string().min(2).max(200),
  data_evento: dataEvento,
  valor_envolvido_centavos: valorCentavos.optional(),
  problema: z.enum(["atraso", "cancelamento", "bagagem", "outro"]),
  ja_tentou_resolver_diretamente: z.boolean(),
  canal_tentativa: canalTentativa.optional(),
  outro_detalhe: textoOutro,
});

export const productWarrantyCamposSchema = z.object({
  empresa_reclamada: z.string().min(2).max(200),
  data_compra: dataEvento,
  valor_produto_centavos: valorCentavos,
  problema: z.enum(["defeito", "atraso", "nao_entrega", "veiculo_limao"]),
  ja_tentou_resolver_diretamente: z.boolean(),
  canal_tentativa: canalTentativa.optional(),
  outro_detalhe: textoOutro,
});

/** Alias — Lemon Law / Magnuson-Moss uses the same field shape. */
export const lemonLawWarrantyCamposSchema = productWarrantyCamposSchema;

export const tcpaRobocallsCamposSchema = z.object({
  empresa_reclamada: z.string().min(2).max(200),
  data_evento: dataEvento,
  tipo_contato: z.enum(["ligacao", "sms", "ambos", "outro"]),
  estimativa_contatos: z.string().max(40).optional(),
  ja_tentou_resolver_diretamente: z.boolean(),
  canal_tentativa: canalTentativa.optional(),
  outro_detalhe: textoOutro,
});

export const udapDeceptiveCamposSchema = z.object({
  empresa_reclamada: z.string().min(2).max(200),
  data_evento: dataEvento,
  valor_envolvido_centavos: valorCentavos.optional(),
  tipo_pratica: z.enum([
    "propaganda_enganosa",
    "taxa_oculta",
    "e_commerce",
    "outro",
  ]),
  ja_tentou_resolver_diretamente: z.boolean(),
  canal_tentativa: canalTentativa.optional(),
  outro_detalhe: textoOutro,
});

export const healthPlanDenialCamposSchema = z.object({
  empresa_reclamada: z.string().min(2).max(200),
  data_negativa: dataEvento,
  tipo: z.enum(["plano_saude", "seguro"]),
  ja_tentou_resolver_diretamente: z.boolean(),
  canal_tentativa: canalTentativa.optional(),
  outro_detalhe: textoOutro,
});

const CAMPOS_POR_CATEGORIA = {
  fcra_credit_reporting: fcraCreditReportingCamposSchema,
  fdcpa_debt_collection: fdcpaDebtCollectionCamposSchema,
  tcpa_robocalls: tcpaRobocallsCamposSchema,
  lemon_law_warranty: lemonLawWarrantyCamposSchema,
  udap_deceptive_practices: udapDeceptiveCamposSchema,
  dot_flights_baggage: dotFlightsCamposSchema,
  health_plan_denial: healthPlanDenialCamposSchema,
} as const;

export function schemaCamposCategoria(categoria: CategoriaPipeline) {
  return CAMPOS_POR_CATEGORIA[categoria];
}

export function parseWizardSolicitacao(input: unknown):
  | { success: true; data: WizardSolicitacaoValido }
  | { success: false; error: z.ZodError } {
  const rawCat =
    typeof input === "object" &&
    input !== null &&
    "categoria" in input &&
    typeof (input as { categoria?: unknown }).categoria === "string"
      ? normalizarCategoriaPipeline((input as { categoria: string }).categoria)
      : null;

  if (!rawCat) {
    const fail = z
      .object({ categoria: z.enum(CATEGORIAS_PIPELINE) })
      .safeParse(input);
    return fail.success
      ? { success: false, error: new z.ZodError([]) }
      : { success: false, error: fail.error };
  }

  const base = z
    .object({
      categoria: z.literal(rawCat),
    })
    .and(camposContatoSchema)
    .safeParse({ ...(input as object), categoria: rawCat });

  if (!base.success) return { success: false, error: base.error };

  const camposSchema = schemaCamposCategoria(base.data.categoria);
  const campos = camposSchema.safeParse(input);
  if (!campos.success) return { success: false, error: campos.error };

  return {
    success: true,
    data: {
      ...base.data,
      ...campos.data,
    } as WizardSolicitacaoValido,
  };
}

export type WizardSolicitacaoValido = {
  categoria: CategoriaPipeline;
  nome_cliente: string;
  email_cliente: string;
  telefone_cliente?: string;
  state_us: string;
  consentimento_privacidade: true;
} & Record<string, unknown>;

/** @deprecated Prefer parseWizardSolicitacao — alias kept for BR-era imports. */
export const parseWizardRequest = parseWizardSolicitacao;
