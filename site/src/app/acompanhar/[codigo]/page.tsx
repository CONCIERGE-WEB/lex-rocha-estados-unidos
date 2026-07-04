import type { Metadata } from "next";

import { AcompanharPedido } from "@/components/organisms/acompanhar-pedido";
import { SiteFooter } from "@/components/organisms/site-footer";
import { SiteHeader } from "@/components/organisms/site-header";

type Props = { params: { codigo: string } };

export const metadata: Metadata = {
  title: "Status do pedido",
  robots: { index: false },
};

export default function AcompanharCodigoPage({ params }: Props) {
  const codigo = params.codigo?.toUpperCase() ?? "";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-12 md:px-6">
        <h1 className="mb-8 font-serif text-3xl font-bold text-primary">Status do pedido</h1>
        <AcompanharPedido codigoInicial={codigo} />
      </main>
      <SiteFooter />
    </>
  );
}
