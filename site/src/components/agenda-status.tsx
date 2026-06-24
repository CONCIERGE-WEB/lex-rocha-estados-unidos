import { obterAgendaStatus } from "@/lib/agenda";

export async function AgendaStatus() {
  const status = await obterAgendaStatus();

  return (
    <div
      className={`rounded-xl border-2 p-4 ${
        status.disponivel
          ? "border-green-600 bg-green-50"
          : "border-amber-600 bg-amber-50"
      }`}
      role="status"
    >
      <p className="text-base font-bold text-ink">
        {status.disponivel ? "🟢 Agenda aberta" : "🟡 Agenda temporariamente fechada"}
      </p>
      <p className="mt-1 text-base text-slate-800">{status.mensagem}</p>
      <p className="mt-2 text-sm text-slate-600">
        Pode contactar por WhatsApp a qualquer hora — respondemos no telemóvel assim que
        possível.
      </p>
    </div>
  );
}
