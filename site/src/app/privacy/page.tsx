import { ContentSummary } from "@/components/content-summary";
import { LegalPage } from "@/components/legal-page";
import { EMPRESA } from "@/lib/constants/empresa";
import { PRIVACY } from "@/lib/constants/legal-privacy";

export const metadata = {
  title: `Privacy Policy — ${EMPRESA.marca}`,
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <ContentSummary>
        <ul className="list-none space-y-2 pl-0 text-sm">
          <li>· Data used for triage, payment, and report delivery</li>
          <li>· Legal basis: contract and consent where applicable</li>
          <li>· Rights: access, correction, deletion — {EMPRESA.emailPrivacidade}</li>
          <li>· Complaint to the FTC or your state Attorney General if needed</li>
        </ul>
      </ContentSummary>

      <p>
        <strong>Last updated:</strong> {PRIVACY.ultimaAtualizacao}
      </p>
      <p>
        This policy describes how {EMPRESA.marca} handles your personal information when you use
        our consumer rights research service in the United States.
      </p>

      <h2>1. Data controller</h2>
      <p>
        {PRIVACY.responsavel} — {EMPRESA.forma}
        <br />
        {EMPRESA.paisSede} · {EMPRESA.atuacao}
        <br />
        Email:{" "}
        <a href={`mailto:${PRIVACY.contactoPrivacidade}`} className="text-trust underline underline-offset-4">
          {PRIVACY.contactoPrivacidade}
        </a>
      </p>

      <h2>2. Purposes and legal bases</h2>
      <ul className="list-disc space-y-2 pl-6">
        {PRIVACY.finalidades.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <ul className="mt-4 list-disc space-y-2 pl-6">
        {PRIVACY.basesLegais.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>

      <h2>3. Categories of data</h2>
      <ul className="list-disc space-y-2 pl-6">
        {PRIVACY.categoriasDados.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>

      <h2>4. Retention period</h2>
      <p>{PRIVACY.prazoConservacao}</p>

      <h2>5. Recipients and subprocessors</h2>
      <p>
        Data may be processed by the following providers, only to the extent necessary to deliver
        the service. We do not sell your data.
      </p>
      <ul className="list-disc space-y-2 pl-6">
        {PRIVACY.destinatarios.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>

      <h2>6. Transfers</h2>
      <p>{PRIVACY.transferencias}</p>

      <h2>7. Your rights</h2>
      <ul className="list-disc space-y-2 pl-6">
        {PRIVACY.direitosTitular.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      <p>{PRIVACY.exercicioDireitos}</p>
      <p>{PRIVACY.encarregadoProtecao}</p>
      <p>
        Supervisory authority:{" "}
        <a href={EMPRESA.ftcUrl} className="text-trust underline underline-offset-4" rel="noopener noreferrer">
          {EMPRESA.autoridadeSupervisao}
        </a>
      </p>

      <h2>8. Forms, checkout, and consent</h2>
      <p>
        The{" "}
        <a href="/contact" className="text-trust underline underline-offset-4">
          contact form
        </a>{" "}
        collects name, email, and message — with an unchecked consent box before submission. Checkout
        may optionally collect your state/ZIP code. We do not collect SSN or other sensitive tax
        identifiers.
      </p>

      <h2>9. Security</h2>
      <p>
        We apply appropriate technical and organizational measures (HTTPS encryption, restricted
        access, data minimization).
      </p>

      <h2>10. Operator details</h2>
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
    </LegalPage>
  );
}
