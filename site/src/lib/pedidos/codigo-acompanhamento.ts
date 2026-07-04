import { randomBytes } from "node:crypto";

const CARACTERES = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function gerarCodigoAcompanhamento(tamanho = 8): string {
  let codigo = "";
  const bytes = randomBytes(tamanho);
  for (let i = 0; i < tamanho; i++) {
    codigo += CARACTERES[bytes[i]! % CARACTERES.length];
  }
  return codigo;
}
