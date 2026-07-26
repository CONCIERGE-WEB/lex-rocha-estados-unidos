/**
 * Canonical attribution for open legal data and tools used by Judicial Intelligence.
 * Keep product surfaces (footer, /credits, report templates) in sync with this module.
 */

export const CREDITS_UPDATED = "July 25, 2026";

export const ATRIBUICAO_COURTLISTENER =
  "Case law data sourced via CourtListener / Free Law Project.";

export const ATRIBUICAO_COURTLISTENER_DETALHE =
  "Opinion metadata and search results used in research reports are drawn from " +
  "CourtListener (Free Law Project), a non-profit open-law infrastructure. " +
  "Where a CourtListener record URL is available, it is linked for independent verification.";

export const DISCLAIMER_NAO_ENDORSO =
  "Citation of CourtListener, Free Law Project, RECAP, U.S. government websites, " +
  "or other public sources does not imply endorsement, partnership, or sponsorship " +
  "by those organizations of Judicial Intelligence or of any report we produce.";

export type CreditEntry = {
  name: string;
  role: string;
  url: string;
};

export const CREDITS_LEGAL_DATA: CreditEntry[] = [
  {
    name: "CourtListener / Free Law Project",
    role: "Case law search, opinions, and court docket metadata.",
    url: "https://www.courtlistener.com/",
  },
  {
    name: "RECAP Archive (Free Law Project)",
    role: "Public federal PACER filings contributed through the RECAP project.",
    url: "https://www.courtlistener.com/recap/",
  },
];

export const CREDITS_GOVERNMENT: CreditEntry[] = [
  {
    name: "Federal Trade Commission (FTC)",
    role: "Consumer protection guidance and enforcement references.",
    url: "https://www.ftc.gov/",
  },
  {
    name: "Consumer Financial Protection Bureau (CFPB)",
    role: "Consumer finance guidance and public complaint patterns.",
    url: "https://www.consumerfinance.gov/",
  },
  {
    name: "U.S. Department of Transportation (DOT)",
    role: "Airline passenger rights and baggage-delay guidance.",
    url: "https://www.transportation.gov/",
  },
  {
    name: "eCFR — Electronic Code of Federal Regulations",
    role: "Public-domain federal regulatory text.",
    url: "https://www.ecfr.gov/",
  },
  {
    name: "Cornell LII — U.S. Code",
    role: "Federal statutes used as public legal reference material.",
    url: "https://www.law.cornell.edu/uscode",
  },
];

export const CREDITS_ENGINEERING: CreditEntry[] = [
  {
    name: "Next.js",
    role: "Web application framework for this site.",
    url: "https://nextjs.org/",
  },
];
