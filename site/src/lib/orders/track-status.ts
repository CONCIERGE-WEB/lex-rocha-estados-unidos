import type { RelatorioStatus } from "@/lib/supabase";

const REPORT_LABELS: Record<RelatorioStatus, string> = {
  a_gerar: "Generating your report",
  revisao: "Under human review",
  aprovado: "Final review in progress",
  enviado: "Report delivered by email",
  erro: "Processing error — we're on it",
};

export function reportStatusLabel(status: string): string {
  return REPORT_LABELS[status as RelatorioStatus] ?? "In progress";
}

export function pendingOrderLabel(): string {
  return "Order received — awaiting payment";
}
