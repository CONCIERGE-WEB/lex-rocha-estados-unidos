import { EMPRESA } from "@/lib/constants/empresa";

/**
 * Static footer appended to every generated report.
 *
 * Kept out of the LLM output on purpose: the official links must always be
 * real and verifiable (never AI-generated), and the U.S.-law disclaimers must
 * appear on every report regardless of what the model writes. This keeps the
 * deliverable on the "legal information" side of the line (neutral, public,
 * not tailored advice) rather than the "legal advice" side.
 */
export function rodapeRelatorio(): string {
  return [
    "",
    "---",
    "",
    "ABOUT THIS DOCUMENT",
    "",
    "This is an independent research report. In plain language, it explains what U.S. consumer-protection law says and what courts and public bodies have actually granted in publicly documented cases with facts similar to yours. The goal is for you to clearly understand where things stand.",
    "",
    `This document is reliable research — not legal advice. ${EMPRESA.marca} is not a law firm and is not your attorney. Reading this report does not create an attorney-client relationship, and your communications with us are not protected by attorney-client privilege. Laws change and differ from state to state, and every case turns on its own facts, so this general research may not reflect the most current law in your jurisdiction. The outcomes of the cases cited here do not guarantee any particular result in your situation.`,
    "",
    "We do not tell you what to do. Any decision — including whether to contact the company, file a complaint, or hire a licensed attorney in your state — is entirely yours.",
    "",
    "OFFICIAL SOURCES YOU CAN VERIFY YOURSELF",
    "- Federal Trade Commission — consumer information: https://consumer.ftc.gov",
    "- Consumer Financial Protection Bureau: https://www.consumerfinance.gov",
    "- USA.gov — consumer complaints: https://www.usa.gov/consumer-complaints",
    "- Find your State Attorney General: https://www.naag.org/find-my-ag/",
    "- U.S. federal courts: https://www.uscourts.gov",
    "",
    `Questions about this report? ${EMPRESA.emailContacto}`,
    "",
  ].join("\n");
}
