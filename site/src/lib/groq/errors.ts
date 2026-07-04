export type CodigoErroGroq =
  | "CONFIG_AUSENTE"
  | "HTTP_ERRO"
  | "RESPOSTA_VAZIA"
  | "JSON_INVALIDO"
  | "TRIAGEM_INVALIDA";

export class GroqError extends Error {
  readonly codigo: CodigoErroGroq;

  constructor(codigo: CodigoErroGroq, mensagem: string) {
    super(mensagem);
    this.name = "GroqError";
    this.codigo = codigo;
  }
}
