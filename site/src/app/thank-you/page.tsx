import Link from "next/link";

import { ContentSummary } from "@/components/content-summary";
import { LegalPage } from "@/components/legal-page";
import { COPY } from "@/lib/constants/copy-en";
import { EMPRESA } from "@/lib/constants/empresa";
import { getStripe } from "@/lib/stripe";

export const metadata = {
  title: `Thank you — ${EMPRESA.marca}`,
};

type Props = {
  searchParams: { session_id?: string };
};

export default async function ThankYouPage({ searchParams }: Props) {
  const O = COPY.obrigado;
  let trackingCode: string | null = null;

  const sessionId = searchParams.session_id?.trim();
  if (sessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      trackingCode = session.metadata?.tracking_code?.trim() || null;
    } catch {
      trackingCode = null;
    }
  }

  return (
    <LegalPage title={O.title}>
      <p className="text-lead text-ink">{O.lead}</p>

      {trackingCode ? (
        <ContentSummary title={O.trackingLabel}>
          <p className="font-mono text-2xl font-semibold tracking-widest text-trust">{trackingCode}</p>
          <p className="mt-2 text-sm text-muted">{O.trackingHint}</p>
          <Link
            href={`/track/${encodeURIComponent(trackingCode)}`}
            className="btn-secondary mt-4 inline-flex"
          >
            {O.trackCta}
          </Link>
        </ContentSummary>
      ) : null}

      <ContentSummary title="Next steps">
        <ol className="list-decimal space-y-2 pl-5">
          {O.passos.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </ContentSummary>

      <p className="pt-4">
        <Link href="/" className="btn-primary inline-block">
          {O.cta}
        </Link>
      </p>
    </LegalPage>
  );
}
