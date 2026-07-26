/**
 * Public WhatsApp helpers.
 * Kept as `whatsapp.ts` (not only `whatsapp/index.ts`) so Next/webpack
 * does not break when a prior cache still resolved the file path.
 */
export {
  getWhatsAppNumber,
  numeroWhatsApp,
  whatsappConfigurado,
  montarLinkWhatsApp,
  linkWhatsApp,
  mensagemDuvidas,
  mensagemInicial,
  linkWhatsAppDuvidas,
  mensagemNovaSolicitacao,
  mensagemPagamentoConfirmado,
  mensagemClienteAcompanhar,
} from "./whatsapp/index";
