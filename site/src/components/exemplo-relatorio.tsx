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
                Comparable U.S. cases — and what was granted
              </li>
              <li className="flex gap-2">
                <span className="text-verify">✓</span>
                Sources consulted (court and date)
              </li>
            </ul>
            <p className="mt-6 text-xs italic text-muted">
              Research only — no recommendations or legal advice.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-folio shadow-lift">
            <div className="bg-hero-gradient px-6 py-5 text-onDark md:px-8 md:py-6">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-onDarkMuted">
                Consumer Rights Research Report
              </p>
              <p className="mt-2 text-lg font-bold text-onDark">Unauthorized charge — wireless carrier</p>
              <p className="mt-1 text-sm font-medium text-onDarkMuted">
                Standard plan · Human-reviewed · typically within 24 business hours
              </p>
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
                2 · Similar cases already decided — and what was granted
              </p>
              <div className="rounded-lg border border-ink/8 bg-paper p-4">
                <p className="text-sm font-semibold text-ink">State consumer court — California, 2024</p>
                <p className="mt-1 text-sm text-muted">
                  Nearly identical facts. Decision favorable to the consumer.{" "}
                  <span className="font-medium text-ink">Granted: full refund plus documented damages.</span>
                </p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-4 w-3/4 rounded bg-cite" />
                <div className="h-3 w-full rounded bg-paper" />
                <div className="h-3 w-5/6 rounded bg-paper" />
              </div>
              <p className="mt-4 text-xs italic text-muted">+ 2 additional decided cases in the full report</p>
            </div>

            <div className="px-6 py-5 md:px-8">
              <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-wide text-muted">
                3 · Sources consulted
              </p>
              <p className="mb-3 text-xs text-muted">Court and date only — no links, no recommendations.</p>
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
