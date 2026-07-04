import { z } from "zod";

/**
 * Módulo 7 — confirmação explícita dos dados antes do pagamento.
 * O relatório só entra no pipeline de geração após pagamento confirmado
 * (gate de negócio; esta camada registra o aceite dos dados de entrada).
 */

export const confirmacaoDadosSchema = z.object({
  solicitacaoId: z.string().min(1),
  categoria: z.string().min(1),
  resumoCampos: z.record(z.string(), z.unknown()),
  confirmado: z.literal(true, {
    error: 'É necessário confirmar: "Confirmo que os dados acima estão corretos".',
  }),
  confirmadoEm: z.string().datetime().optional(),
});

export type ConfirmacaoDadosInput = z.infer<typeof confirmacaoDadosSchema>;

export type RegistroAceiteDados = {
  solicitacaoId: string;
  categoria: string;
  resumoCampos: Record<string, unknown>;
  confirmadoEm: string;
  textoAceite: "Confirmo que os dados acima estão corretos";
};

export function registrarAceiteDados(
  input: ConfirmacaoDadosInput,
  agora = new Date()
): RegistroAceiteDados {
  const parsed = confirmacaoDadosSchema.parse(input);
  return {
    solicitacaoId: parsed.solicitacaoId,
    categoria: parsed.categoria,
    resumoCampos: parsed.resumoCampos,
    confirmadoEm: parsed.confirmadoEm ?? agora.toISOString(),
    textoAceite: "Confirmo que os dados acima estão corretos",
  };
}

/**
 * Gate: sem aceite registrado, não avança para pagamento/geração.
 */
export function podeAvancarParaPagamento(
  aceite: RegistroAceiteDados | null | undefined
): boolean {
  return Boolean(aceite?.confirmadoEm && aceite.textoAceite);
}
