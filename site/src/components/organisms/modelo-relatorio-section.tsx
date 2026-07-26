import Link from "next/link";
import { FileText } from "lucide-react";

import { SectionHeading } from "@/components/atoms/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { COPY_SITE } from "@/lib/constants/copy-site";
import {
  MODELO_CABECALHO_CLIENTE,
  MODELO_EXEMPLOS_POR_CATEGORIA,
  MODELO_RELATORIO_META,
  MODELO_RELATORIO_SECOES,
} from "@/lib/constants/modelo-relatorio-demo";

export function ModeloRelatorioSection({ compact = false }: { compact?: boolean }) {
  return (
    <section
      id={compact ? undefined : "modelo-relatorio"}
      className={`scroll-mt-20 ${compact ? "py-12" : "border-y border-ink/8 bg-paper/40 py-20"}`}
    >
      <div className="mx-auto max-w-4xl space-y-8 px-4 md:px-6">
        {!compact && (
          <SectionHeading
            eyebrow={COPY_SITE.modelo.eyebrow}
            title={COPY_SITE.modelo.title}
            description={COPY_SITE.modelo.description}
          />
        )}

        <Card className="overflow-hidden border-ink/10 shadow-md">
          <div className="border-b border-ink/10 bg-ink px-4 py-4 text-onDark sm:px-6">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-onDarkMuted">
              Illustrative sample · anonymized facts
            </p>
            <p className="mt-1 font-display text-lg font-semibold sm:text-xl">
              {MODELO_RELATORIO_META.titulo}
            </p>
            <p className="text-sm text-onDarkMuted">
              {MODELO_RELATORIO_META.referencia} · {MODELO_RELATORIO_META.area} ·{" "}
              {MODELO_CABECALHO_CLIENTE.state}
            </p>
          </div>
          <CardContent className="space-y-6 p-6 md:p-8">
            <p className="rounded-md border border-amber-200/80 bg-amber-50/90 p-3 text-xs text-amber-950">
              {MODELO_RELATORIO_META.aviso}
            </p>

            <dl className="grid gap-2 text-sm text-muted sm:grid-cols-2">
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wide">Requester</dt>
                <dd className="font-medium text-ink">{MODELO_CABECALHO_CLIENTE.solicitante}</dd>
              </div>
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-wide">Plan</dt>
                <dd className="font-medium text-ink">{MODELO_CABECALHO_CLIENTE.plano}</dd>
              </div>
            </dl>

            {MODELO_RELATORIO_SECOES.map((sec) => (
              <article key={sec.titulo} className="space-y-2">
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                  <FileText className="size-4 text-trust" aria-hidden />
                  {sec.titulo}
                </h3>
                <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted">
                  {sec.corpo.split("**").map((part, i) =>
                    i % 2 === 1 ? (
                      <strong key={i} className="font-medium text-ink">
                        {part}
                      </strong>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  )}
                </div>
              </article>
            ))}
          </CardContent>
        </Card>

        {!compact ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MODELO_EXEMPLOS_POR_CATEGORIA.map((ex) => (
              <div
                key={ex.id}
                className="rounded-xl border border-ink/10 bg-folio p-4 text-sm shadow-sm"
              >
                <p className="font-semibold text-ink">{ex.label}</p>
                <p className="mt-2 text-muted">{ex.resumoFicticio}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/request">Start analysis</Link>
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
