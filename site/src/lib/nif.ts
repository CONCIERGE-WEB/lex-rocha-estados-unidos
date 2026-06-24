/** NIF português — validação opcional (9 dígitos) */

export function apenasDigitosNif(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 9);
}

export function nifValido(valor: string): boolean {
  const nif = apenasDigitosNif(valor);
  if (nif.length !== 9) return false;
  const check = nif.split("").map(Number);
  const sum =
    check[0] * 9 +
    check[1] * 8 +
    check[2] * 7 +
    check[3] * 6 +
    check[4] * 5 +
    check[5] * 4 +
    check[6] * 3 +
    check[7] * 2;
  const mod = sum % 11;
  const dig = mod < 2 ? 0 : 11 - mod;
  return dig === check[8];
}
