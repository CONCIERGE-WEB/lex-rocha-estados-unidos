import type { Metadata } from "next";
import { Suspense } from "react";

import { CorpusVolumeBadge } from "@/components/corpus-volume-badge";
import { RequestForm } from "@/components/organisms/request-form";
import { SiteHeader } from "@/components/site-header";
import { COPY } from "@/lib/constants/copy-en";
import { EMPRESA } from "@/lib/constants/empresa";
import { NOME_SERVICO_PUBLICO } from "@/lib/constants/pesquisa-documental";
import { SITE } from "@/lib/constants/site";
import { CATEGORIAS_PIPELINE, normalizarCategoriaPipeline } from "@/lib/pipeline-confiavel/categorias";
import { CATEGORIAS_LIVE } from "@/lib/pipeline-confiavel/jurisdicao-categorias";

const R = COPY.request;

export const metadata: Metadata = {
  title: `Request ${NOME_SERVICO_PUBLICO}`,
  description: R.intro,
  alternates: { canonical: `${SITE.url}/request` },
};

type Props = {
  searchParams?: { category?: string; categoria?: string };
};

export default function RequestPage({ searchParams }: Props) {
  const fromQuery =
    normalizarCategoriaPipeline(
      searchParams?.category?.trim() || searchParams?.categoria?.trim() || ""
    ) ?? null;

  /** Live first, then extended — if URL has a category, pin it on top. */
  const ordered = [
    ...CATEGORIAS_LIVE,
    ...CATEGORIAS_PIPELINE.filter((c) => !(CATEGORIAS_LIVE as readonly string[]).includes(c)),
  ];
  const destaque = fromQuery
    ? [fromQuery, ...ordered.filter((c) => c !== fromQuery)]
    : ordered;

  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-2xl px-4 py-12 md:px-6">
        <div className="mb-8 space-y-3">
          <p className="section-eyebrow">{EMPRESA.marca}</p>
          <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">
            {R.title}
          </h1>
          <p className="text-lead text-muted">{R.intro}</p>
          <p className="text-sm text-muted">
            Volume badges use deduplicated CourtListener opinions only. Federal
            categories may cite other federal circuits when a state cell is thin;
            state statutes (Lemon Law / UDAP) never apply a neighbor state&apos;s
            law as local rule.
          </p>
          <div className="flex flex-col gap-2 pt-1">
            {destaque.map((cat) => (
              <CorpusVolumeBadge key={cat} category={cat} showWhenEmpty />
            ))}
          </div>
        </div>
        <Suspense fallback={<p className="text-sm text-muted">Loading form…</p>}>
          <RequestForm />
        </Suspense>
      </main>
    </>
  );
}
