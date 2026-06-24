"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { emailValido } from "@/lib/email";
import { PLANOS } from "@/lib/constants/empresa";

type ClientType = "individual" | "business" | null;

type Props = {
  planoId: string;
};

export function CheckoutFlow({ planoId }: Props) {
  const plano = PLANOS.find((p) => p.id === planoId);

  const [clientType, setClientType] = useState<ClientType>(null);
  const [receiptEmail, setReceiptEmail] = useState("");
  const [terms, setTerms] = useState(false);
  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(false);

  const step = useMemo(() => {
    if (clientType === "business") return 1;
    if (clientType !== "individual") return 1;
    return 2;
  }, [clientType]);

  const progress = clientType === "business" ? 50 : step === 1 ? 50 : 100;

  const canContinue =
    clientType === "individual" && emailValido(receiptEmail) && terms;

  const continuePayment = async () => {
    setErro("");
    if (!canContinue) return;

    setACarregar(true);
    try {
      const res = await fetch("/api/checkout/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plano: planoId,
          emailRecibo: receiptEmail.trim(),
          termosAceites: true,
        }),
      });
      const data = (await res.json()) as { url?: string; erro?: string; error?: string };
      if (!res.ok || !data.url) {
        setErro(data.erro ?? data.error ?? "Could not continue to payment.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setErro("Network error. Please try again.");
    } finally {
      setACarregar(false);
    }
  };

  if (!plano) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="cite-block mb-8">
        <p className="cite-label">Summary</p>
        <p className="mt-2 font-display text-2xl font-semibold text-ink">{plano.nome}</p>
        <p className="mt-1 font-display text-3xl font-semibold text-verify">${plano.preco}</p>
        <p className="mt-2 text-sm text-muted">{plano.descricao}</p>
      </div>

      {clientType !== "business" ? (
        <div className="mb-8" aria-label="Progress">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-trust transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-muted">Step {step} of 2</p>
        </div>
      ) : null}

      <section className="cite-block space-y-4" aria-labelledby="checkout-q1">
        <h2 id="checkout-q1" className="font-display text-xl font-semibold text-ink">
          Quick question before checkout
        </h2>
        <p className="text-body text-muted">We want to make sure this service fits your needs.</p>

        <fieldset className="space-y-3">
          <legend className="sr-only">Client type</legend>
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-ink/10 p-4 transition hover:border-trust/40">
            <input
              type="radio"
              name="client-type"
              checked={clientType === "individual"}
              onChange={() => {
                setClientType("individual");
                setTerms(false);
                setErro("");
              }}
              className="mt-1 h-5 w-5 accent-trust"
            />
            <span className="text-body text-ink">
              I&apos;m an individual — resolving a personal consumer issue
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-ink/10 p-4 transition hover:border-trust/40">
            <input
              type="radio"
              name="client-type"
              checked={clientType === "business"}
              onChange={() => {
                setClientType("business");
                setTerms(false);
                setErro("");
              }}
              className="mt-1 h-5 w-5 accent-trust"
            />
            <span className="text-body text-ink">
              I need a formal business invoice or legal representation
            </span>
          </label>
        </fieldset>

        {clientType === "business" ? (
          <div className="rounded-md border border-trust/30 bg-cite/50 p-4 text-body leading-relaxed text-ink">
            <p>
              This service is for individual consumers seeking an informational report. We do not
              provide legal representation or formal business invoicing. For those needs, please
              consult a licensed attorney in your state.
            </p>
            <Link href="/#planos" className="btn-secondary mt-6 inline-block">
              Back to plans
            </Link>
          </div>
        ) : null}
      </section>

      {clientType === "individual" ? (
        <section className="cite-block mt-6 space-y-4" aria-labelledby="checkout-q2">
          <h2 id="checkout-q2" className="font-display text-xl font-semibold text-ink">
            Confirm and pay
          </h2>

          <div>
            <label htmlFor="receipt-email" className="block font-semibold text-ink">
              Email for receipt and report delivery
            </label>
            <input
              id="receipt-email"
              type="email"
              autoComplete="email"
              value={receiptEmail}
              onChange={(e) => setReceiptEmail(e.target.value)}
              className="input-field"
              placeholder="you@email.com"
            />
            <p className="mt-2 text-sm text-muted">
              Your Stripe receipt and final report will be sent here. We do not share your email
              with third parties beyond payment processing.
            </p>
          </div>

          <div className="flex gap-3">
            <input
              id="termos-checkout"
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-trust"
            />
            <label htmlFor="termos-checkout" className="text-body leading-relaxed text-muted">
              I have read and accept the{" "}
              <Link href="/terms" className="text-trust underline underline-offset-4">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-trust underline underline-offset-4">
                Privacy Policy
              </Link>
              . I understand this is an informational research service, not legal representation.
            </label>
          </div>

          {erro ? <p className="text-sm font-medium text-verify">{erro}</p> : null}

          <button
            type="button"
            onClick={() => void continuePayment()}
            disabled={!canContinue || aCarregar}
            className="btn-primary disabled:opacity-50"
          >
            {aCarregar ? "Redirecting…" : "Continue to secure payment →"}
          </button>

          <p className="text-sm text-muted">
            Payment processed by Stripe. Your data is encrypted in transit.
          </p>
        </section>
      ) : null}
    </div>
  );
}
