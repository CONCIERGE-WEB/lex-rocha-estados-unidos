import { LoginPageClient } from "@/components/auth/login-page-client";
import { EMPRESA } from "@/lib/constants/empresa";
import {
  emailsAdminPermitidos,
  googleOAuthConfigurado,
} from "@/lib/security/config";

export const metadata = {
  title: `Sign in — ${EMPRESA.marca}`,
  description:
    "Access your area: track a consumer order or continue as an attorney / firm.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ erro?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  return (
    <LoginPageClient
      erroKey={sp.erro}
      googleOk={googleOAuthConfigurado()}
      emailsAdmin={emailsAdminPermitidos(process.env.ADMIN_EMAIL)}
    />
  );
}
