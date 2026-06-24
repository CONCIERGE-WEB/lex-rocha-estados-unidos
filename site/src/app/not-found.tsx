import Link from "next/link";

export default function NotFound() {
  return (
    <main id="content" className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-4 text-body font-medium text-muted">The address you requested does not exist.</p>
      <Link href="/" className="btn-primary mt-8 inline-block">
        Back to home
      </Link>
    </main>
  );
}
