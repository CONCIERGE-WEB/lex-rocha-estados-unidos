import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { COPY } from "@/lib/constants/copy-en";
import { EMPRESA } from "@/lib/constants/empresa";

export const metadata = {
  title: `Create account — ${EMPRESA.marca}`,
  description: COPY.signup.lead,
};

export default function SignupPage() {
  const S = COPY.signup;

  return (
    <>
      <SiteHeader />
      <main id="content" className="border-b border-ink/8 bg-folio">
        <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
          <p className="section-eyebrow">{S.eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
            {S.title}
          </h1>
          <p className="mt-3 max-w-xl text-lead text-muted">{S.lead}</p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <article className="rounded-2xl border border-ink/10 bg-paper p-6 shadow-sm">
              <h2 className="font-display text-xl font-semibold text-ink">{S.consumerTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{S.consumerText}</p>
              <div className="mt-5 flex flex-col gap-2">
                <Link href="/request" className="btn-primary text-center text-sm">
                  {S.consumerCta}
                </Link>
                <Link
                  href="/track"
                  className="rounded-md border border-ink/15 px-4 py-2.5 text-center text-sm font-semibold text-ink transition hover:bg-cite/30"
                >
                  {S.consumerTrack}
                </Link>
              </div>
            </article>

            <article className="rounded-2xl border border-ink/10 bg-ink p-6 text-onDark shadow-sm">
              <h2 className="font-display text-xl font-semibold text-onDark">
                {S.attorneyTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-onDarkMuted">{S.attorneyText}</p>
              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href="/partners"
                  className="rounded-md bg-folio px-4 py-2.5 text-center text-sm font-semibold text-ink transition hover:opacity-90"
                >
                  {S.attorneyCta}
                </Link>
                <Link
                  href="/login"
                  className="text-center text-sm font-medium text-onDarkMuted underline-offset-4 hover:text-onDark hover:underline"
                >
                  {S.haveAccount}
                </Link>
              </div>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}
