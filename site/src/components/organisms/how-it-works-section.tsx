import { ClipboardList, FileSearch, Send } from "lucide-react";

import { SectionHeading } from "@/components/atoms/section-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { COPY_SITE } from "@/lib/constants/copy-site";

const icons = [ClipboardList, FileSearch, Send] as const;

export function HowItWorksSection() {
  const { howItWorks } = COPY_SITE;

  return (
    <section id="how-it-works" className="scroll-mt-20 bg-background py-20 md:py-24">
      <div className="mx-auto max-w-6xl space-y-12 px-4 md:px-6">
        <SectionHeading
          eyebrow={howItWorks.eyebrow}
          title={howItWorks.title}
          description={howItWorks.description}
        />
        <div className="grid gap-6 md:grid-cols-3">
          {howItWorks.steps.map((step, i) => {
            const Icon = icons[i] ?? ClipboardList;
            return (
              <Card
                key={step.title}
                className="border-border/80 transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="font-serif text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
