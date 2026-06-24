/** Bloco «em resumo» — reduz carga cognitiva em páginas densas */
export function ContentSummary({
  title = "Em resumo",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className="cite-block border-trust/40 bg-trust/5">
      <p className="cite-label">{title}</p>
      <div className="mt-3 space-y-2 text-body text-ink">{children}</div>
    </aside>
  );
}
