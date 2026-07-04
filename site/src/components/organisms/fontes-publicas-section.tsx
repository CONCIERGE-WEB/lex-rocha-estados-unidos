import Link from "next/link";
import { ExternalLink, Globe } from "lucide-react";

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
import { FONTES_PESQUISA_PUBLICA } from "@/lib/constants/fontes-publicas";

const tipoLabel = {
  jurisprudencia: "Jurisprudência",
  legislacao: "Legislação",
  consumidor: "Consumidor",
  dados_abertos: "Dados abertos",
} as const;

export function FontesPublicasSection() {
  const { fontes } = COPY_SITE;

  return (
    <section id="fontes" className="scroll-mt-20 border-y bg-secondary/20 py-20">
      <div className="mx-auto max-w-6xl space-y-10 px-4 md:px-6">
        <SectionHeading
          eyebrow={fontes.eyebrow}
          title={fontes.title}
          description={fontes.description}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {FONTES_PESQUISA_PUBLICA.map((fonte) => (
            <Card key={fonte.url}>
              <CardHeader className="pb-2">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Badge variant="secondary">{tipoLabel[fonte.tipo]}</Badge>
                  <Globe className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">{fonte.nome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-sm leading-relaxed">
                  {fonte.descricao}
                </CardDescription>
                <Link
                  href={fonte.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Acessar portal
                  <ExternalLink className="size-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
