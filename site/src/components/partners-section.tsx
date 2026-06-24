import Link from "next/link";

import { COPY } from "@/lib/constants/copy-en";

export function PartnersSection() {
  const P = COPY.partners;

  return (
    <section id="partners" className="scroll-mt-24 section-dark border-b border-trustDeep py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-onDarkMuted">
          {P.eyebrow}
        </p>
        <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold text-onDark md:text-4xl">
          {P.title}
        </h2>
        <p className="mt-5 max-w-2xl text-lg font-medium text-onDark">{P.description}</p>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {P.cards.map((card) => (
            <li
              key={card.title}
              className="rounded-xl border border-onDark/20 bg-folio/5 p-6 backdrop-blur-sm"
            >
              <h3 className="font-display text-lg font-bold text-onDark">{card.title}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-onDarkMuted">{card.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <span className="rounded-full border border-verify/50 bg-verify/15 px-4 py-1.5 text-sm font-bold text-verify">
            {P.badge}
          </span>
          <Link href="/partners" className="btn-outline-light">
            {P.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
