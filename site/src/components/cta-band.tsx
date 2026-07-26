import { Reveal } from "@/components/reveal";
import { COPY } from "@/lib/constants/copy-en";

export function CtaBand() {
  const C = COPY.ctaBand;

  return (
    <section className="border-b border-trustDeep/30 bg-hero-gradient py-14 md:py-16">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center md:px-6 lg:flex-row lg:justify-between lg:text-left">
        <Reveal variant="left" className="max-w-xl">
          <h2 className="font-display text-2xl font-bold text-onDark md:text-3xl">{C.title}</h2>
          <p className="mt-3 text-base font-medium text-onDark md:text-lg">{C.lead}</p>
        </Reveal>
        <Reveal
          variant="right"
          delay={100}
          className="flex shrink-0 flex-wrap justify-center gap-3 lg:justify-end"
        >
          <a href="/request" className="btn-primary min-w-[180px]">
            {C.primary}
          </a>
          <a href="#pricing" className="btn-outline-light min-w-[140px]">
            {C.secondary}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
