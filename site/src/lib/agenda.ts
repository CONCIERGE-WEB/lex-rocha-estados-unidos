/** Operator availability (open queue vs high volume). */

import { AGENDA_COPY } from "@/lib/constants/prazos-entrega";

export type AgendaStatus = {
  disponivel: boolean;
  mensagem: string;
  prazoEntrega: string;
  fonte: "supabase" | "env";
  atualizadoEm?: string;
};

export async function obterAgendaStatus(): Promise<AgendaStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    try {
      const res = await fetch(`${url}/rest/v1/operador_config?id=eq.1&select=*`, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        next: { revalidate: 30 },
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows?.[0]) {
          const disp = Boolean(rows[0].agenda_disponivel);
          const copy = disp ? AGENDA_COPY.aberta : AGENDA_COPY.fechada;
          return {
            disponivel: disp,
            mensagem: copy.corpo,
            prazoEntrega: copy.prazoEntrega,
            fonte: "supabase",
            atualizadoEm: rows[0].updated_at,
          };
        }
      }
    } catch (e) {
      console.error("[agenda] supabase:", e);
    }
  }

  const envDisp = process.env.AGENDA_DISPONIVEL !== "false";
  const copy = envDisp ? AGENDA_COPY.aberta : AGENDA_COPY.fechada;
  return {
    disponivel: envDisp,
    mensagem: copy.corpo,
    prazoEntrega: copy.prazoEntrega,
    fonte: "env",
  };
}

export async function definirAgendaDisponivel(disponivel: boolean): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;

  const res = await fetch(`${url}/rest/v1/operador_config?id=eq.1`, {
    method: "PATCH",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      agenda_disponivel: disponivel,
      updated_at: new Date().toISOString(),
    }),
  });
  return res.ok;
}
