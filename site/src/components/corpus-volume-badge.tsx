import {
  contarVolumeCorpusCategoria,
  textoSeloVolume,
  type CorpusVolumeStats,
} from "@/lib/fontes-us/corpus-volume";
import { metaJurisdicaoCategoria } from "@/lib/pipeline-confiavel/jurisdicao-categorias";
import type { CategoriaPipeline } from "@/lib/pipeline-confiavel/categorias";

type Props = {
  category: CategoriaPipeline | string;
  className?: string;
  /** When true, show even if uniqueOpinions is 0 (extended indexing label). */
  showWhenEmpty?: boolean;
};

/**
 * Selo de volume só com contadores reais do corpus local (cluster_id únicos).
 * Inclui jurisdição (federal/estadual) e disponibilidade Live vs Extended.
 */
export function CorpusVolumeBadge({
  category,
  className,
  showWhenEmpty = false,
}: Props) {
  const stats: CorpusVolumeStats | null = contarVolumeCorpusCategoria(category);
  const meta = metaJurisdicaoCategoria(category);
  if (!stats) return null;
  if (stats.uniqueOpinions <= 0 && !showWhenEmpty) return null;
  if (!meta) return null;

  const live = meta.disponibilidade === "live";

  return (
    <div
      className={
        className ??
        "rounded-lg border border-trust/25 bg-trust/5 px-3 py-2 text-sm text-ink"
      }
      data-fonte={stats.fonte}
      data-unique={stats.uniqueOpinions}
      data-jurisdictions={stats.jurisdictionsWithItems}
      data-nivel={meta.nivel}
      data-disponibilidade={meta.disponibilidade}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={
            live
              ? "rounded-md bg-emerald-700 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white"
              : "rounded-md bg-slate-700 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white"
          }
        >
          {meta.disponibilidadeLabel}
        </span>
        <span className="rounded-md border border-ink/15 px-2 py-0.5 text-xs text-muted">
          {meta.nivel === "federal" ? "Federal statute" : "State statute"}
        </span>
      </div>
      <p className="mt-1.5 font-medium">{stats.label}</p>
      <p className="mt-0.5 text-muted">
        {stats.uniqueOpinions > 0
          ? textoSeloVolume(stats)
          : "Corpus awaiting CourtListener sync — no invented cases."}
      </p>
      <p className="mt-1 text-xs text-muted">{meta.notaJurisdicao}</p>
    </div>
  );
}
