/** U.S. ZIP code — optional validation (5 digits) */

export function apenasDigitosZip(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 5);
}

export function zipValido(valor: string): boolean {
  return /^\d{5}$/.test(apenasDigitosZip(valor));
}
