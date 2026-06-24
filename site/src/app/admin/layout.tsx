export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Administrative area
          </p>
        </div>
      </header>
      {children}
    </div>
  );
}
