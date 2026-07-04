import Link from "next/link";
import { ExternalLink, Scale } from "lucide-react";

import { SectionHeading } from "@/components/atoms/section-heading";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { COPY_SITE } from "@/lib/constants/copy-site";
import { CASOS_PRECEDENTES_AMOSTRA } from "@/lib/data/precedentes";

export function PrecedentesSection() {
  const { precedentes } = COPY_SITE;

  return (
    <section id="precedentes" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-6xl space-y-10 px-4 md:px-6">
        <SectionHeading
          eyebrow={precedentes.eyebrow}
          title={precedentes.title}
          description={precedentes.description}
        />
        <div className="grid gap-6 md:grid-cols-2">
          {CASOS_PRECEDENTES_AMOSTRA.map((caso) => (
            <Card key={caso.titulo} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {caso.tribunal} · {caso.ano}
                  </Badge>
                  <Scale className="ml-auto size-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg leading-snug">{caso.titulo}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  <span className="font-medium text-foreground/80">O que aconteceu: </span>
                  {caso.situacao}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground/80">O que o juiz decidiu: </span>
                  {caso.decisao}
                </p>
                <p className="rounded-md border border-accent/20 bg-accent/5 px-3 py-2 text-sm font-medium text-primary">
                  Resultado: {caso.resultado}
                </p>
                <Link
                  href={caso.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Conferir fonte pública
                  <ExternalLink className="size-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">{precedentes.notaAmostra}</p>
      </div>
    </section>
  );
}
