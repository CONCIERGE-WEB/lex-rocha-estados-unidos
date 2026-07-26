/** U.S. public sources referenced in documentary research reports. */

export type PublicSource = {
  name: string;
  description: string;
  url: string;
  type: "case_law" | "regulation" | "consumer" | "open_data";
};

export const PUBLIC_SOURCES: PublicSource[] = [
  {
    name: "FTC — Consumer Protection",
    description: "Federal Trade Commission guidance, enforcement actions, and consumer alerts.",
    url: "https://www.ftc.gov/",
    type: "consumer",
  },
  {
    name: "CFPB — Consumer Financial Protection Bureau",
    description: "Complaints, regulations, and educational materials on financial products.",
    url: "https://www.consumerfinance.gov/",
    type: "consumer",
  },
  {
    name: "Better Business Bureau (BBB)",
    description: "Business profiles, complaint patterns, and dispute resolution context.",
    url: "https://www.bbb.org/",
    type: "consumer",
  },
  {
    name: "CourtListener (Free Law Project)",
    description:
      "Searchable U.S. court opinions and RECAP dockets via public API — primary corpus source for Etapa 2.",
    url: "https://www.courtlistener.com/",
    type: "case_law",
  },
  {
    name: "PACER — Federal Court Records",
    description: "Public access to U.S. federal court dockets and filings (fee-based portal).",
    url: "https://pacer.uscourts.gov/",
    type: "case_law",
  },
  {
    name: "Google Scholar — Case Law",
    description: "Indexed state and federal court opinions for precedent research.",
    url: "https://scholar.google.com/",
    type: "case_law",
  },
  {
    name: "U.S. Code & eCFR",
    description: "Federal statutes and regulations (including consumer protection rules).",
    url: "https://www.ecfr.gov/",
    type: "regulation",
  },
  {
    name: "State Attorney General Offices",
    description: "State-level consumer protection divisions and published enforcement.",
    url: "https://www.naag.org/",
    type: "consumer",
  },
  {
    name: "USA.gov — Consumer Topics",
    description: "Official U.S. government portal for consumer rights resources.",
    url: "https://www.usa.gov/consumer",
    type: "open_data",
  },
];

export const PUBLIC_SOURCES_NOTE =
  "Sources below are consulted from public portals at the time of research. " +
  "Citations should be verified before any formal complaint or legal filing. " +
  "Inclusion of a precedent does not guarantee the same outcome in your case.";

export const SOURCE_TYPE_LABEL: Record<PublicSource["type"], string> = {
  case_law: "Case law",
  regulation: "Regulation",
  consumer: "Consumer",
  open_data: "Open data",
};
