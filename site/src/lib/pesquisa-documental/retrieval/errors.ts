export type CodigoErroRetrieval =
  | "URL_NAO_PERMITIDA"
  | "HTTP_ERRO"
  | "TIMEOUT"
  | "CORPO_VAZIO"
  | "CORPO_EXCESSIVO"
  | "CITACAO_INVALIDA"
  | "PACOTE_INVALIDO"
  | "URL_INVALIDA";

export class RetrievalError extends Error {
  readonly codigo: CodigoErroRetrieval;

  constructor(codigo: CodigoErroRetrieval, mensagem: string) {
    super(mensagem);
    this.name = "RetrievalError";
    this.codigo = codigo;
  }
}
