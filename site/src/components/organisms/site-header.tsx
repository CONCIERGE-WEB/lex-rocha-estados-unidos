import Link from "next/link";
import { Menu } from "lucide-react";

import { Logo } from "@/components/atoms/logo";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071D31] bg-gradient-to-r from-[#071D31] via-[#0d2c4a] to-[#071D31]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4 md:px-6">
        <Logo showTagline className="[&_span]:text-white" />
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/85 transition-colors hover:text-[#FEBD1C]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            <Link href="/acompanhar">Acompanhar</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden text-white hover:bg-white/10 hover:text-white md:inline-flex"
          >
            <Link href="/parceiro">Sou advogado</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="border border-[#FEBD1C] bg-transparent px-3 text-xs font-semibold text-[#FEBD1C] shadow-none hover:bg-[#FEBD1C] hover:text-[#071D31] sm:px-4 sm:text-sm"
          >
            <Link href="/solicitar">
              <span className="sm:hidden">Solicitar</span>
              <span className="hidden sm:inline">Solicitar pesquisa</span>
            </Link>
          </Button>

          <details className="relative md:hidden">
            <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md text-white hover:bg-white/10 [&::-webkit-details-marker]:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Abrir menu</span>
            </summary>
            <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-xl border border-white/10 bg-[#071D31] p-2 shadow-2xl">
              <nav className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-[#FEBD1C]"
                  >
                    {link.label}
                  </Link>
                ))}
                <span aria-hidden className="my-1 h-px bg-white/10" />
                <Link
                  href="/acompanhar"
                  className="rounded-md px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-[#FEBD1C]"
                >
                  Acompanhar
                </Link>
                <Link
                  href="/parceiro"
                  className="rounded-md px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-[#FEBD1C]"
                >
                  Sou advogado
                </Link>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
