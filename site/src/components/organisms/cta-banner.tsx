import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { WhatsAppButton } from "@/components/atoms/whatsapp-button";
import { Button } from "@/components/ui/button";
import { copyComSite } from "@/lib/constants/copy-helpers";
import { COPY_SITE } from "@/lib/constants/copy-site";

export function CtaBanner() {
  const { cta } = COPY_SITE;
  const msg = copyComSite(cta.whatsappMensagem);

  return (
    <section className="px-4 py-20 md:px-6">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-accent/25 bg-[#071D31] px-6 py-16 text-center shadow-xl md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(43_72%_47%/_0.18),_transparent_60%)]"
        />
        <div className="relative z-10">
          <h2 className="font-serif text-3xl font-bold text-accent-foreground md:text-4xl">
            {cta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            {cta.description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="accent" className="h-12 gap-2 px-8 shadow-md">
              <Link href="/request">
                {cta.primary}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <WhatsAppButton mensagem={msg} size="lg" className="h-12 px-8">
              WhatsApp
            </WhatsAppButton>
          </div>
          <p className="mt-6 text-sm text-primary-foreground/70">
            Triagem inicial sem cobrança · valor exato antes de pagar
          </p>
        </div>
      </div>
    </section>
  );
}
