import { Check } from "lucide-react";

import { SectionHeading } from "@/components/atoms/section-heading";
import { COPY_SITE } from "@/lib/constants/copy-site";

export function AreasAtendidasSection() {
  const { areas } = COPY_SITE;

  return (
    <section className="gpu-safe-section relative isolate scroll-mt-20 bg-background py-16">
      <div className="relative z-10 mx-auto max-w-6xl space-y-8 px-4 md:px-6">
        <SectionHeading
          eyebrow={areas.eyebrow}
          title={areas.title}
          description={areas.description}
        />
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {areas.lista.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
            >
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
