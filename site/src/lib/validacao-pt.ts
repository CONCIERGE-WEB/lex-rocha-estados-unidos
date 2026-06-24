/** Validação de terminologia e formatos portugueses (anti pt-BR). */

const TERMOS_BR_PROIBIDOS = [
  { padrao: /\bcep\b/i, sugestao: "Código Postal" },
  { padrao: /\bcpf\b/i, sugestao: "NIF" },
  { padrao: /\bcelular\b/i, sugestao: "Telemóvel" },
  { padrao: /\brg\b/i, sugestao: "Cartão de Cidadão / NIF" },
  { padrao: /\bprocurador\b/i, sugestao: "Solicitador ou advogado" },
  { padrao: /\bjuizado\s+especial\b/i, sugestao: "Tribunal ou centro de arbitragem" },
];

export function validarTerminologiaPt(texto: string): string | null {
  for (const { padrao, sugestao } of TERMOS_BR_PROIBIDOS) {
    if (padrao.test(texto)) {
      return `Use terminologia portuguesa: prefira «${sugestao}» em vez de termos brasileiros.`;
    }
  }
  return null;
}

export function validarNif(nif: string): boolean {
  const limpo = nif.replace(/\s/g, "");
  if (!/^\d{9}$/.test(limpo)) return false;
  const check = limpo.split("").map(Number);
  const sum = check.slice(0, 8).reduce((a, d, i) => a + d * (9 - i), 0);
  const mod = sum % 11;
  const dig = mod < 2 ? 0 : 11 - mod;
  return dig === check[8];
}

export function validarCodigoPostal(cp: string): boolean {
  return /^\d{4}-\d{3}$/.test(cp.trim());
}

export function validarTelemovel(tel: string): boolean {
  const limpo = tel.replace(/[\s+()-]/g, "");
  const nacional = limpo.startsWith("351") ? limpo.slice(3) : limpo;
  return /^9\d{8}$/.test(nacional);
}

export function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
