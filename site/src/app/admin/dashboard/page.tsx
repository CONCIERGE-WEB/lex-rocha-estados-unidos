import { redirect } from "next/navigation";

/** Alias — dashboard de revisão de relatórios */
export default function AdminDashboardPage() {
  redirect("/admin/relatorios");
}
