import { SITE } from "@/lib/constants/site";

export const VERSAO_POLITICA_PRIVACIDADE = "v1.1-2026-07-04";
export const DATA_PUBLICACAO_POLITICA = "July 4, 2026";

export const DPO = {
  nome: SITE.founder,
  email: SITE.email,
  prazoRespostaDias: 45,
} as const;

export const CONSENT_COOKIE_NAME = "ji_us_consent";
export const SESSION_COOKIE_NAME = "ji_us_sid";

export const TEXTO_JURISDICAO =
  "This service provides documentary research based on public U.S. sources and applicable consumer law. We are not responsible for foreign-law matters.";
