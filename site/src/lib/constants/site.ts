export const SITE = {
  name: "Judicial Intelligence",
  legalName: "Judicial Intelligence",
  serviceName: "Documentary Legal Research",
  founderRole: "Legal Research Specialist",
  domain: "judicialintelligence.com",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://www.judicialintelligence.com",
  ein: "61-699-939/0001-80",
  founder: "Tiago Aureliano da Rocha",
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
] as const;

export const NAV_LINKS = [
  { href: "/#como-funciona", label: "How it works" },
  { href: "/modelo-relatorio", label: "Sample report" },
  { href: "/#fontes", label: "Public sources" },
  { href: "/#precos", label: "Pricing" },
  { href: "/#parceiros", label: "Partners" },
] as const;
