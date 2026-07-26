"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PLANOS } from "@/lib/constants/empresa";
import {
  CATEGORIA_LABELS,
  normalizarCategoriaPipeline,
} from "@/lib/pipeline-confiavel/categorias";

export const CHECKOUT_CASO_KEY = "ji_checkout_caso";

type ClientType = "individual" | "business" | null;

type TriagemGuardada = {
  planoId?: string;
  confianca?: string;
  casoFavoravel?: boolean;
  justificativa?: string;
};

type CasoGuardado = {
  descricao?: string;
  area?: string;
  categoria?: string;
  categoryId?: string;
  triagem?: TriagemGuardada;
};

type Props = {
  planoId: string;
  categoryId?: string | null;
};

export function CheckoutFlow({ planoId, categoryId: categoryFromUrl }: Props) {
  const plano = PLANOS.find((p) => p.id === planoId);

  const [clientType, setClientType] = useState<ClientType>(null);
  const [descricao, setDescricao] = useState("");
  const [area, setArea] = useState("");
  const [categoryId, setCategoryId] = useState(categoryFromUrl?.trim() || "");
  const [triagem, setTriagem] = useState<TriagemGuardada | undefined>(undefined);
  const [veioDaTriagem, setVeioDaTriagem] = useState(false);
  const [terms, setTerms] = useState(false);
  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(false);

  useEffect(() => {
    if (categoryFromUrl?.trim()) setCategoryId(categoryFromUrl.trim());
  }, [categoryFromUrl]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CHECKOUT_CASO_KEY);
      if (!raw) return;
      const guardado = JSON.parse(raw) as CasoGuardado;
      const desc = guardado.descricao?.trim() ?? "";
      if (desc) setDescricao(desc);
      if (guardado.area) setArea(guardado.area);
      const cat = guardado.categoryId || guardado.categoria || guardado.area;
      if (cat && !categoryFromUrl) setCategoryId(cat);
      if (guardado.triagem) setTriagem(guardado.triagem);
      setVeioDaTriagem(desc.length >= 80);
    } catch {
      // ignore malformed session data
    }
  }, [categoryFromUrl]);

  const step = useMemo(() => (clientType === "individual" ? 2 : 1), [clientType]);
  const progress = clientType === "individual" ? 100 : 50;

  const canContinue =
    clientType === "individual" && descricao.trim().length >= 80 && terms;

  const continuePayment = async () => {
    setErro("");
    if (!canContinue) return;

    setACarregar(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planoId,
          aceiteContrato: true,
          descricaoCaso: descricao.trim(),
          areaCaso: area || categoryId || undefined,
          categoryId: categoryId || undefined,
          triagem: triagem
            ? {
                planoId: triagem.planoId,
                confianca: triagem.confianca,
                casoFavoravel: triagem.casoFavoravel,
                justificativa: triagem.justificativa,
              }
            : undefined,
        }),
      });
      const data = (await res.json()) as { url?: string; erro?: string; error?: string };
      if (!res.ok || !data.url) {
        setErro(data.erro ?? data.error ?? "Could not continue to payment.");
        return;
      }
      try {
        sessionStorage.removeItem(CHECKOUT_CASO_KEY);
      } catch {
        // ignore
      }
      window.location.href = data.url;
    } catch {
      setErro("Network error. Please try again.");
    } finally {
      setACarregar(false);
    }
  };

  if (!plano) return null;

  const categoryCanon = normalizarCategoriaPipeline(categoryId);
  const categoryLabel = categoryCanon ? CATEGORIA_LABELS[categoryCanon] : null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="cite-block mb-8">
        <p className="cite-label">Summary</p>
        <p className="mt-2 font-display text-2xl font-semibold text-ink">{plano.nome}</p>
        <p className="mt-1 font-display text-3xl font-semibold text-verify">${plano.preco}</p>
        <p className="mt-2 text-sm text-muted">{plano.descricao}</p>
        {categoryLabel ? (
          <p className="mt-3 text-sm font-semibold text-trust">Category: {categoryLabel}</p>
        ) : null}
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
            <Link href="/#pricing" className="btn-secondary mt-6 inline-block">
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

          {veioDaTriagem ? (
            <div className="rounded-md border border-trust/30 bg-cite/40 p-4">
              <p className="text-sm font-semibold text-ink">Case from your free analysis</p>
              <p className="mt-2 line-clamp-4 text-sm text-muted">{descricao}</p>
              <button
                type="button"
                onClick={() => setVeioDaTriagem(false)}
                className="mt-3 text-sm text-trust underline underline-offset-4"
              >
                Edit case description
              </button>
            </div>
          ) : (
            <div>
              <label htmlFor="case-description" className="block font-semibold text-ink">
                Describe your case
              </label>
              <p className="mt-1 text-sm text-muted">
                The more detail, the better the report. Minimum 80 characters.
              </p>
              <textarea
                id="case-description"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={6}
                className="input-field mt-2 min-h-[8rem] resize-y"
                placeholder="E.g.: I bought online in January. The product arrived defective. The store refused a return for 3 weeks..."
              />
              <p className="mt-2 text-sm text-muted">{descricao.trim().length} / 8000</p>
            </div>
          )}

          <p className="rounded-md border border-ink/10 bg-paper px-4 py-3 text-sm text-muted">
            Your receipt and final report are sent to the email you enter on the next screen
            (secure Stripe checkout). We do not share your email with third parties beyond payment
            processing.
          </p>

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
