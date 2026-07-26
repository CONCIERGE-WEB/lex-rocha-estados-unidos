import Image from "next/image";

import { BrandLogo } from "@/components/brand-logo";
import { COPY } from "@/lib/constants/copy-en";
import { EMPRESA } from "@/lib/constants/empresa";

/**
 * First viewport (frontend design rules):
 * brand · one headline · one supporting sentence · one CTA group · full-bleed visual.
 * No chips, badges, stats, or cards in the hero.
 */
export function HomeHero() {
  const H = COPY.hero;

  return (
    <section
      className="relative isolate min-h-[min(92vh,52rem)] overflow-hidden border-b border-trustDeep/40 text-onDark"
      aria-label={`${EMPRESA.marca} — home`}
    >
      <Image
        src="/brand/hero-judicial-atmosphere.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center motion-safe:animate-hero-zoom"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/88 to-trustDeep/50"
      />
      <div
        aria-hidden
        className="hero-sheen pointer-events-none absolute -right-1/4 top-0 h-full w-3/4 opacity-35"
      />

      <div className="relative z-10 mx-auto flex min-h-[min(92vh,52rem)] max-w-7xl flex-col justify-center px-4 py-16 md:px-6 md:py-24">
        <div className="hero-stagger max-w-3xl">
          <div className="origin-left scale-110 sm:scale-125">
            <BrandLogo variant="dark" />
          </div>

          <p className="mt-8 font-display text-4xl font-bold leading-[1.08] tracking-tight text-onDark sm:text-5xl md:text-6xl lg:text-[4rem]">
            {EMPRESA.marca}
          </p>

          <h1 className="mt-5 max-w-2xl font-display text-xl font-semibold leading-snug text-onDark/95 sm:text-2xl md:text-3xl">
            {H.title}
          </h1>

          <p className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-onDarkMuted md:text-xl">
            {H.subtitle}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <a href="/request" className="btn-primary min-w-[200px]">
              {H.ctaPrimary}
            </a>
            <a href="#how-it-works" className="btn-outline-light min-w-[160px]">
              {H.ctaSecondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
