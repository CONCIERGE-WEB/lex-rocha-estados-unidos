import { ContentSummary } from "@/components/content-summary";
import { LegalPage } from "@/components/legal-page";
import {
  CREDITS_ENGINEERING,
  CREDITS_GOVERNMENT,
  CREDITS_LEGAL_DATA,
  CREDITS_UPDATED,
  DISCLAIMER_NAO_ENDORSO,
} from "@/lib/constants/credits";
import { EMPRESA } from "@/lib/constants/empresa";

export const metadata = {
  title: `Data Sources & Credits — ${EMPRESA.marca}`,
  description:
    "Attribution for CourtListener, Free Law Project, and U.S. public legal sources used by Judicial Intelligence.",
};

function CreditList({ items }: { items: typeof CREDITS_LEGAL_DATA }) {
  return (
    <ul className="list-none space-y-4 pl-0">
      {items.map((item) => (
        <li key={item.url}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ink underline underline-offset-4 transition hover:text-action"
          >
            {item.name}
          </a>
          <p className="mt-1 text-sm text-muted">{item.role}</p>
        </li>
      ))}
    </ul>
  );
}

export default function CreditsPage() {
  return (
    <LegalPage title="Data Sources & Credits">
      <ContentSummary>
        <ul className="list-none space-y-2 pl-0 text-sm">
          <li>· Case law via CourtListener / Free Law Project</li>
          <li>· Primary U.S. statutes and agency guidance (public domain)</li>
          <li>· Attribution does not imply endorsement</li>
        </ul>
      </ContentSummary>

      <p>
        <strong>Last updated:</strong> {CREDITS_UPDATED}
      </p>
      <p>
        {EMPRESA.marca} builds consumer-rights research reports from{" "}
        <strong>public, auditable sources</strong>. We credit the organizations
        and infrastructure that make that possible — especially open legal data
        maintained for the public interest.
      </p>

      <h2>Legal data &amp; primary sources</h2>
      <CreditList items={CREDITS_LEGAL_DATA} />

      <h2>U.S. government &amp; regulatory bodies</h2>
      <p className="text-sm">
        Public-domain legal reference material. Verify current text on the
        official portal before relying on any citation.
      </p>
      <CreditList items={CREDITS_GOVERNMENT} />

      <h2>Attribution notice</h2>
      <p>{DISCLAIMER_NAO_ENDORSO}</p>
      <p>
        {EMPRESA.marca} is not a law firm and does not provide legal advice.
        Reports summarize publicly available materials for informational use;
        an attorney licensed in your jurisdiction should evaluate how any case
        or statute applies to your facts.
      </p>

      <h2>Team &amp; engineering</h2>
      <p className="text-sm">
        Built for the U.S. market by the {EMPRESA.marca} engineering team.
      </p>
      <CreditList items={CREDITS_ENGINEERING} />

      <p className="text-sm">
        Questions about sourcing:{" "}
        <a
          href={`mailto:${EMPRESA.emailContacto}`}
          className="text-trust underline underline-offset-4"
        >
          {EMPRESA.emailContacto}
        </a>
      </p>
    </LegalPage>
  );
}
