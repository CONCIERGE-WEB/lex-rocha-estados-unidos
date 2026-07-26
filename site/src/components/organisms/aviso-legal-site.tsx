import Link from "next/link";

import { COPY_SITE } from "@/lib/constants/copy-site";

/** Aviso legal único na home — padrão de mercado: uma vez, discreto, com link aos Termos. */
export function AvisoLegalSite() {
  const { avisoLegal } = COPY_SITE;

  return (
    <aside
      aria-label="Aviso legal"
      className="border-t border-border/60 bg-muted-surface/80 py-6"
    >
      <div className="mx-auto max-w-4xl px-4 text-center text-sm leading-relaxed text-muted-foreground md:px-6">
        <p>
          {avisoLegal.texto}{" "}
          <Link href="/termos" className="font-medium text-primary underline underline-offset-4">
            {avisoLegal.linkTermos}
          </Link>
          .
        </p>
      </div>
    </aside>
  );
}
