/** Estado de disponibilidade do operador (agenda aberta/fechada). */

export type AgendaStatus = {
  disponivel: boolean;
  mensagem: string;
  fonte: "supabase" | "env";
  atualizadoEm?: string;
};

const MSG_ABERTA =
  "Disponível para novos pedidos — resposta por WhatsApp em horário alargado.";
const MSG_FECHADA =
  "Agenda temporariamente fechada — pode deixar mensagem; respondemos assim que possível.";

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
          return {
            disponivel: disp,
            mensagem: disp ? MSG_ABERTA : MSG_FECHADA,
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
  return {
    disponivel: envDisp,
    mensagem: envDisp ? MSG_ABERTA : MSG_FECHADA,
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
