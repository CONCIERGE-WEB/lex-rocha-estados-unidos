"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-US">
      <body className="bg-paper text-ink antialiased">
        <main className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold">Algo correu mal</h1>
          <p className="mt-4 text-slate-600">Tente recarregar a página.</p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-md bg-trust px-5 py-3 text-white"
          >
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
