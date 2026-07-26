import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/** Strip CR/LF — pasted env keys sometimes include `\r`. */
export function stripeSecretKey(): string | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return key || null;
}

export function getStripe(): Stripe {
  const key = stripeSecretKey();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      timeout: 25_000,
      maxNetworkRetries: 2,
      httpClient: Stripe.createFetchHttpClient(),
    });
  }

  return stripeClient;
}

export function stripeConfigurado(): boolean {
  return Boolean(stripeSecretKey());
}

export function stripeModo(): "live" | "test" | "ausente" | "desconhecido" {
  const key = stripeSecretKey() ?? "";
  if (!key) return "ausente";
  if (key.startsWith("sk_live_")) return "live";
  if (key.startsWith("sk_test_")) return "test";
  return "desconhecido";
}
