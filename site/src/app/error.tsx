"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="content" className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold text-ink">Something went wrong</h1>
      <p className="mt-4 text-body font-medium text-muted">Try reloading the page.</p>
      <button type="button" onClick={() => reset()} className="btn-primary mt-8">
        Try again
      </button>
    </main>
  );
}
