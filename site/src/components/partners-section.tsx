import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { COPY } from "@/lib/constants/copy-en";

export function PartnersSection() {
  const P = COPY.partners;

  return (
    <section id="partners" className="scroll-mt-24 section-dark border-b border-trustDeep py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-onDarkMuted">
            {P.eyebrow}
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold text-onDark md:text-4xl">
            {P.title}
          </h2>
          <p className="mt-5 max-w-2xl text-lg font-medium text-onDark">{P.description}</p>
        </Reveal>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {P.cards.map((card, i) => (
            <Reveal
              key={card.title}
              as="li"
              delay={i * 90}
              className="rounded-xl border border-onDark/20 bg-folio/5 p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1"
            >
              <h3 className="font-display text-lg font-bold text-onDark">{card.title}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-onDarkMuted">{card.text}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={100} className="mt-10 flex flex-col items-center gap-4 text-center">
          <span className="rounded-full border border-emerald-300/60 bg-emerald-500/20 px-4 py-1.5 text-sm font-bold text-emerald-200">
            {P.badge}
          </span>
          <Link href="/partners" className="btn-outline-light">
            {P.cta}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
