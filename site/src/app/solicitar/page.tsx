import type { Metadata } from "next";

import { SolicitarPesquisaForm } from "@/components/organisms/solicitar-pesquisa-form";
import { SiteFooter } from "@/components/organisms/site-footer";
import { SiteHeader } from "@/components/organisms/site-header";
import { COPY_SITE } from "@/lib/constants/copy-site";
import { NOME_SERVICO_PUBLICO } from "@/lib/constants/pesquisa-documental";
import { SITE } from "@/lib/constants/site";

const { solicitar } = COPY_SITE;

export const metadata: Metadata = {
  title: `Solicitar ${NOME_SERVICO_PUBLICO}`,
  description: solicitar.intro,
  alternates: { canonical: `${SITE.url}/solicitar` },
};

export default function SolicitarPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-12 md:px-6">
        <div className="mb-8 space-y-2">
          <h1 className="font-serif text-3xl font-bold text-primary">{solicitar.title}</h1>
          <p className="text-muted-foreground">{solicitar.intro}</p>
        </div>
        <SolicitarPesquisaForm />
      </main>
      <SiteFooter />
    </>
  );
}
