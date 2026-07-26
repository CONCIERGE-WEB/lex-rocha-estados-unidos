import { COPY } from "./copy-en";

/** Main navigation — U.S. English anchors (parity with BR information architecture). */
export const NAV_LINKS = [
  { href: "/#how-it-works", label: COPY.nav.como },
  { href: "/#categories", label: COPY.nav.categories },
  { href: "/report-sample", label: COPY.nav.sampleReport },
  { href: "/#sources", label: COPY.nav.sources },
  { href: "/#pricing", label: COPY.nav.planos },
  { href: "/#partners", label: COPY.nav.partners },
] as const;
