import Link from "next/link";

import { Logo } from "@/components/atoms/logo";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function LegalDocLayout({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-4 py-4 md:px-6">
        <Logo />
      </header>
      <article className="prose prose-slate mx-auto max-w-3xl px-4 py-12 md:px-6">
        <h1>{title}</h1>
        {children}
        <p className="not-prose mt-10">
          <Link href="/" className="text-primary hover:underline">
            ← Voltar ao site
          </Link>
        </p>
      </article>
    </div>
  );
}
