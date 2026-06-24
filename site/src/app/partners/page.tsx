import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { COPY } from "@/lib/constants/copy-en";
import { EMPRESA } from "@/lib/constants/empresa";

export const metadata = {
  title: `Partner waitlist — ${EMPRESA.marca}`,
  description: COPY.partners.pageIntro,
};

export default function PartnersPage() {
  const P = COPY.partners;
  const mailto = `mailto:${EMPRESA.emailContacto}?subject=${encodeURIComponent(P.mailtoSubject)}`;

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10 bg-folio px-4 py-4 md:px-6">
        <Link href="/">
          <BrandLogo />
        </Link>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-16">
        <span className="inline-block rounded-full border border-trust/30 bg-cite px-3 py-1 text-xs font-semibold uppercase tracking-wide text-trust">
          {P.badge}
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink md:text-4xl">{P.pageTitle}</h1>
        <p className="mt-4 text-lg text-muted">{P.pageIntro}</p>

        <div className="feature-card mt-8">
          <h2 className="font-display text-xl font-semibold text-ink">Expected benefits</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {P.benefits.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-verify" aria-hidden="true">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 rounded-xl border border-ink/10 bg-folio p-6 text-center">
          <p className="text-sm text-muted">{P.mailtoNote}</p>
          <a href={mailto} className="btn-primary mt-4 inline-flex">
            {P.mailtoCta}
          </a>
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          <Link href="/" className="font-semibold text-trust underline underline-offset-4">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
