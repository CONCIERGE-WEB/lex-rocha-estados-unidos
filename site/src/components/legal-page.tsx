import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { EMPRESA } from "@/lib/constants/empresa";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="content" className="border-b border-ink/8 py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <p className="cite-label">
            <Link href="/" className="transition hover:text-action">
              ← {EMPRESA.marca}
            </Link>
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-ink">{title}</h1>
          <div className="prose-legal mt-10 space-y-6 text-base font-medium leading-relaxed text-muted">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
