"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/relatorios", label: "Relatórios" },
  { href: "/admin/solicitacoes", label: "Solicitações" },
  { href: "/admin/financeiro", label: "Financeiro" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  function ativo(href: string): boolean {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <nav className="flex flex-wrap gap-2">
      {ITENS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={
            ativo(item.href)
              ? "rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
              : "rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          }
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
