import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { WhatsAppButton } from "@/components/atoms/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { copyComSite } from "@/lib/constants/copy-helpers";
import { COPY_SITE } from "@/lib/constants/copy-site";
import { PRECIFICACAO } from "@/lib/constants/pesquisa-documental";

export function HeroSection() {
  const { hero } = COPY_SITE;
  const msgWhatsapp = copyComSite(hero.whatsappMensagem);
  const footnote = copyComSite(hero.footnote, { essencial: PRECIFICACAO.essencial.valor });

  return (
    <section className="gpu-safe-section relative isolate overflow-hidden border-b bg-background md:bg-gradient-to-b md:from-background md:via-background md:to-secondary/40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent md:block"
      />
      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:px-6 md:py-24">
        <div className="space-y-6">
          <Badge variant="accent" className="gap-1">
            <BookOpen className="size-3.5" />
            {hero.badge}
          </Badge>
          <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-primary md:text-5xl lg:text-[3.25rem]">
            {hero.title}{" "}
            <span className="text-primary underline decoration-accent decoration-2 underline-offset-4">
              {hero.titleHighlight}
            </span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-foreground/90">{hero.lead}</p>
          <p className="max-w-xl text-base text-muted-foreground">{hero.scope}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="h-12 gap-2 px-8 shadow-md">
              <Link href="/request">
                {hero.ctaPrimary}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <Link href="/#como-funciona">{hero.ctaSecondary}</Link>
            </Button>
            <WhatsAppButton
              mensagem={msgWhatsapp}
              size="lg"
              variant="outline"
              className="h-12 px-8"
            >
              {hero.ctaWhatsapp}
            </WhatsAppButton>
          </div>
          <p className="text-xs text-muted-foreground">{footnote}</p>
        </div>
        <div className="relative mx-auto w-full max-w-md md:max-w-lg md:overflow-visible">
          <div
            aria-hidden
            className="mobile-no-blur absolute -inset-4 hidden rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl md:block"
          />
          <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-[#071D31] shadow-xl">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(213_60%_18%/_0.6),_transparent_70%)]"
            />
            <Image
              src="/brand/banner-lex-rocha.png"
              alt="Lex Rocha — Plataforma Digital · Pesquisa de Jurisprudência · CDC"
              width={1024}
              height={572}
              priority
              sizes="(max-width: 768px) 100vw, 32rem"
              className="relative z-10 h-auto w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
