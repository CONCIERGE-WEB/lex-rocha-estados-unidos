import { Reveal } from "@/components/reveal";
import { COPY } from "@/lib/constants/copy-en";

export function StatsBar() {
  return (
    <section className="border-b border-ink/10 bg-folio" aria-label="Key metrics">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-2 divide-y divide-ink/10 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {COPY.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 70} className="stat-tile py-8 sm:py-10">
              <p className="font-display text-2xl font-semibold text-trust md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-2 max-w-[11rem] text-sm leading-snug text-muted">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
