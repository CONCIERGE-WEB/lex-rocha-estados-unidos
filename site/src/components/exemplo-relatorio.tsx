import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { ATRIBUICAO_COURTLISTENER } from "@/lib/constants/credits";
import {
  MODELO_CABECALHO_CLIENTE,
  MODELO_RELATORIO_META,
  MODELO_RELATORIO_SECOES,
} from "@/lib/constants/modelo-relatorio-demo";

/** Home + /report-sample preview — mirrors paid report anatomy (BR parity, U.S. copy). */
export function ExemploRelatorio() {
  const preview = MODELO_RELATORIO_SECOES.slice(0, 4);

  return (
    <section className="border-b border-ink/8 bg-folio py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <Reveal variant="left" className="lg:sticky lg:top-28">
            <p className="section-eyebrow">Sample deliverable</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
              What your report looks like
            </h2>
            <p className="mt-4 text-lead text-muted">
              Same structure consumers and attorneys receive — illustrated with an anonymized
              FCRA credit-reporting vignette.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-muted">
              <li className="flex gap-2">
                <span className="text-verify">✓</span>
                Practical results observed in similar public cases
              </li>
              <li className="flex gap-2">
                <span className="text-verify">✓</span>
                Facts, timeline, and U.S. law framing
              </li>
              <li className="flex gap-2">
                <span className="text-verify">✓</span>
                Similar decided cases + source attribution
              </li>
            </ul>
            <p className="mt-6 text-xs italic text-muted">
              Research only — no recommendations or legal advice. {ATRIBUICAO_COURTLISTENER}
            </p>
            <Link
              href="/modelo-relatorio"
              className="mt-6 inline-flex text-sm font-semibold text-trust underline underline-offset-4"
            >
              Open full sample model →
            </Link>
          </Reveal>

          <Reveal variant="right" delay={100} className="overflow-hidden rounded-2xl border border-ink/10 bg-folio shadow-lift">
            <div className="bg-hero-gradient px-6 py-5 text-onDark md:px-8 md:py-6">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-onDarkMuted">
                {MODELO_RELATORIO_META.titulo}
              </p>
              <p className="mt-2 text-lg font-bold text-onDark">{MODELO_RELATORIO_META.area}</p>
              <p className="mt-1 text-sm font-medium text-onDarkMuted">
                {MODELO_RELATORIO_META.planoBadge} · {MODELO_CABECALHO_CLIENTE.state} ·{" "}
                {MODELO_RELATORIO_META.referencia}
              </p>
            </div>

            {preview.map((sec, idx) => (
              <div
                key={sec.titulo}
                className={
                  idx < preview.length - 1
                    ? "border-b border-ink/8 px-6 py-5 md:px-8"
                    : "px-6 py-5 md:px-8"
                }
              >
                <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wide text-muted">
                  {sec.titulo}
                </p>
                <p className="line-clamp-5 whitespace-pre-line text-sm font-medium leading-relaxed text-ink">
                  {sec.corpo.replace(/\*\*/g, "")}
                </p>
              </div>
            ))}

            <div className="border-t border-ink/8 bg-paper px-6 py-4 md:px-8">
              <p className="text-xs italic text-muted">
                + precedents, Premium matrix, and sources on the full model page
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
