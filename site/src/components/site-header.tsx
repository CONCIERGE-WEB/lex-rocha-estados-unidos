"use client";

import { useState } from "react";
import Link from "next/link";

import { BrandLogo } from "@/components/brand-logo";
import { COPY } from "@/lib/constants/copy-en";
import { EMPRESA } from "@/lib/constants/empresa";
import { NAV_LINKS } from "@/lib/constants/nav";

/** Sticky nav — deep navy for brand contrast (#040A1F). */
const NAV_BG = "#040A1F";

export function SiteHeader() {
  const [menuAberto, setMenuAberto] = useState(false);
  const fechar = () => setMenuAberto(false);

  return (
    <header className="sticky top-0 z-40" style={{ backgroundColor: NAV_BG }}>
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs md:px-6">
          <p className="hidden truncate font-medium text-slate-300 sm:block">
            {COPY.topBar.tagline}
          </p>
          <div className="ml-auto flex items-center gap-4 font-semibold text-slate-100">
            <a href="/track" className="transition hover:text-white">
              {COPY.nav.track}
            </a>
            <span className="text-white/25" aria-hidden="true">
              |
            </span>
            <a href="/contact" className="transition hover:text-white">
              {COPY.nav.contacto}
            </a>
            <span className="hidden text-white/25 sm:inline" aria-hidden="true">
              |
            </span>
            <a
              href={`mailto:${EMPRESA.emailContacto}`}
              className="hidden transition hover:text-white sm:inline"
            >
              {COPY.nav.support}
            </a>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3.5 md:px-6 md:py-4">
          <a
            href="/"
            className="min-w-0 max-w-[calc(100%-3rem)] shrink transition-opacity hover:opacity-90 sm:max-w-none"
            onClick={fechar}
          >
            <BrandLogo variant="dark" />
          </a>

          <nav
            className="hidden items-center gap-x-5 text-sm font-bold text-slate-100 lg:flex"
            aria-label="Main"
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="whitespace-nowrap transition hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-1.5 lg:flex xl:gap-2">
            <Link
              href="/login"
              className="rounded-md px-2.5 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              {COPY.nav.login}
            </Link>
            <Link
              href="/signup"
              className="hidden rounded-md border border-white/25 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 xl:inline-flex"
            >
              {COPY.nav.signup}
            </Link>
            <a
              href="/request"
              className="btn-primary whitespace-nowrap text-sm shadow-none"
            >
              {COPY.nav.request}
            </a>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/25 text-white lg:hidden"
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
            className="motion-safe:animate-menu-in border-t border-white/10 px-4 py-4 lg:hidden"
            style={{ backgroundColor: NAV_BG }}
            aria-label="Mobile menu"
          >
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="block rounded-md px-3 py-3 text-base font-medium text-slate-100 transition hover:bg-white/10 hover:text-white"
                    onClick={fechar}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/track"
                  className="block rounded-md px-3 py-3 text-base font-medium text-slate-100 transition hover:bg-white/10"
                  onClick={fechar}
                >
                  {COPY.nav.track}
                </a>
              </li>
              <li>
                <a
                  href="/partners"
                  className="block rounded-md px-3 py-3 text-base font-medium text-slate-100 transition hover:bg-white/10"
                  onClick={fechar}
                >
                  {COPY.nav.forAttorneys}
                </a>
              </li>
              <li className="pt-3">
                <Link
                  href="/login"
                  className="block rounded-md border border-white/25 px-3 py-3 text-center text-base font-semibold text-white"
                  onClick={fechar}
                >
                  {COPY.nav.login}
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="block rounded-md border border-white/25 px-3 py-3 text-center text-base font-semibold text-white"
                  onClick={fechar}
                >
                  {COPY.nav.signup}
                </Link>
              </li>
              <li>
                <a
                  href="/request"
                  className="btn-primary mt-1 block w-full text-center"
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
