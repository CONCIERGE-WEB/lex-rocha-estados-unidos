import { redirect } from "next/navigation";
import { Suspense } from "react";

import { CheckoutFlow } from "@/components/checkout-flow";
import { SiteHeader } from "@/components/site-header";
import { EMPRESA, PLANOS } from "@/lib/constants/empresa";
import { normalizarCategoriaPipeline } from "@/lib/pipeline-confiavel/categorias";

export const metadata = {
  title: `Checkout — ${EMPRESA.marca}`,
};

const PLANOS_VALIDOS = new Set<string>(PLANOS.map((p) => p.id));

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string; categoria?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const id = sp.plano?.trim().toLowerCase() ?? "";
  if (!PLANOS_VALIDOS.has(id)) {
    redirect("/#pricing");
  }

  const categoryId =
    normalizarCategoriaPipeline(sp.categoria?.trim() || sp.category?.trim() || "") ??
    null;

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
            <Suspense fallback={<p className="text-sm text-muted">Loading checkout…</p>}>
              <CheckoutFlow planoId={id} categoryId={categoryId} />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
}
