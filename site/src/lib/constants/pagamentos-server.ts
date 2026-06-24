/** Funções server-only — não importar em componentes client */

export function stripeCheckoutDisponivel(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}
