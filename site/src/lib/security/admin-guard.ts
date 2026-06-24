import { emailsAdminPermitidos } from "@/lib/security/config";
import { utilizadorAdminDeRequest } from "@/lib/supabase/server";

export async function adminAutenticado(request: Request): Promise<boolean> {
  const user = await utilizadorAdminDeRequest(request);
  if (!user?.email) return false;

  const permitidos = emailsAdminPermitidos(process.env.ADMIN_EMAIL);
  return permitidos.includes(user.email.toLowerCase());
}
