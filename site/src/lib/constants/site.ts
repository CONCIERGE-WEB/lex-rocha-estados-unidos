export const SITE = {
  name: "Judicial Intelligence",
  /** Full commercial lockup. */
  brandFull: "Judicial Intelligence | Tiago A. Rocha",
  legalName: "Judicial Intelligence",
  panoramaBrand: "Panorama | Tiago A. Rocha",
  serviceName: "Documentary Legal Research",
  founderRole: "Legal Research Specialist",
  domain: "judicialintelligence.com",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://www.judicialintelligence.com",
  ein: "61-699-939/0001-80",
  /** @deprecated Prefer `ein` — legacy BR field name still referenced in some UI. */
  cnpj: "61-699-939/0001-80",
  founder: "Tiago Aureliano da Rocha",
  founderShort: "Tiago A. Rocha",
  founderTitle: "Founder",
  city: "United States",
  state: "",
  email: process.env.CONTACT_EMAIL ?? "support@judicialintelligence.com",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
} as const;

export const HOME_SECTION_IDS = [
  "como-funciona",
  "modelo-relatorio",
  "confianca",
  "fontes",
  "precos",
  "precedentes",
  "parceiros",
  "pedir-relatorio",
] as const;

export const NAV_LINKS = [
  { href: "/#como-funciona", label: "How it works" },
  { href: "/modelo-relatorio", label: "Sample report" },
  { href: "/#fontes", label: "Public sources" },
  { href: "/#precos", label: "Pricing" },
  { href: "/request", label: "Request report" },
  { href: "/#parceiros", label: "Partners" },
] as const;
