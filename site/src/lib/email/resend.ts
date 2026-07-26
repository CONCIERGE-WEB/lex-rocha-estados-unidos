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

export async function alertarFundadorNovaSolicitacao(dados: {
  nome: string;
  email: string;
  area: string;
  codigo: string;
  previsao: Date;
}): Promise<boolean> {
  if (!resendConfigurado()) return false;
  const admins = emailsAdminPermitidos(process.env.ADMIN_EMAIL);
  if (admins.length === 0) return false;
  try {
    await enviarEmail({
      para: admins.join(","),
      assunto: `[${EMPRESA.marca}] New /request — ${dados.codigo}`,
      html: `
        <p>New research request received.</p>
        <ul>
          <li><strong>Name:</strong> ${escapeHtml(dados.nome)}</li>
          <li><strong>Email:</strong> ${escapeHtml(dados.email)}</li>
          <li><strong>Area:</strong> ${escapeHtml(dados.area)}</li>
          <li><strong>Code:</strong> ${escapeHtml(dados.codigo)}</li>
          <li><strong>Queue estimate:</strong> ${escapeHtml(dados.previsao.toISOString())}</li>
        </ul>
      `,
      texto: `New request ${dados.codigo} — ${dados.nome} / ${dados.area}`,
    });
    return true;
  } catch {
    return false;
  }
}

export async function emailClienteSolicitacaoRecebida(dados: {
  email: string;
  nome: string;
  codigo: string;
  previsao: Date;
}): Promise<boolean> {
  if (!resendConfigurado()) return false;
  try {
    const base = EMPRESA.url.replace(/\/$/, "");
    await enviarEmail({
      para: dados.email,
      assunto: `${EMPRESA.marca} — request received`,
      html: `
        <p>Hi ${escapeHtml(dados.nome.split(" ")[0] || "there")},</p>
        <p>We received your documentary research request.</p>
        <p><strong>Tracking code:</strong> ${escapeHtml(dados.codigo)}</p>
        <p><strong>Queue estimate:</strong> ${escapeHtml(dados.previsao.toLocaleString("en-US"))}</p>
        <p><a href="${base}/track">Track your request</a></p>
      `,
      texto: `Request received. Code: ${dados.codigo}. Track: ${base}/track`,
    });
    return true;
  } catch {
    return false;
  }
}

export async function alertarFundadorPagamentoConfirmado(dados: {
  referencia: string;
  valor: number;
  codigo?: string;
  clienteEmail?: string | null;
}): Promise<boolean> {
  if (!resendConfigurado()) return false;
  const admins = emailsAdminPermitidos(process.env.ADMIN_EMAIL);
  if (admins.length === 0) return false;
  try {
    await enviarEmail({
      para: admins.join(","),
      assunto: `[${EMPRESA.marca}] Payment confirmed — ${dados.referencia}`,
      html: `
        <p>Payment confirmed.</p>
        <ul>
          <li><strong>Reference:</strong> ${escapeHtml(dados.referencia)}</li>
          <li><strong>Amount:</strong> $${dados.valor.toFixed(2)}</li>
          ${dados.codigo ? `<li><strong>Code:</strong> ${escapeHtml(dados.codigo)}</li>` : ""}
          ${dados.clienteEmail ? `<li><strong>Client email:</strong> ${escapeHtml(dados.clienteEmail)}</li>` : ""}
        </ul>
      `,
      texto: `Payment ${dados.referencia} — $${dados.valor.toFixed(2)}`,
    });
    return true;
  } catch {
    return false;
  }
}

export async function emailClientePedidoNaFila(dados: {
  email: string;
  nome: string;
  codigo?: string;
  referencia?: string;
  previsao?: Date;
}): Promise<boolean> {
  if (!resendConfigurado()) return false;
  try {
    const base = EMPRESA.url.replace(/\/$/, "");
    const previsaoTxt = dados.previsao
      ? dados.previsao.toLocaleString("en-US")
      : null;
    await enviarEmail({
      para: dados.email,
      assunto: `${EMPRESA.marca} — payment received, report in queue`,
      html: `
        <p>Hi ${escapeHtml(dados.nome.split(" ")[0] || "there")},</p>
        <p>We confirmed your payment. Your report is now in the human-review queue.</p>
        ${dados.codigo ? `<p><strong>Tracking code:</strong> ${escapeHtml(dados.codigo)}</p>` : ""}
        ${dados.referencia ? `<p><strong>Reference:</strong> ${escapeHtml(dados.referencia)}</p>` : ""}
        ${previsaoTxt ? `<p><strong>Estimated delivery:</strong> ${escapeHtml(previsaoTxt)}</p>` : ""}
        <p><a href="${base}/track">Track your order</a></p>
      `,
      texto: `Payment received. Track: ${base}/track`,
    });
    return true;
  } catch {
    return false;
  }
}

/** Delivery email when admin marks a report ready. */
export async function emailRelatorioPronto(dados: {
  email: string;
  nome?: string | null;
  codigo?: string | null;
  referencia?: string | null;
  categoriaOuArea?: string | null;
  plano?: string | null;
  conteudo?: string | null;
}): Promise<boolean> {
  if (!resendConfigurado()) return false;
  try {
    const base = EMPRESA.url.replace(/\/$/, "");
    const nome = dados.nome?.trim() || "there";
    const primeiro = nome.split(/\s+/)[0] || "there";
    if (dados.conteudo?.trim()) {
      await enviarRelatorioCliente({
        email: dados.email,
        nome,
        plano: dados.plano?.trim() || "report",
        conteudo: dados.conteudo,
      });
      return true;
    }
    await enviarEmail({
      para: dados.email,
      assunto: `${EMPRESA.marca} — your report is ready`,
      html: `
        <p>Hi ${escapeHtml(primeiro)},</p>
        <p>Your documentary research report is ready.</p>
        ${dados.referencia ? `<p><strong>Reference:</strong> ${escapeHtml(dados.referencia)}</p>` : ""}
        ${dados.codigo ? `<p><strong>Tracking code:</strong> ${escapeHtml(dados.codigo)}</p>` : ""}
        <p><a href="${base}/track">Open tracking</a></p>
        <p style="font-size:14px;color:#555">Informational research only — not legal advice.</p>
      `,
      texto: `Your report is ready. Track: ${base}/track`,
    });
    return true;
  } catch {
    return false;
  }
}
