import { LegalPage } from "@/components/legal-page";
import { TrackOrderForm } from "@/components/track-order-form";
import { COPY } from "@/lib/constants/copy-en";
import { EMPRESA } from "@/lib/constants/empresa";

type Props = {
  params: { code: string };
};

export function generateMetadata({ params }: Props) {
  return {
    title: `Order ${params.code.toUpperCase()} — ${EMPRESA.marca}`,
  };
}

export default function TrackCodePage({ params }: Props) {
  const T = COPY.track;
  const code = decodeURIComponent(params.code).toUpperCase();

  return (
    <LegalPage title={T.title}>
      <p className="text-lead text-ink">{T.intro}</p>
      <div className="mt-8">
        <TrackOrderForm initialCode={code} />
      </div>
    </LegalPage>
  );
}
