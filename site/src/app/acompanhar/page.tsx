import type { Metadata } from "next";

import { AcompanharPedido } from "@/components/organisms/acompanhar-pedido";
import { SiteFooter } from "@/components/organisms/site-footer";
import { SiteHeader } from "@/components/organisms/site-header";
import { COPY_SITE } from "@/lib/constants/copy-site";
import { SITE } from "@/lib/constants/site";

const { acompanhar } = COPY_SITE;

export const metadata: Metadata = {
  title: acompanhar.title,
  description: acompanhar.intro,
  alternates: { canonical: `${SITE.url}/acompanhar` },
};

export default function AcompanharPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-12 md:px-6">
        <h1 className="mb-2 font-serif text-3xl font-bold text-primary">{acompanhar.title}</h1>
        <p className="mb-8 text-muted-foreground">{acompanhar.intro}</p>
        <AcompanharPedido />
      </main>
      <SiteFooter />
    </>
  );
}
