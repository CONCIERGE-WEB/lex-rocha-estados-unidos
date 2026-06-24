import Link from "next/link";

import { ExemploRelatorio } from "@/components/exemplo-relatorio";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { COPY } from "@/lib/constants/copy-en";
import { EMPRESA } from "@/lib/constants/empresa";

export const metadata = {
  title: `Sample report — ${EMPRESA.marca}`,
  description: COPY.reportSample.intro,
};

export default function ReportSamplePage() {
  const R = COPY.reportSample;

  return (
    <>
      <SiteHeader />
      <main id="content">
        <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
          <Link href="/" className="text-sm font-medium text-trust underline underline-offset-4">
            ← Home
          </Link>
          <h1 className="mt-4 font-display text-3xl font-semibold text-ink md:text-4xl">{R.title}</h1>
          <p className="mt-4 max-w-2xl text-lead text-muted">{R.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/#pedir-relatorio" className="btn-primary">
              {R.ctaStart}
            </a>
            <WhatsAppCta className="btn-secondary">{R.ctaWhatsapp}</WhatsAppCta>
          </div>
        </div>
        <ExemploRelatorio />
      </main>
    </>
  );
}
