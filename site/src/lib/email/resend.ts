import { EMPRESA } from "@/lib/constants/empresa";
import { emailsAdminPermitidos } from "@/lib/security/config";

const RESEND_URL = "https://api.resend.com/emails";

export function resendConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim());
}

type EmailOpts = {
  para: string;
  assunto: string;
  html: string;
  texto?: string;
};

export async function enviarEmail(opts: EmailOpts): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("Resend not configured (RESEND_API_KEY / RESEND_FROM_EMAIL)");
  }

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: opts.para,
      subject: opts.assunto,
      html: opts.html,
      text: opts.texto,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Resend ${res.status}: ${txt.slice(0, 200)}`);
  }
}

export async function notificarAdminNovoRelatorio(opts: {
  cliente: string;
  plano: string;
  relatorioId: string;
}): Promise<void> {
  const admins = emailsAdminPermitidos(process.env.ADMIN_EMAIL);
  if (admins.length === 0 || !resendConfigurado()) return;

  const base = EMPRESA.url.replace(/\/$/, "");
  await enviarEmail({
    para: admins.join(","),
    assunto: `[${EMPRESA.marca}] Report ready for review`,
    html: `
      <p>A new report was generated after payment.</p>
      <ul>
        <li><strong>Client:</strong> ${escapeHtml(opts.cliente)}</li>
        <li><strong>Plan:</strong> ${escapeHtml(opts.plano)}</li>
      </ul>
      <p><a href="${base}/admin/relatorios/${opts.relatorioId}">Open in admin panel</a></p>
    `,
    texto: `Report ready: ${base}/admin/relatorios/${opts.relatorioId}`,
  });
}

export async function enviarRelatorioCliente(opts: {
  email: string;
  nome: string;
  plano: string;
  conteudo: string;
}): Promise<void> {
  const corpoHtml = textoParaHtml(opts.conteudo);
  await enviarEmail({
    para: opts.email,
    assunto: `Your research report — ${EMPRESA.marca}`,
    html: `
      <p>Hi ${escapeHtml(opts.nome || "there")},</p>
      <p>Attached below is your documentary research report for the <strong>${escapeHtml(opts.plano)}</strong> plan.</p>
      <hr />
      <div style="font-family: Georgia, serif; line-height: 1.6; color: #1a1a1a;">
        ${corpoHtml}
      </div>
      <hr />
      <p style="font-size: 14px; color: #555;">
        This document is for informational purposes only and does not constitute legal advice.
        ${EMPRESA.marca} — independent documentary research.
      </p>
      <p style="font-size: 14px; color: #555;">
        Questions? <a href="mailto:${EMPRESA.emailContacto}">${EMPRESA.emailContacto}</a>
      </p>
    `,
    texto: opts.conteudo,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textoParaHtml(texto: string): string {
  return escapeHtml(texto).replace(/\n/g, "<br />");
}
