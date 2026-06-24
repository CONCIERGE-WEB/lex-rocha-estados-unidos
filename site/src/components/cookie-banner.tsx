"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { COPY } from "@/lib/constants/copy-en";

const STORAGE_KEY = "cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }

    const open = () => setVisible(true);
    window.addEventListener("judicial-intelligence:open-cookie-settings", open);
    return () => window.removeEventListener("judicial-intelligence:open-cookie-settings", open);
  }, []);

  const save = (value: "essential" | "all") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-title"
      className="fixed bottom-0 left-0 right-0 z-50 max-h-[45vh] overflow-y-auto border-t border-ink/10 bg-folio p-4 shadow-lift sm:max-h-none md:p-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <p id="cookie-title" className="sr-only">
            Cookie consent
          </p>
          <p className="text-body leading-relaxed text-muted">
            {COPY.cookie.texto}{" "}
            <Link href="/cookies" className="font-medium text-trust underline underline-offset-4">
              Cookie Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => save("essential")} className="btn-secondary">
            {COPY.cookie.rejeitar}
          </button>
          <button type="button" onClick={() => save("all")} className="btn-primary">
            {COPY.cookie.aceitar}
          </button>
        </div>
      </div>
    </div>
  );
}
