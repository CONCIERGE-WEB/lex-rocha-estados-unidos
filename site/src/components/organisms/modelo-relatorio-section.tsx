import Link from "next/link";
import { FileText } from "lucide-react";

import { SectionHeading } from "@/components/atoms/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COPY_SITE } from "@/lib/constants/copy-site";
import {
  MODELO_RELATORIO_META,
  MODELO_RELATORIO_SECOES,
} from "@/lib/constants/modelo-relatorio-demo";

export function ModeloRelatorioSection({ compact = false }: { compact?: boolean }) {
  return (
    <section
      id={compact ? undefined : "modelo-relatorio"}
      className={`scroll-mt-20 ${compact ? "py-12" : "border-y bg-secondary/20 py-20"}`}
    >
      <div className="mx-auto max-w-4xl space-y-8 px-4 md:px-6">
        {!compact && (
          <SectionHeading
            eyebrow={COPY_SITE.modelo.eyebrow}
            title={COPY_SITE.modelo.title}
            description={COPY_SITE.modelo.description}
          />
        )}

        <Card className="overflow-hidden border-primary/20 shadow-md">
          <div className="border-b bg-primary px-4 py-4 text-primary-foreground sm:px-6">
            <p className="text-xs font-medium uppercase tracking-wider">
              Modelo ilustrativo · dados fictícios
            </p>
            <p className="font-serif text-lg font-semibold sm:text-xl">{MODELO_RELATORIO_META.titulo}</p>
            <p className="text-sm opacity-90">
              {MODELO_RELATORIO_META.referencia} · {MODELO_RELATORIO_META.area}
            </p>
          </div>
          <CardContent className="space-y-6 p-6 md:p-8">
            <p className="rounded-md border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-950">
              {MODELO_RELATORIO_META.aviso}
            </p>

            {MODELO_RELATORIO_SECOES.map((sec) => (
              <article key={sec.titulo} className="space-y-2">
                <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-primary">
                  <FileText className="size-4 text-accent" />
                  {sec.titulo}
                </h3>
                <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                  {sec.corpo.split("**").map((part, i) =>
                    i % 2 === 1 ? (
                      <strong key={i} className="font-medium text-foreground">
                        {part}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </div>
              </article>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/solicitar">Solicitar pesquisa</Link>
          </Button>
          {!compact && (
            <Button asChild variant="outline" size="lg">
              <Link href="/modelo-relatorio">{COPY_SITE.modelo.cta}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
