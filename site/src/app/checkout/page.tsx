import { redirect } from "next/navigation";

import { CheckoutFlow } from "@/components/checkout-flow";
import { SiteHeader } from "@/components/site-header";
import { EMPRESA, PLANOS } from "@/lib/constants/empresa";

export const metadata = {
  title: `Checkout — ${EMPRESA.marca}`,
};

const PLANOS_VALIDOS = new Set<string>(PLANOS.map((p) => p.id));

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: { plano?: string };
}) {
  const id = searchParams.plano?.trim().toLowerCase() ?? "";
  if (!PLANOS_VALIDOS.has(id)) {
    redirect("/#planos");
  }

  return (
    <>
      <SiteHeader />
      <main id="content" className="border-b border-ink/8 bg-paper py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="section-eyebrow">Before you pay</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
            Confirm your order
          </h1>
          <p className="mt-4 max-w-2xl text-body text-muted">
            A couple of quick questions, then you&apos;ll be redirected to secure Stripe payment.
          </p>

          <div className="mt-10">
            <CheckoutFlow planoId={id} />
          </div>
        </div>
      </main>
    </>
  );
}
