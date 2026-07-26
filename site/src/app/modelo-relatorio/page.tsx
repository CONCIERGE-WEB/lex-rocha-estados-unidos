import type { Metadata } from "next";
import Link from "next/link";

import { ModeloRelatorioSection } from "@/components/organisms/modelo-relatorio-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { COPY_SITE } from "@/lib/constants/copy-site";
import { EMPRESA } from "@/lib/constants/empresa";
import { SITE } from "@/lib/constants/site";

const { modelo } = COPY_SITE;

export const metadata: Metadata = {
  title: `${modelo.pageTitle} — ${EMPRESA.marca}`,
  description: modelo.pageIntro,
  alternates: { canonical: `${SITE.url}/modelo-relatorio` },
};

export default function ModeloRelatorioPage() {
  return (
    <>
      <SiteHeader />
      <main id="content">
        <div className="mx-auto max-w-4xl px-4 pt-10 md:px-6">
          <p className="text-sm text-muted">
            <Link href="/" className="text-trust underline underline-offset-4">
              ← Home
            </Link>
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink md:text-4xl">
            {modelo.pageTitle}
          </h1>
          <p className="mt-3 max-w-2xl text-lead text-muted">{modelo.pageIntro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/request" className="btn-primary">
              {modelo.ctaSolicitar}
            </Link>
            <WhatsAppCta className="btn-secondary">{modelo.ctaWhatsapp}</WhatsAppCta>
          </div>
        </div>
        <ModeloRelatorioSection compact />
      </main>
      <SiteFooter />
    </>
  );
}
