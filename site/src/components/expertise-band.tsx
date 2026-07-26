import { Reveal } from "@/components/reveal";
import { COPY } from "@/lib/constants/copy-en";

export function ExpertiseBand() {
  const E = COPY.expertise;

  return (
    <section className="section-dark border-b border-trustDeep py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <Reveal variant="left">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-onDarkMuted">
              {E.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold text-onDark md:text-4xl lg:text-[2.75rem] lg:leading-tight">
              {E.title}
            </h2>
            <p className="mt-5 max-w-lg text-lg font-medium leading-relaxed text-onDark">{E.lead}</p>
            <a href="#how-it-works" className="btn-outline-light mt-8 inline-flex">
              {E.cta}
            </a>
          </Reveal>

          <ul className="grid gap-4 sm:grid-cols-3 lg:gap-5">
            {E.cards.map((card, i) => (
              <Reveal
                key={card.title}
                as="li"
                delay={i * 90}
                className="rounded-xl border border-onDark/20 bg-folio/5 p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 md:p-6"
              >
                <span className="font-mono text-xs font-bold text-verify">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-onDark">{card.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-onDarkMuted">{card.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
