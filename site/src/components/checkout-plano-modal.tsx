"use client";

import Link from "next/link";
import { useState } from "react";

import { PLANOS } from "@/lib/constants/empresa";
import { apenasDigitosZip, zipValido } from "@/lib/zip";
import type { ResultadoTriagem } from "@/lib/triagem/analisar-caso";

type Plano = (typeof PLANOS)[number];

type Props = {
  plano: Plano;
  onClose: () => void;
  descricaoCaso?: string;
  areaCaso?: string;
  categoryId?: string;
  triagem?: ResultadoTriagem;
};

export function CheckoutPlanoModal({
  plano,
  onClose,
  descricaoCaso: descricaoInicial = "",
  areaCaso = "",
  categoryId,
  triagem,
}: Props) {
  const [zip, setZip] = useState("");
  const [descricaoCaso, setDescricaoCaso] = useState(descricaoInicial);
  const [aceiteContrato, setAceiteContrato] = useState(false);
  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(false);

  const veioDaTriagem = Boolean(triagem && descricaoInicial.length >= 80);

  const enviar = async () => {
    setErro("");
    const zipLimpo = apenasDigitosZip(zip);
    if (zipLimpo && !zipValido(zipLimpo)) {
      setErro("Invalid ZIP code. Enter 5 digits or leave the field empty.");
      return;
    }
    if (!aceiteContrato) {
      setErro("You must agree to begin your personalized report immediately after payment.");
      return;
    }
    const descricao = descricaoCaso.trim();
    if (descricao.length < 80) {
      setErro("Describe your case with at least 80 characters — it's the basis of your report.");
      return;
    }

    setACarregar(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planoId: plano.id,
          zip: zipLimpo || undefined,
          aceiteContrato: true,
          descricaoCaso: descricao,
          areaCaso: areaCaso || undefined,
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
        setErro(data.erro ?? data.error ?? "Could not start payment.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setErro("Network error. Please try again.");
    } finally {
      setACarregar(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-titulo"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md border border-ink/10 bg-folio p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="cite-label">Order summary</p>
        <h2 id="checkout-titulo" className="mt-2 font-display text-2xl font-semibold text-ink">
          {plano.nome}
        </h2>
        {triagem ? (
          <p className="mt-2 text-sm text-trust">
            Plan selected from your free case analysis — exact price below.
          </p>
        ) : null}
        <p className="mt-2 text-body text-muted">{plano.descricao}</p>

        <dl className="cite-block mt-6 space-y-2 text-body">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Total</dt>
            <dd className="font-semibold text-verify">${plano.preco}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Currency</dt>
            <dd className="text-ink">USD</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Receipt</dt>
            <dd className="text-right text-ink">Stripe email receipt</dd>
          </div>
        </dl>

        <p className="mt-4 text-sm text-muted">
          Personalized digital service for your specific case. Informational report — not legal
          representation. See{" "}
          <Link href="/terms" className="text-trust underline underline-offset-4">
            Terms
          </Link>
          .
        </p>

        {veioDaTriagem ? (
          <div className="cite-block mt-6">
            <p className="text-sm font-semibold text-ink">Case from triage</p>
            <p className="mt-2 line-clamp-4 text-sm text-muted">{descricaoCaso}</p>
          </div>
        ) : (
          <div className="mt-6">
            <label htmlFor="descricao-caso" className="block text-base font-semibold text-ink">
              Describe your case
            </label>
            <p className="mt-1 text-sm text-muted">
              The more detail, the better the report. Minimum 80 characters.
            </p>
            <textarea
              id="descricao-caso"
              value={descricaoCaso}
              onChange={(e) => setDescricaoCaso(e.target.value)}
              rows={6}
              className="input-field mt-2 min-h-[8rem] resize-y"
              placeholder="E.g.: I bought online in January. The product arrived defective. The store refused a return for 3 weeks..."
            />
          </div>
        )}

        <div className="mt-6">
          <label htmlFor="zip-opcional" className="block text-base font-semibold text-ink">
            ZIP code (optional)
          </label>
          <p className="mt-1 text-sm text-muted">
            Only if you want it on your receipt. Not required.
          </p>
          <input
            id="zip-opcional"
            type="text"
            inputMode="numeric"
            placeholder="12345"
            value={zip}
            onChange={(e) => setZip(apenasDigitosZip(e.target.value))}
            className="input-field"
            maxLength={5}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <input
            id="aceite-contrato"
            type="checkbox"
            checked={aceiteContrato}
            onChange={(e) => setAceiteContrato(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-trust"
          />
          <label htmlFor="aceite-contrato" className="text-body leading-relaxed text-muted">
            I authorize immediate start of my personalized report after payment and understand
            that refund rights may be limited once work begins. I have read the{" "}
            <Link href="/terms" className="text-trust underline underline-offset-4">
              Terms of Service
            </Link>
            .
          </label>
        </div>

        {erro ? (
          <p className="cite-block mt-4 border-verify text-sm text-ink">{erro}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={enviar}
            disabled={aCarregar}
            className="btn-primary disabled:opacity-60"
          >
            {aCarregar ? "Redirecting…" : `Pay $${plano.preco} with Stripe`}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
