"use client";

import { Reveal } from "@/components/reveal";
import { COPY } from "@/lib/constants/copy-en";
import { PLANOS } from "@/lib/constants/empresa";
import { whatsappUrl } from "@/lib/constants/pagamentos";

export function PricingSection() {
  const wa = whatsappUrl();
  const P = COPY.planos;

  return (
    <section id="pricing" className="scroll-mt-20 section-dark py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-onDarkMuted">
            {P.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-onDark md:text-4xl">
            {P.title}
          </h2>
          <p className="mt-4 text-body font-medium text-onDark">{P.intro}</p>
          <p className="mt-2 text-sm font-medium text-onDarkMuted">{P.notaFiscal}</p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANOS.map((plano, i) => {
            const destaque = "destaque" in plano && plano.destaque;

            return (
              <Reveal key={plano.id} delay={i * 100} variant="scale">
                <article
                  className={`relative flex h-full flex-col rounded-xl border p-7 transition duration-300 md:p-8 ${
                    destaque
                      ? "z-10 scale-[1.02] border-verify/50 bg-gradient-to-b from-trustDeep to-nav shadow-lift hover:-translate-y-1 lg:-my-2"
                      : "border-onDark/25 bg-folio/10 hover:-translate-y-1 hover:border-onDark/40 hover:bg-folio/[0.14]"
                  }`}
                >
                  {destaque ? (
                    <span className="absolute -top-3 left-6 rounded-full bg-verify px-3 py-1 text-xs font-bold uppercase tracking-wide text-onDark">
                      {P.destaque}
                    </span>
                  ) : null}

                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-onDarkMuted">
                    {plano.nome}
                  </p>
                  <p className="mt-4 font-display text-5xl font-bold text-verify">${plano.preco}</p>
                  <p className="mt-1 text-sm font-medium text-onDarkMuted">one-time · USD</p>
                  <p className="mt-4 text-sm font-bold text-onDark">{plano.ideal}</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-onDarkMuted">
                    {plano.descricao}
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5 border-t border-onDark/20 pt-6 text-sm font-medium text-onDark">
                    {plano.inclui.map((item) => (
                      <li key={item} className="flex gap-2.5 text-onDark">
                        <span className="mt-0.5 font-bold text-verify" aria-hidden="true">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/request"
                    className={
                      destaque
                        ? "btn-primary mt-8 w-full text-center"
                        : "btn-outline-light mt-8 w-full text-center"
                    }
                  >
                    {P.ctaCard}
                  </a>
                  {wa ? (
                    <p className="mt-4 text-center text-sm font-medium text-onDarkMuted">
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-onDark underline underline-offset-4"
                      >
                        Questions? WhatsApp
                      </a>
                    </p>
                  ) : null}
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={80}>
          <p className="mt-12 max-w-3xl border-t border-onDark/20 pt-8 text-sm font-medium leading-relaxed text-onDarkMuted">
            {P.avisoTransparencia}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
