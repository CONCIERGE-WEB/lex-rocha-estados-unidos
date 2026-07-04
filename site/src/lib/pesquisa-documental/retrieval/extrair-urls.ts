const REGEX_URL = /https?:\/\/[^\s<>"')\]]+/gi;

export function extrairUrlsDeTexto(texto: string): string[] {
  const encontradas = texto.match(REGEX_URL) ?? [];
  const limpas = encontradas.map((u) => u.replace(/[.,;]+$/, ""));
  return Array.from(new Set(limpas));
}
