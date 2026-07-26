import type { Metadata } from "next";
import { Suspense } from "react";

import { RequestForm } from "@/components/organisms/request-form";
import { SiteHeader } from "@/components/site-header";
import { COPY } from "@/lib/constants/copy-en";
import { EMPRESA } from "@/lib/constants/empresa";
import { NOME_SERVICO_PUBLICO } from "@/lib/constants/pesquisa-documental";
import { SITE } from "@/lib/constants/site";

const R = COPY.request;

export const metadata: Metadata = {
  title: `Request ${NOME_SERVICO_PUBLICO}`,
  description: R.intro,
  alternates: { canonical: `${SITE.url}/request` },
};

export default function RequestPage() {
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
        </div>
        <Suspense fallback={<p className="text-sm text-muted">Loading form…</p>}>
          <RequestForm />
        </Suspense>
      </main>
    </>
  );
}
