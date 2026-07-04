import Link from "next/link";

import { SectionHeading } from "@/components/atoms/section-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { COPY_SITE } from "@/lib/constants/copy-site";
import {
  NOTA_APROVACAO_CLIENTE,
  PRECIFICACAO,
  PRECIFICACAO_TEXTO_COMPARATIVO,
} from "@/lib/constants/pesquisa-documental";
import { SITE } from "@/lib/constants/site";

export function PrecosPesquisaSection() {
  const { precos } = COPY_SITE;
  const planos = [
    PRECIFICACAO.essencial,
    PRECIFICACAO.padrao,
    PRECIFICACAO.completo,
  ];

  return (
    <section id="precos" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-6xl space-y-10 px-4 md:px-6">
        <SectionHeading
          eyebrow={precos.eyebrow}
          title={precos.title}
          description={precos.description}
        />
        <p className="text-sm">
          <Link href="/modelo-relatorio" className="font-medium text-primary underline">
            {precos.linkModelo}
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">{PRECIFICACAO_TEXTO_COMPARATIVO}</p>
        <p className="text-sm text-muted-foreground">{NOTA_APROVACAO_CLIENTE}</p>
        <div className="grid gap-6 md:grid-cols-3">
          {planos.map((plano) => (
            <Card key={plano.label} className="flex flex-col">
              <CardHeader>
                <CardTitle className="font-serif text-xl">{plano.label}</CardTitle>
                <p className="font-serif text-3xl font-bold text-primary">
                  R$ {plano.valor}
                </p>
                <CardDescription>{plano.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto text-xs text-muted-foreground">
                Pagamento via PIX (CNPJ {SITE.cnpj}) ou combinação acordada.
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="rounded-2xl border border-accent/40 bg-secondary/40 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5">
              <h3 className="font-serif text-xl font-semibold text-primary">
                {precos.semPrecedentesTitulo}
              </h3>
              <p className="max-w-3xl text-sm text-muted-foreground">
                {precos.semPrecedentesTexto}
              </p>
              <Link
                href="/termos"
                className="inline-block text-sm font-medium text-primary underline underline-offset-4"
              >
                Ver condição nos Termos
              </Link>
            </div>
            <span className="inline-flex shrink-0 items-center self-start rounded-full border border-accent/50 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-primary md:self-center">
              {precos.semPrecedentesSelo}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
