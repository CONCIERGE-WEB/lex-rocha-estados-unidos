"use client";

import { useEffect } from "react";

export default function RequestRedirectPage() {
  useEffect(() => {
    window.location.replace("/#pedir-relatorio");
  }, []);

  return (
    <main className="flex min-h-[40vh] items-center justify-center">
      <p className="text-muted">Redirecting to analysis form…</p>
    </main>
  );
}
