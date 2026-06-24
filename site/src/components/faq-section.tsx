import { COPY } from "@/lib/constants/copy-en";

export function FaqSection() {
  const F = COPY.faq;

  return (
    <section className="border-b border-ink/8 bg-folio py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <p className="section-eyebrow text-center">{F.eyebrow}</p>
        <h2 className="mt-3 text-center font-display text-3xl font-semibold text-ink md:text-4xl">
          {F.title}
        </h2>

        <dl className="mt-10 divide-y divide-ink/10 rounded-xl border border-ink/10 bg-paper">
          {F.items.map((item) => (
            <div key={item.q} className="px-5 py-5 md:px-7 md:py-6">
              <dt className="font-display text-lg font-semibold text-ink">{item.q}</dt>
              <dd className="mt-2 text-body leading-relaxed text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
