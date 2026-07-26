"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { COPY } from "@/lib/constants/copy-en";

const ERRORS: Record<string, string> = {
  google: "Google sign-in was cancelled or declined.",
  codigo: "Incomplete Google response. Please try again.",
  state: "Invalid OAuth session. Please try again.",
  config: "Google sign-in is not configured in this environment.",
  token: "Could not validate the Google token.",
  nao_autorizado: "This Google account is not authorized.",
  falha: "Sign-in failed. Please try again.",
};

export function LoginPageClient({
  erroKey,
  googleOk,
  emailsAdmin = [],
}: {
  erroKey?: string;
  googleOk: boolean;
  emailsAdmin?: string[];
}) {
  const L = COPY.login;
  const erro = erroKey ? (ERRORS[erroKey] ?? L.errorGeneric) : null;
  const [emailHint, setEmailHint] = useState("");
  const emailNorm = emailHint.trim().toLowerCase();
  const eAdmin = emailsAdmin.includes(emailNorm);
  const emailOk = emailNorm.includes("@") && emailNorm.includes(".");
  const podeGoogle = googleOk && (eAdmin || emailOk);

  const hrefGoogle = eAdmin
    ? "/api/admin/auth/google?retorno=%2Flogin"
    : "/partners";

  const avisoAdmin = useMemo(() => {
    if (eAdmin) return L.adminHint;
    return null;
  }, [eAdmin, L.adminHint]);

  return (
    <>
      <SiteHeader />
      <main id="content" className="border-b border-ink/8 bg-folio">
        <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
          <p className="section-eyebrow">{L.eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
            {L.title}
          </h1>
          <p className="mt-3 max-w-xl text-lead text-muted">{L.lead}</p>
          {erro ? (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {erro}
            </p>
          ) : null}

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <article className="rounded-2xl border border-ink/10 bg-paper p-6 shadow-sm">
              <h2 className="font-display text-xl font-semibold text-ink">{L.consumerTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{L.consumerText}</p>
              <div className="mt-5 flex flex-col gap-2">
                <Link href="/track" className="btn-primary text-center text-sm">
                  {L.consumerTrack}
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md border border-ink/15 px-4 py-2.5 text-center text-sm font-semibold text-ink transition hover:bg-cite/30"
                >
                  {L.consumerSignup}
                </Link>
                <Link
                  href="/request"
                  className="text-center text-sm font-medium text-trust underline-offset-4 hover:underline"
                >
                  {L.consumerRequest}
                </Link>
              </div>
            </article>

            <article className="rounded-2xl border border-ink/10 bg-ink p-6 text-onDark shadow-sm">
              <h2 className="font-display text-xl font-semibold text-onDark">
                {L.attorneyTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-onDarkMuted">{L.attorneyText}</p>

              <div className="mt-4 space-y-1.5">
                <label
                  htmlFor="login-email-hint"
                  className="block font-mono text-[11px] font-bold uppercase tracking-wide text-folio"
                >
                  {L.emailLabel}
                </label>
                <input
                  id="login-email-hint"
                  type="email"
                  autoComplete="email"
                  placeholder={L.emailPlaceholder}
                  value={emailHint}
                  onChange={(e) => setEmailHint(e.target.value)}
                  className="w-full rounded-md border border-onDark/20 bg-folio px-3 py-2.5 text-sm text-ink placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-folio"
                />
                <p className="text-xs leading-relaxed text-onDarkMuted">
                  {avisoAdmin ?? L.emailHint}
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                {eAdmin && googleOk ? (
                  <a
                    href={hrefGoogle}
                    className={`rounded-md bg-folio px-4 py-2.5 text-center text-sm font-semibold text-ink transition hover:opacity-90 ${
                      podeGoogle ? "" : "pointer-events-none opacity-40"
                    }`}
                  >
                    {L.googleAdmin}
                  </a>
                ) : (
                  <Link
                    href="/partners"
                    className="rounded-md bg-folio px-4 py-2.5 text-center text-sm font-semibold text-ink transition hover:opacity-90"
                  >
                    {L.attorneyCta}
                  </Link>
                )}
                <Link
                  href="/contact"
                  className="text-center text-sm font-medium text-onDarkMuted underline-offset-4 hover:text-onDark hover:underline"
                >
                  {L.contact}
                </Link>
              </div>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}
