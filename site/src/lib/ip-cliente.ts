/** IP do cliente a partir dos headers (Vercel / proxy). */
export function ipDoPedido(request: Request): string | null {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const primeiro = fwd.split(",")[0]?.trim();
    if (primeiro) return primeiro;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  return real || null;
}
