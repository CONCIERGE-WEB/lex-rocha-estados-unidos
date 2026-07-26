import { Building2, HandCoins, ShieldCheck, BookMarked, Clock } from "lucide-react";

import { SectionHeading } from "@/components/atoms/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { COPY_SITE } from "@/lib/constants/copy-site";
import { PRECIFICACAO } from "@/lib/constants/pesquisa-documental";
import { CAPACIDADE_OPERACIONAL } from "@/lib/pedidos/capacidade";

const icons = [HandCoins, Clock, ShieldCheck, BookMarked, Building2] as const;

export function TrustSection() {
  const { trust } = COPY_SITE;

  const pillars = trust.pillars.map((pillar, i) => {
    let text: string = pillar.text;
    if (i === 0) {
      text = `Plans from $${PRECIFICACAO.essencial.valor}. ${pillar.text}`;
    }
    if (i === 1) {
      text = `Até ${CAPACIDADE_OPERACIONAL.maxRelatoriosPorDia} relatórios por dia útil na operação atual. ${pillar.text}`;
    }
    return { ...pillar, text, icon: icons[i] ?? ShieldCheck };
  });

  return (
    <section id="confianca" className="scroll-mt-20 bg-secondary/30 py-20 md:py-24">
      <div className="mx-auto max-w-6xl space-y-12 px-4 md:px-6">
        <SectionHeading
          eyebrow={trust.eyebrow}
          title={trust.title}
          description={trust.description}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={pillar.title}
                className="bg-card/80 transition-shadow hover:shadow-md"
              >
                <CardContent className="flex gap-4 p-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">{pillar.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {pillar.text}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
