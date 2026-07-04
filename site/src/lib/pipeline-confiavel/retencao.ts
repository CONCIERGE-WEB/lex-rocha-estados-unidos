/**
 * Política de retenção LGPD — prazos configuráveis (não hardcoded de negócio).
 * Valores de teste/dummy até confirmação do responsável jurídico.
 */

export type PoliticaRetencao = {
  /** Dias para reter dados pessoais do formulário. */
  diasDadosFormulario: number;
  /** Dias para reter relatórios gerados. */
  diasRelatorios: number;
};

const DEFAULT_TESTE: PoliticaRetencao = {
  diasDadosFormulario: 365,
  diasRelatorios: 365,
};

function parseDias(valor: string | undefined, fallback: number): number {
  if (!valor?.trim()) return fallback;
  const n = Number(valor);
  if (!Number.isFinite(n) || n < 1) {
    throw new Error(`Prazo de retenção inválido: ${valor}`);
  }
  return Math.floor(n);
}

export function carregarPoliticaRetencao(
  env: NodeJS.ProcessEnv = process.env
): PoliticaRetencao {
  return {
    diasDadosFormulario: parseDias(
      env.RETENCAO_DIAS_DADOS_FORMULARIO,
      DEFAULT_TESTE.diasDadosFormulario
    ),
    diasRelatorios: parseDias(
      env.RETENCAO_DIAS_RELATORIOS,
      DEFAULT_TESTE.diasRelatorios
    ),
  };
}

export function dataLimiteRetencao(
  criadoEm: Date,
  dias: number
): Date {
  const d = new Date(criadoEm);
  d.setUTCDate(d.getUTCDate() + dias);
  return d;
}

export function deveExpirar(params: {
  criadoEm: Date;
  diasRetencao: number;
  agora?: Date;
}): boolean {
  const agora = params.agora ?? new Date();
  return agora.getTime() >= dataLimiteRetencao(params.criadoEm, params.diasRetencao).getTime();
}

export type RegistroParaExpurgo = {
  id: string;
  tipo: "formulario" | "relatorio";
  criadoEm: string;
};

/**
 * Seleciona IDs elegíveis a expurgo/anonimização.
 * A execução real (DB) fica em job separado — aqui só a regra.
 */
export function selecionarParaExpurgo(params: {
  registros: RegistroParaExpurgo[];
  politica: PoliticaRetencao;
  agora?: Date;
}): RegistroParaExpurgo[] {
  const agora = params.agora ?? new Date();
  return params.registros.filter((r) => {
    const dias =
      r.tipo === "formulario"
        ? params.politica.diasDadosFormulario
        : params.politica.diasRelatorios;
    return deveExpirar({
      criadoEm: new Date(r.criadoEm),
      diasRetencao: dias,
      agora,
    });
  });
}

/** Solicitação de exclusão antecipada (direito LGPD art. 18). */
export type PedidoExclusaoAntecipada = {
  titularId: string;
  solicitadoEm: string;
  motivo: "direito_lgpd_art18";
};

export function registrarPedidoExclusaoAntecipada(
  titularId: string,
  agora = new Date()
): PedidoExclusaoAntecipada {
  if (!titularId.trim()) {
    throw new Error("titularId obrigatório para exclusão antecipada.");
  }
  return {
    titularId: titularId.trim(),
    solicitadoEm: agora.toISOString(),
    motivo: "direito_lgpd_art18",
  };
}
