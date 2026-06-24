/** Delivery timelines, agenda messaging, and human-review copy (US enterprise pattern). */

export const PRAZOS = {
  triagemMinutos: "~2 min",
  triagemSegundos: "A few minutes",
  entregaAberta: "within 24 business hours",
  entregaFila: "up to 48 business hours",
  janelaResposta: "We typically reply to messages within a few hours on business days",
} as const;

export const AGENDA_COPY = {
  aberta: {
    badge: "Accepting new requests",
    headline: "Current availability: open",
    corpo:
      "Most paid reports are delivered within 24 business hours after payment — following human review.",
    prazoEntrega: "Typical delivery: within 24 business hours (Mon–Fri)",
  },
  fechada: {
    badge: "High volume — extended timeline",
    headline: "Current availability: limited capacity",
    corpo:
      "We're processing a full queue. New reports may take up to 48 business hours after payment — still human-reviewed before email delivery.",
    prazoEntrega: "Typical delivery: up to 48 business hours (Mon–Fri)",
  },
  whatsapp:
    "Questions on WhatsApp? We reply on mobile as soon as we can — even when the report queue is busy.",
} as const;

export const REVISAO_HUMANA = {
  titulo: "Human-reviewed before delivery",
  lead:
    "Research tools help gather public records — but a human specialist reads, checks, and assembles your report before it leaves our desk.",
  bullets: [
    "No report is emailed automatically without human review",
    "We verify that citations match your situation",
    "You receive one polished PDF-style document by email",
  ],
  notaIA:
    "AI assists the research draft only. It does not replace human judgment or legal advice.",
} as const;
