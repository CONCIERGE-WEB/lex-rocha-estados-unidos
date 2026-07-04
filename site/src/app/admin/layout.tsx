import { AdminNav } from "@/components/admin/admin-nav";
import { SITE } from "@/lib/constants/site";
import { emailAdminAtual } from "@/lib/security/admin-session.server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await emailAdminAtual();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {SITE.name} · Administração
            </p>
            {email ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-slate-500 sm:inline">{email}</span>
                <form action="/api/admin/logout" method="post">
                  <button
                    type="submit"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Sair
                  </button>
                </form>
              </div>
            ) : null}
          </div>
          {email ? (
            <div className="mt-4">
              <AdminNav />
            </div>
          ) : null}
        </div>
      </header>
      {children}
    </div>
  );
}
