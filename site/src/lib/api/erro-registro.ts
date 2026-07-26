/** API error message — technical detail only in development. */
export function mensagemErroRegistro(
  contexto: string,
  causa: string | undefined,
  fallbackPublico: string
): string {
  if (process.env.NODE_ENV === "development" && causa) {
    return `${contexto}: ${causa}`;
  }
  return fallbackPublico;
}
