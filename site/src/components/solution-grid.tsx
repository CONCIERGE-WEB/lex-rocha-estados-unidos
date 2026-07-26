import type { ReactNode } from "react";

import { Reveal } from "@/components/reveal";
import { COPY } from "@/lib/constants/copy-en";

const ICONS: Record<string, ReactNode> = {
  billing: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  retail: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
      <path
        d="M6 6h15l-1.5 9H7.5L6 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M6 6 5 3H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="19" r="1.5" fill="currentColor" />
      <circle cx="18" cy="19" r="1.5" fill="currentColor" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
      <rect x="8" y="2" width="8" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 18h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  bank: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 3 21 10H3L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5 10v8M9 10v8M15 10v8M19 10v8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 18h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  plane: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
      <path
        d="M10 21 14 3l2 6 5 2-5 2-1 6-2-4-3 1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
      <path
        d="M12 3 4 6v5c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  health: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
      <path
        d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export function SolutionGrid() {
  const S = COPY.solutions;

  return (
    <section id="categories" className="scroll-mt-24 section-muted border-b border-ink/8 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="max-w-2xl">
          <p className="section-eyebrow">{S.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">{S.title}</h2>
          <p className="mt-5 text-lead text-muted">{S.lead}</p>
        </Reveal>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {S.items.map((item, i) => (
            <Reveal key={item.id} as="li" delay={Math.min(i, 6) * 60}>
              <article className="solution-card h-full">
                <div className="mb-5 inline-flex rounded-lg bg-cite p-3 text-trust">
                  {ICONS[item.icon]}
                </div>
                <h3 className="font-display text-xl font-semibold text-ink">{item.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{item.text}</p>
                <a
                  href={`/request?categoria=${encodeURIComponent(item.id)}`}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-trust transition hover:gap-2"
                >
                  Analyze my case
                  <span aria-hidden="true">→</span>
                </a>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
