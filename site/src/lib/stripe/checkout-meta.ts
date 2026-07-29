/**
 * Stripe plan id → checkout metadata tier (API contract).
 * essencial=$49 · padrao=$79 · completo=$119
 */
export const PLANO_PARA_TIER = {
  essencial: "basic",
  padrao: "pro",
  completo: "enterprise",
} as const;

export type PlanoCheckoutId = keyof typeof PLANO_PARA_TIER;
export type CheckoutTier = (typeof PLANO_PARA_TIER)[PlanoCheckoutId];

export function tierDoPlano(planoId: string): CheckoutTier | null {
  if (planoId in PLANO_PARA_TIER) {
    return PLANO_PARA_TIER[planoId as PlanoCheckoutId];
  }
  return null;
}

export function appBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim().replace(/\/$/, "")}`;
  }
  return "http://localhost:3010";
}
