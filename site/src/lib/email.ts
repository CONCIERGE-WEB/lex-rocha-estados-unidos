export function emailValido(email: string): boolean {
  const t = email.trim();
  if (!t || t.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}
