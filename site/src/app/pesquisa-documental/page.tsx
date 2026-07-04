import type { Metadata } from "next";

import { PesquisaDocumentalWorkspace } from "@/components/organisms/pesquisa-documental-workspace";

export const metadata: Metadata = {
  title: "Pesquisa documental (interno)",
  robots: { index: false, follow: false },
};

export default function PesquisaDocumentalPage() {
  return <PesquisaDocumentalWorkspace />;
}
