import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SITE } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: "Deprecated — use /request",
  description: "This Portuguese route is deprecated. Use /request.",
  alternates: { canonical: `${SITE.url}/request` },
  robots: { index: false, follow: false },
};

/**
 * Legacy BR path. Etapa 1: redirect to canonical EN `/request`.
 * Set `?stay=1` only for local inspection of the deprecation banner (no form).
 */
export default async function SolicitarLegacyPage({
  searchParams,
}: {
  searchParams: Promise<{ stay?: string }>;
}) {
  const sp = await searchParams;
  if (sp.stay !== "1") {
    redirect("/request");
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
        Deprecated
      </p>
      <h1 className="mt-2 font-serif text-2xl font-bold">
        /solicitar is legacy
      </h1>
      <p className="mt-3 text-muted-foreground">
        The canonical request form is{" "}
        <Link href="/request" className="font-medium text-primary underline">
          /request
        </Link>
        .
      </p>
    </main>
  );
}
