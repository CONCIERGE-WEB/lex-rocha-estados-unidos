import { headers } from "next/headers";

import { emailAdminDaRequest } from "@/lib/security/admin-guard";

/** E-mail do admin autenticado no contexto de Server Components / pages. */
export async function emailAdminAtual(): Promise<string | null> {
  const cookie = headers().get("cookie") ?? "";
  return emailAdminDaRequest(
    new Request("https://lexrocha.com.br/admin", { headers: { cookie } })
  );
}
