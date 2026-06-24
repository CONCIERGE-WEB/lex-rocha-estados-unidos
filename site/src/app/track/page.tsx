import { LegalPage } from "@/components/legal-page";
import { TrackOrderForm } from "@/components/track-order-form";
import { COPY } from "@/lib/constants/copy-en";
import { EMPRESA } from "@/lib/constants/empresa";

export const metadata = {
  title: `Track order — ${EMPRESA.marca}`,
  description: COPY.track.intro,
};

export default function TrackPage() {
  const T = COPY.track;

  return (
    <LegalPage title={T.title}>
      <p className="text-lead text-ink">{T.intro}</p>
      <div className="mt-8">
        <TrackOrderForm />
      </div>
    </LegalPage>
  );
}
