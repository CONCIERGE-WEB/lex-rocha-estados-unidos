"use client";

import { useEffect, useState } from "react";

import { AGENDA_COPY } from "@/lib/constants/prazos-entrega";
import type { AgendaStatus } from "@/lib/agenda";

export function AgendaStatusStrip() {
  const [status, setStatus] = useState<AgendaStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/agenda");
        if (!res.ok) return;
        const data = (await res.json()) as AgendaStatus;
        if (!cancelled) setStatus(data);
      } catch {
        /* fallback: hide strip */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div
        className="animate-pulse rounded-xl border-2 border-muted/20 bg-paper p-4"
        aria-hidden="true"
      >
        <div className="h-4 w-40 rounded bg-muted/15" />
        <div className="mt-2 h-3 w-full rounded bg-muted/10" />
      </div>
    );
  }

  if (!status) return null;

  const copy = status.disponivel ? AGENDA_COPY.aberta : AGENDA_COPY.fechada;

  return (
    <div
      role="status"
      className={`rounded-xl border-2 p-4 md:p-5 ${
        status.disponivel
          ? "border-verify/40 bg-verify/10"
          : "border-amber-600/40 bg-amber-50"
      }`}
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
      <p className="mt-2 text-sm font-medium leading-relaxed text-ink">{copy.corpo}</p>
      <p className="mt-2 text-xs font-bold text-muted">{copy.prazoEntrega}</p>
      <p className="mt-3 text-xs font-medium text-muted">{AGENDA_COPY.whatsapp}</p>
    </div>
  );
}
