"use client";

import { COPY } from "@/lib/constants/copy-en";

export function ManageCookiesButton() {
  return (
    <button
      type="button"
      className="mt-3 text-sm font-semibold text-onDark underline-offset-4 hover:text-onDark hover:underline"
      onClick={() =>
        window.dispatchEvent(new CustomEvent("judicial-intelligence:open-cookie-settings"))
      }
    >
      {COPY.footer.links.manageCookies}
    </button>
  );
}
