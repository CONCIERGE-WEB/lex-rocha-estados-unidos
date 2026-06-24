import Link from "next/link";

type Props = {
  actual: "financeiro" | "relatorios";
};

export function AdminNav({ actual }: Props) {
  const link = (href: string, label: string, key: Props["actual"]) => (
    <Link
      href={href}
      className={
        actual === key
          ? "rounded-lg bg-action px-4 py-2 font-semibold text-white"
          : "rounded-lg border-2 border-slate-300 px-4 py-2 font-semibold text-ink hover:bg-slate-50"
      }
    >
      {label}
    </Link>
  );

  return (
    <nav className="mt-6 flex flex-wrap gap-3">
      {link("/admin/financeiro", "Revenue", "financeiro")}
      {link("/admin/relatorios", "Reports", "relatorios")}
    </nav>
  );
}
