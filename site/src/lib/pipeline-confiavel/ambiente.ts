/**
 * Ambiente do pipeline. Produção exige citacoes_conferidas: true no banco.
 */
export type AmbientePipeline = "producao" | "staging" | "teste";

export function resolverAmbientePipeline(
  env: NodeJS.ProcessEnv = process.env
): AmbientePipeline {
  const explicito = env.PIPELINE_AMBIENTE?.trim().toLowerCase();
  if (explicito === "producao" || explicito === "production") return "producao";
  if (explicito === "staging" || explicito === "homologacao") return "staging";
  if (explicito === "teste" || explicito === "test") return "teste";
  if (env.NODE_ENV === "test") return "teste";
  if (env.NODE_ENV === "development") return "staging";
  return "producao";
}

export function ambienteExigeCitacoesConferidas(
  ambiente: AmbientePipeline = resolverAmbientePipeline()
): boolean {
  return ambiente === "producao";
}
