import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants/site";

type LogoProps = {
  className?: string;
  showTagline?: boolean;
};

export function Logo({ className, showTagline = false }: LogoProps) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative block size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-accent/40 md:size-10">
        <Image
          src="/brand/lex-rocha-emblem.png"
          alt={`Emblema ${SITE.name}`}
          fill
          priority
          sizes="44px"
          className="scale-110 object-cover"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-xl font-bold tracking-tight text-primary md:text-2xl">
          {SITE.name}
        </span>
        {showTagline && (
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Pesquisa de Jurisprudência
          </span>
        )}
      </span>
    </Link>
  );
}
