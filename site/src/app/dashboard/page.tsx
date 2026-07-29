import ThankYouPage from "@/app/thank-you/page";
import { EMPRESA } from "@/lib/constants/empresa";

export const metadata = {
  title: `Payment confirmed — ${EMPRESA.marca}`,
};

type Props = {
  searchParams: { session_id?: string };
};

/** Post-checkout landing (`success_url`). Same confirmation as /thank-you. */
export default function DashboardPage(props: Props) {
  return ThankYouPage(props);
}
