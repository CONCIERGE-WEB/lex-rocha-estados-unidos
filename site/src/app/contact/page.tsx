import { ContactForm } from "@/components/contact-form";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { LegalPage } from "@/components/legal-page";
import { COPY } from "@/lib/constants/copy-en";
import { EMPRESA } from "@/lib/constants/empresa";

export const metadata = {
  title: `Contact — ${EMPRESA.marca}`,
};

export default function ContactPage() {
  const C = COPY.contacto;

  return (
    <LegalPage title={C.title}>
      <p className="text-lead text-ink">{C.lead}</p>
      <div className="mt-6 rounded-md border border-trust/30 bg-folio p-5">
        <p className="text-body font-medium text-ink">{C.whatsappHint}</p>
        <WhatsAppCta className="btn-primary mt-4 bg-green-700 hover:bg-green-800">
          {C.whatsapp}
        </WhatsAppCta>
      </div>
      <p className="mt-6 text-body text-ink">
        Email:{" "}
        <a
          href={`mailto:${EMPRESA.emailContacto}`}
          className="font-medium text-trust underline underline-offset-4"
        >
          {EMPRESA.emailContacto}
        </a>
      </p>
      <ContactForm />
    </LegalPage>
  );
}
