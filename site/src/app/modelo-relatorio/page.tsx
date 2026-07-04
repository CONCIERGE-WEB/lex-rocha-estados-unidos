import type { Metadata } from "next";
import Link from "next/link";

import { ModeloRelatorioSection } from "@/components/organisms/modelo-relatorio-section";
import { SiteFooter } from "@/components/organisms/site-footer";
import { SiteHeader } from "@/components/organisms/site-header";
import { WhatsAppButton } from "@/components/atoms/whatsapp-button";
import { Button } from "@/components/ui/button";
import { copyComSite } from "@/lib/constants/copy-helpers";
import { COPY_SITE } from "@/lib/constants/copy-site";
import { SITE } from "@/lib/constants/site";

const { modelo } = COPY_SITE;

export const metadata: Metadata = {
  title: modelo.pageTitle,
  description: modelo.pageIntro,
  alternates: { canonical: `${SITE.url}/modelo-relatorio` },
};

export default function ModeloRelatorioPage() {
  const msg = copyComSite(modelo.whatsappMensagem);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-4xl px-4 pt-10 md:px-6">
          <p className="text-sm text-muted-foreground">
            <Link href="/" className="text-primary hover:underline">
              ← Início
            </Link>
          </p>
          <h1 className="mt-4 font-serif text-3xl font-bold text-primary md:text-4xl">
            {modelo.pageTitle}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{modelo.pageIntro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/solicitar">{modelo.ctaSolicitar}</Link>
            </Button>
            <WhatsAppButton mensagem={msg}>{modelo.ctaWhatsapp}</WhatsAppButton>
          </div>
        </div>
        <ModeloRelatorioSection compact />
      </main>
      <SiteFooter />
    </>
  );
}
