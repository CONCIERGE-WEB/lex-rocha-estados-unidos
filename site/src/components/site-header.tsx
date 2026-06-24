"use client";

import { useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { COPY } from "@/lib/constants/copy-en";
import { EMPRESA } from "@/lib/constants/empresa";
import { NAV_LINKS } from "@/lib/constants/nav";

export function SiteHeader() {
  const [menuAberto, setMenuAberto] = useState(false);
  const fechar = () => setMenuAberto(false);

  return (
    <header className="sticky top-0 z-40">
      <div className="hidden border-b border-ink/10 bg-ink text-folio sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs md:px-6">
          <p className="truncate font-medium text-onDarkMuted">{COPY.topBar.tagline}</p>
          <div className="flex items-center gap-4 font-semibold text-onDark">
            <a href="/track" className="transition hover:text-folio">
              {COPY.nav.track}
            </a>
            <span className="text-folio/20" aria-hidden="true">
              |
            </span>
            <a href="/contact" className="transition hover:text-folio">
              {COPY.nav.contacto}
            </a>
            <span className="text-folio/20" aria-hidden="true">
              |
            </span>
            <a href={`mailto:${EMPRESA.emailContacto}`} className="transition hover:text-folio">
              {COPY.nav.support}
            </a>
          </div>
        </div>
      </div>

      <div className="border-b border-ink/10 bg-folio/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3.5 md:px-6 md:py-4">
          <a
            href="/"
            className="min-w-0 max-w-[calc(100%-3rem)] shrink transition-opacity hover:opacity-90 sm:max-w-none"
            onClick={fechar}
          >
            <BrandLogo />
          </a>

          <nav
            className="hidden items-center gap-x-5 text-sm font-bold text-muted lg:flex"
            aria-label="Main"
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="whitespace-nowrap transition hover:text-trust"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <a
              href="/track"
              className="rounded-md px-3 py-2 text-sm font-bold text-muted transition hover:bg-cite/40 hover:text-trust"
            >
              {COPY.nav.track}
            </a>
            <a
              href="/partners"
              className="hidden rounded-md px-3 py-2 text-sm font-semibold text-muted transition hover:bg-cite/40 hover:text-trust xl:inline-flex"
            >
              {COPY.nav.forAttorneys}
            </a>
            <a href="/#pedir-relatorio" className="btn-primary whitespace-nowrap text-sm">
              {COPY.nav.request}
            </a>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-ink/15 text-ink lg:hidden"
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
            aria-label={menuAberto ? "Close menu" : "Open menu"}
            onClick={() => setMenuAberto((v) => !v)}
          >
            {menuAberto ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

        {menuAberto ? (
          <nav
            id="menu-mobile"
            className="border-t border-ink/10 bg-folio px-4 py-4 lg:hidden"
            aria-label="Mobile menu"
          >
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="block rounded-md px-3 py-3 text-base font-medium text-ink transition hover:bg-cite/30"
                    onClick={fechar}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/track"
                  className="block rounded-md px-3 py-3 text-base font-medium text-ink transition hover:bg-cite/30"
                  onClick={fechar}
                >
                  {COPY.nav.track}
                </a>
              </li>
              <li>
                <a
                  href="/partners"
                  className="block rounded-md px-3 py-3 text-base font-medium text-ink transition hover:bg-cite/30"
                  onClick={fechar}
                >
                  {COPY.nav.forAttorneys}
                </a>
              </li>
              <li className="pt-2">
                <a
                  href="/#pedir-relatorio"
                  className="btn-primary block w-full text-center"
                  onClick={fechar}
                >
                  {COPY.nav.request}
                </a>
              </li>
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
