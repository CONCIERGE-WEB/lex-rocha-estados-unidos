"use client";

export function ManageCookiesButton() {
  return (
    <button
      type="button"
      className="mt-3 text-sm text-primary-foreground/95 underline-offset-4 hover:underline"
      onClick={() =>
        window.dispatchEvent(new CustomEvent("lex-rocha:open-cookie-settings"))
      }
    >
      Gerenciar cookies
    </button>
  );
}
