export function ExemploRelatorio() {
  return (
    <section className="border-b border-ink/8 bg-folio py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="section-eyebrow">Sample deliverable</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
              What your report looks like
            </h2>
            <p className="mt-4 text-lead text-muted">
              Real structure — based on an unauthorized billing case with a wireless carrier.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-muted">
              <li className="flex gap-2">
                <span className="text-verify">✓</span>
                Plain-language case summary
              </li>
              <li className="flex gap-2">
                <span className="text-verify">✓</span>
                Comparable U.S. outcomes cited
              </li>
              <li className="flex gap-2">
                <span className="text-verify">✓</span>
                Ordered next steps and estimates
              </li>
            </ul>
          </div>

          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-folio shadow-lift">
            <div className="bg-hero-gradient px-6 py-5 text-onDark md:px-8 md:py-6">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-onDarkMuted">
                Consumer Rights Research Report
              </p>
              <p className="mt-2 text-lg font-bold text-onDark">Unauthorized charge — wireless carrier</p>
              <p className="mt-1 text-sm font-medium text-onDarkMuted">Standard plan · Delivered in 24 business hours</p>
            </div>

            <div className="border-b border-ink/8 px-6 py-5 md:px-8">
              <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-wide text-muted">
                1 · Your case in plain language
              </p>
              <p className="text-sm font-medium leading-relaxed text-ink">
                You were charged for a service you canceled within the allowed period. The carrier kept
                billing for three consecutive months and did not issue a credit after your formal
                complaint.
              </p>
            </div>

            <div className="border-b border-ink/8 px-6 py-5 md:px-8">
              <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-wide text-muted">
                2 · Similar cases already decided in the U.S.
              </p>
              <div className="rounded-lg border border-ink/8 bg-paper p-4">
                <p className="text-sm font-semibold text-ink">State consumer court — California, 2024</p>
                <p className="mt-1 text-sm text-muted">
                  Nearly identical situation. Outcome favorable to the consumer. Full refund plus
                  documented damages.
                </p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-4 w-3/4 rounded bg-cite" />
                <div className="h-3 w-full rounded bg-paper" />
                <div className="h-3 w-5/6 rounded bg-paper" />
              </div>
              <p className="mt-4 text-xs italic text-muted">+ 2 additional precedents in the full report</p>
            </div>

            <div className="px-6 py-5 md:px-8">
              <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-wide text-muted">
                3 · Suggested next steps
              </p>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-cite" />
                <div className="h-3 w-5/6 rounded bg-paper" />
                <div className="h-3 w-3/4 rounded bg-paper" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
