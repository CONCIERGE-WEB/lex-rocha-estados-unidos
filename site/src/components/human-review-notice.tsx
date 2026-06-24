import { REVISAO_HUMANA } from "@/lib/constants/prazos-entrega";

type Props = {
  compact?: boolean;
};

export function HumanReviewNotice({ compact = false }: Props) {
  const R = REVISAO_HUMANA;

  if (compact) {
    return (
      <p className="rounded-lg border-2 border-trust/25 bg-cite/40 px-4 py-3 text-sm font-medium text-ink">
        <span className="font-bold text-trust">{R.titulo}.</span> {R.lead}
      </p>
    );
  }

  return (
    <aside
      className="rounded-xl border-2 border-trust/30 bg-folio p-5 shadow-folio md:p-6"
      aria-labelledby="human-review-title"
    >
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-trust">
        Quality assurance
      </p>
      <h3 id="human-review-title" className="mt-2 font-display text-lg font-bold text-ink">
        {R.titulo}
      </h3>
      <p className="mt-2 text-sm font-medium leading-relaxed text-muted">{R.lead}</p>
      <ul className="mt-4 space-y-2 text-sm font-medium text-ink">
        {R.bullets.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span className="font-bold text-verify" aria-hidden="true">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs font-medium text-muted">{R.notaIA}</p>
    </aside>
  );
}
