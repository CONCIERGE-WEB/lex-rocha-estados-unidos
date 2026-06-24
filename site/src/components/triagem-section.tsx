"use client";

import Link from "next/link";
import { useState } from "react";

import { useRouter } from "next/navigation";

import { AgendaStatusStrip } from "@/components/agenda-status-strip";
import { HumanReviewNotice } from "@/components/human-review-notice";
import { COPY } from "@/lib/constants/copy-en";
import { AREAS_CASO, planoPorId } from "@/lib/triagem/criterios-planos";
import type { ResultadoTriagem } from "@/lib/triagem/analisar-caso";

type Passo = 1 | 2 | 3;

export function TriagemSection() {
  const T = COPY.triagem;
  const [passo, setPasso] = useState<Passo>(1);
  const [area, setArea] = useState("");
  const [descricao, setDescricao] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [erro, setErro] = useState("");
  const [aAnalisar, setAAnalisar] = useState(false);
  const [resultado, setResultado] = useState<ResultadoTriagem | null>(null);
  const router = useRouter();

  const progresso = passo === 1 ? 33 : passo === 2 ? 66 : 100;

  const analisar = async () => {
    setErro("");
    if (!consentimento) {
      setErro("You must accept data processing for the free analysis.");
      return;
    }
    setAAnalisar(true);
    setPasso(3);
    try {
      const res = await fetch("/api/triagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, descricao }),
      });
      const data = (await res.json()) as {
        resultado?: ResultadoTriagem;
        error?: string;
        erro?: string;
      };
      if (!res.ok || !data.resultado) {
        setErro(data.error ?? data.erro ?? "Could not analyze your case.");
        setPasso(2);
        return;
      }
      setResultado(data.resultado);
    } catch {
      setErro("Network error. Please try again.");
      setPasso(2);
    } finally {
      setAAnalisar(false);
    }
  };

  const reiniciar = () => {
    setPasso(1);
    setResultado(null);
    setErro("");
  };

  const plano = resultado ? planoPorId(resultado.planoId) : null;

  return (
    <section
      id="pedir-relatorio"
      className="scroll-mt-24 border-b border-ink/8 bg-folio py-16 md:py-24"
    >
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <p className="section-eyebrow">{T.eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
          {T.title}
        </h2>
        <p className="mt-4 text-body text-muted">{T.intro}</p>

        <div className="mt-8" aria-label="Progress">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-trust transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-muted">
            Step {passo} of 3 — {T.passosLabel[passo - 1]}
          </p>
        </div>

        <div className="feature-card mt-8 !shadow-folio">
          {passo === 1 ? (
            <>
              <label htmlFor="area-caso" className="block font-semibold text-ink">
                {T.passo1.label}
              </label>
              <p className="mt-1 text-sm text-muted">{T.passo1.hint}</p>
              <select
                id="area-caso"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="input-field mt-4"
              >
                <option value="">Select…</option>
                {AREAS_CASO.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!area}
                onClick={() => setPasso(2)}
                className="btn-primary mt-6 disabled:opacity-50"
              >
                {T.passo1.botao}
              </button>
            </>
          ) : null}

          {passo === 2 ? (
            <>
              <label htmlFor="descricao-caso" className="block font-semibold text-ink">
                {T.passo2.label}
              </label>
              <p className="mt-1 text-sm text-muted">{T.passo2.hint}</p>
              <textarea
                id="descricao-caso"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={7}
                className="input-field mt-4 min-h-[10rem] resize-y"
                placeholder={T.passo2.placeholder}
              />
              <p className="mt-2 text-sm text-muted">{descricao.length} / 8000</p>

              <div className="mt-6 flex gap-3">
                <input
                  id="consent-triagem"
                  type="checkbox"
                  checked={consentimento}
                  onChange={(e) => setConsentimento(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-trust"
                />
                <label htmlFor="consent-triagem" className="text-sm leading-relaxed text-muted">
                  I authorize processing of this data for triage and plan recommendation, per the{" "}
                  <Link href="/privacy" className="text-trust underline underline-offset-4">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {erro ? <p className="mt-4 text-sm text-action">{erro}</p> : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => setPasso(1)} className="btn-secondary">
                  {T.passo2.voltar}
                </button>
                <button
                  type="button"
                  onClick={() => void analisar()}
                  disabled={descricao.length < 80 || aAnalisar}
                  className="btn-primary disabled:opacity-50"
                >
                  {T.passo2.botao}
                </button>
              </div>
            </>
          ) : null}

          {passo === 3 ? (
            <>
              {aAnalisar ? (
                <div className="py-8 text-center">
                  <p className="font-display text-xl text-ink">{T.passo3.aCarregar}</p>
                  <p className="mt-2 text-muted">{T.passo3.aCarregarHint}</p>
                </div>
              ) : resultado && plano ? (
                <div className="space-y-6">
                  <p
                    className={
                      resultado.casoFavoravel
                        ? "rounded-md border border-trust/30 bg-trust/5 px-4 py-3 text-body text-ink"
                        : "rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-body text-muted"
                    }
                  >
                    {resultado.mensagemCliente}
                  </p>

                  {resultado.precedente === "fraco" ? (
                    <p className="text-sm text-muted">{T.passo3.avisoFraco}</p>
                  ) : null}

                  {resultado.casoFavoravel || resultado.precedente === "nenhum" ? (
                    <div className="rounded-md border-2 border-trust bg-folio p-6">
                      <p className="cite-label">{T.passo3.planoLabel}</p>
                      <h3 className="mt-2 font-display text-2xl font-bold text-ink">
                        {resultado.planoNome}
                      </h3>
                      <p className="mt-2 font-display text-4xl font-bold text-verify">
                        ${resultado.preco}
                      </p>
                      <p className="mt-4 text-body font-medium text-muted">{plano.descricao}</p>
                      <ul className="mt-4 space-y-2 text-sm font-medium text-ink">
                        {resultado.incluiNoPlano.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="text-verify" aria-hidden="true">
                              ✓
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                      {resultado.casoFavoravel ? (
                        <p className="mt-4 text-xs font-medium text-muted">
                          {T.passo3.confianca}: {resultado.confianca}. {T.passo3.semSurpresas}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {resultado.casoFavoravel || resultado.precedente === "nenhum" ? (
                    <div className="space-y-4">
                      <p className="font-display text-base font-bold text-ink">
                        {T.passo3.entregaTitulo}
                      </p>
                      <AgendaStatusStrip />
                      <HumanReviewNotice compact />
                      <p className="text-xs font-medium text-muted">{T.passo3.entregaNota}</p>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    {resultado.casoFavoravel ? (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/checkout?plano=${encodeURIComponent(resultado.planoId)}`)
                        }
                        className="btn-primary"
                      >
                        {T.passo3.ctaPagar} — ${resultado.preco}
                      </button>
                    ) : resultado.precedente === "nenhum" ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/checkout?plano=${encodeURIComponent(resultado.planoId)}`
                            )
                          }
                          className="btn-secondary"
                        >
                          {T.passo3.ctaAvancar} — ${resultado.preco}
                        </button>
                        <button type="button" onClick={reiniciar} className="btn-primary">
                          {T.passo3.ctaHonestidade}
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={reiniciar} className="btn-primary">
                        {T.passo3.ctaHonestidade}
                      </button>
                    )}
                    {resultado.casoFavoravel || resultado.precedente === "nenhum" ? (
                      <button type="button" onClick={reiniciar} className="btn-secondary">
                        {T.passo3.novoCaso}
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/contact" className="text-trust underline underline-offset-4">
            {T.passo3.contactoAntes}
          </Link>
          {" · "}
          {T.rodape}
        </p>
      </div>

    </section>
  );
}
