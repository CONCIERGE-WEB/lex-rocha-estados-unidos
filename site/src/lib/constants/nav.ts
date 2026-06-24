import { COPY } from "./copy-en";

/** Main navigation — mirrors LexRocha menu structure (US English). */
export const NAV_LINKS = [
  { href: "/#como-funciona", label: COPY.nav.como },
  { href: "/report-sample", label: COPY.nav.sampleReport },
  { href: "/#sources", label: COPY.nav.sources },
  { href: "/#planos", label: COPY.nav.planos },
  { href: "/#partners", label: COPY.nav.partners },
] as const;
