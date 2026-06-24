import { HumanReviewNotice } from "@/components/human-review-notice";
import { COPY } from "@/lib/constants/copy-en";
import { PRAZOS } from "@/lib/constants/prazos-entrega";

export function DeliveryCommitmentBand() {
  const D = COPY.delivery;

  return (
    <section className="border-b border-ink/8 bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <p className="section-eyebrow">{D.eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink md:text-4xl">
              {D.title}
            </h2>
            <p className="mt-4 text-lead font-medium text-muted">{D.lead}</p>
            <ol className="mt-8 space-y-4">
              {D.phases.map((phase, i) => (
                <li
                  key={phase.title}
                  className="flex gap-4 rounded-lg border-2 border-muted/15 bg-folio p-4"
                >
                  <span className="font-mono text-lg font-bold text-trust/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-display font-bold text-ink">{phase.title}</p>
                    <p className="mt-1 text-sm font-medium text-muted">{phase.detail}</p>
                    <p className="mt-2 font-mono text-xs font-bold uppercase tracking-wide text-verify">
                      {phase.timing}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm font-medium text-muted">{D.footnote}</p>
          </div>
          <HumanReviewNotice />
        </div>
        <p className="mt-8 text-center font-mono text-xs font-bold uppercase tracking-widest text-muted">
          {PRAZOS.janelaResposta}
        </p>
      </div>
    </section>
  );
}
