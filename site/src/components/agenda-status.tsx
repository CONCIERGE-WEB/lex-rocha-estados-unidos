import { obterAgendaStatus } from "@/lib/agenda";
import { AGENDA_COPY } from "@/lib/constants/prazos-entrega";

export async function AgendaStatus() {
  const status = await obterAgendaStatus();
  const copy = status.disponivel ? AGENDA_COPY.aberta : AGENDA_COPY.fechada;

  return (
    <div
      className={`rounded-xl border-2 p-4 md:p-5 ${
        status.disponivel
          ? "border-verify/40 bg-verify/10"
          : "border-amber-600/40 bg-amber-50"
      }`}
      role="status"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            status.disponivel ? "bg-verify text-onDark" : "bg-amber-700 text-onDark"
          }`}
        >
          {copy.badge}
        </span>
        <p className="text-sm font-bold text-ink">{copy.headline}</p>
      </div>
      <p className="mt-2 text-sm font-medium leading-relaxed text-ink">{status.mensagem}</p>
      <p className="mt-2 text-xs font-bold text-muted">{status.prazoEntrega}</p>
      <p className="mt-3 text-xs font-medium text-muted">{AGENDA_COPY.whatsapp}</p>
    </div>
  );
}
