import Link from "next/link";
import { Briefcase, MapPin, Users } from "lucide-react";

import { SectionHeading } from "@/components/atoms/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COPY_SITE } from "@/lib/constants/copy-site";

const icons = [Users, MapPin, Briefcase] as const;

export function PartnersWaitlistSection() {
  const { parceiros } = COPY_SITE;

  return (
    <section id="parceiros" className="scroll-mt-20 border-y bg-primary py-20 text-primary-foreground">
      <div className="mx-auto max-w-6xl space-y-10 px-4 md:px-6">
        <SectionHeading
          eyebrow={parceiros.eyebrow}
          title={parceiros.title}
          description={parceiros.description}
          className="[&_h2]:text-primary-foreground [&_p]:text-primary-foreground/95 [&_span]:text-accent-bright"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {parceiros.cards.map((card, i) => {
            const Icon = icons[i] ?? Users;
            return (
              <Card
                key={card.title}
                className="border-primary-foreground/10 bg-primary-foreground/5 text-primary-foreground"
              >
                <CardContent className="space-y-3 p-6">
                  <Icon className="size-8 text-accent-bright" />
                  <h3 className="font-semibold">{card.title}</h3>
                  <p className="text-sm text-primary-foreground/95">{card.text}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge
            variant="outline"
            className="border-accent/50 bg-accent/10 text-primary-foreground"
          >
            {parceiros.badge}
          </Badge>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link href="/parceiro">{parceiros.cta}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
