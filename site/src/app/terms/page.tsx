import { ContentSummary } from "@/components/content-summary";
import { LegalPage } from "@/components/legal-page";
import { EMPRESA, PLANOS } from "@/lib/constants/empresa";

export const metadata = {
  title: `Terms of Service — ${EMPRESA.marca}`,
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <ContentSummary>
        <ul className="list-none space-y-2 pl-0 text-sm">
          <li>· Informational documentary research — not legal representation</li>
          <li>· Prices $29 / $39 / $59 — confirmed during triage and at checkout</li>
          <li>· Personalized service: refund rights may be limited after work begins</li>
          <li>· Receipt: Stripe receipt in USD — informational digital service</li>
        </ul>
      </ContentSummary>

      <p>
        {EMPRESA.marca} provides <strong>informational documentary legal research</strong> based on
        public U.S. sources. The service is not a law firm and does not include court representation.
      </p>

      <h2>Scope</h2>
      <p>
        The report organizes information to support your decision, including references available
        only in the document delivered after scope agreement and payment. It does not replace
        binding advice from a licensed attorney.
      </p>

      <h2>Indicative pricing</h2>
      <ul className="list-disc space-y-2 pl-6">
        {PLANOS.map((p) => (
          <li key={p.id}>
            {p.nome}: ${p.preco} — {p.descricao}
          </li>
        ))}
      </ul>
      <p>The final amount is always confirmed in writing before work begins.</p>

      <h2>Online contract</h2>
      <p>
        Before completing your order, you receive information about: provider identity, service
        characteristics, total price in USD, payment methods, and delivery timeline. The payment
        button clearly indicates an order with payment obligation.
      </p>
      <p>
        The report is <strong>personalized to your specific case</strong>. By authorizing immediate
        start after payment, you acknowledge that <strong>refund rights may be limited</strong> once
        work on your personalized report has begun, as permitted under applicable state consumer law.
      </p>
      <p>
        After payment, a confirmation email is sent with the essential contract elements.
      </p>

      <h2>Billing and receipt</h2>
      <p>
        This service is provided by {EMPRESA.titular} ({EMPRESA.forma}), based in{" "}
        {EMPRESA.paisSede}. Payment proof is the <strong>automatic Stripe receipt</strong> (in USD),
        sent to the email provided at checkout.
      </p>
      <p>
        You may optionally provide your state/ZIP code at checkout — not required for individuals.
        We do not collect SSN or other sensitive tax identifiers.
      </p>

      <h2>Research sources</h2>
      <p>Reports are prepared using official and public U.S. sources, including:</p>
      <ul className="list-disc space-y-2 pl-6">
        <li>
          <strong>FTC</strong> — ftc.gov — Federal consumer protection guidance
        </li>
        <li>
          <strong>CFPB</strong> — consumerfinance.gov — Financial consumer protection
        </li>
        <li>
          <strong>State Attorney General offices</strong> — consumer protection divisions
        </li>
        <li>
          <strong>Better Business Bureau</strong> — bbb.org — Business complaint patterns
        </li>
        <li>
          <strong>Public court records</strong> — state and federal decisions
        </li>
        <li>
          <strong>Federal Register</strong> — federalregulations.gov — Federal regulations
        </li>
      </ul>
      <p>
        We do not use anonymous or unverifiable sources. Each reference in the report is marked with
        source and consultation date.
      </p>

      <h2>Operator details</h2>
      <p>
        Name: {EMPRESA.titular}
        <br />
        Email:{" "}
        <a
          href={`mailto:${EMPRESA.emailContacto}`}
          className="text-trust underline underline-offset-4"
        >
          {EMPRESA.emailContacto}
        </a>
      </p>

      <h2>Provider identification</h2>
      <p>
        {EMPRESA.marca} — Documentary research from public sources.
        <br />
        Operator: {EMPRESA.titular} · {EMPRESA.forma}
        <br />
        Based in the United States. Digital services provider.
      </p>
      <p>
        The operator is not a law firm and is not registered to practice law. The activity —
        research and organization of public documentary information — does not constitute the practice
        of law.
      </p>

      <h2>Complaints and dispute resolution</h2>
      <p>
        You may file a complaint with the{" "}
        <a
          href={EMPRESA.ftcUrl}
          className="text-trust underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          Federal Trade Commission (FTC)
        </a>{" "}
        or your{" "}
        <a
          href={EMPRESA.bbbUrl}
          className="text-trust underline underline-offset-4"
          rel="noopener noreferrer"
          target="_blank"
        >
          {EMPRESA.bbbEntidade}
        </a>
        .
      </p>
      <p>
        For consumer protection matters, contact {EMPRESA.stateAttorneyGeneral}.
      </p>
      <p>
        Privacy questions:{" "}
        <a
          href={`mailto:${EMPRESA.emailPrivacidade}`}
          className="text-trust underline underline-offset-4"
        >
          {EMPRESA.emailPrivacidade}
        </a>
        .
      </p>
    </LegalPage>
  );
}
