import { BrandLogo } from "@/components/brand-logo";
import { COPY } from "@/lib/constants/copy-en";

export function HomeHero() {
  const H = COPY.hero;
  const stats = COPY.stats.slice(0, 3);

  return (
    <section className="hero-enterprise border-b border-trustDeep/40">
      <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="motion-safe:animate-fade-up">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-onDarkMuted">
              {H.eyebrow}
            </p>
            <h1 className="mt-5 font-display text-[1.85rem] font-bold leading-[1.12] tracking-tight text-onDark sm:text-4xl md:text-5xl lg:text-[3.35rem]">
              {H.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-onDark md:text-xl">
              {H.subtitle}
            </p>

            <ul
              className="mt-8 flex flex-wrap gap-2"
              aria-label="Guarantees"
            >
              {H.trustChips.map((chip) => (
                <li
                  key={chip}
                  className="rounded-full border border-onDark/25 bg-folio/10 px-3.5 py-1.5 text-sm font-semibold text-onDark backdrop-blur-sm"
                >
                  {chip}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#pedir-relatorio" className="btn-primary min-w-[200px]">
                {H.ctaPrimary}
              </a>
              <a href="#como-funciona" className="btn-outline-light min-w-[160px]">
                {H.ctaSecondary}
              </a>
            </div>

            <p className="mt-6 max-w-lg text-sm font-medium leading-relaxed text-onDarkMuted">{H.trustLine}</p>
          </div>

          <aside className="hero-panel motion-safe:animate-fade-up lg:ml-auto lg:max-w-md">
            <div className="mb-6 flex items-center gap-3 border-b border-folio/15 pb-5">
              <BrandLogo compact variant="dark" />
              <div>
                <p className="font-mono text-[0.65rem] font-bold uppercase tracking-widest text-onDarkMuted">
                  Research snapshot
                </p>
                <p className="text-sm font-semibold text-onDark">What you get before you pay</p>
              </div>
            </div>

            <ul className="space-y-4">
              {stats.map((s) => (
                <li
                  key={s.label}
                  className="flex items-start justify-between gap-4 border-b border-folio/10 pb-4 last:border-0 last:pb-0"
                >
                  <span className="font-display text-2xl font-bold text-verify">{s.value}</span>
                  <span className="max-w-[12rem] text-right text-sm font-medium leading-snug text-onDarkMuted">
                    {s.label}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-6 rounded-lg border border-verify/40 bg-verify/15 px-4 py-3 text-sm font-medium text-onDark">
              <span className="font-bold text-verify">Transparent screening.</span>{" "}
              If we cannot find documented similar cases, we tell you first.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
