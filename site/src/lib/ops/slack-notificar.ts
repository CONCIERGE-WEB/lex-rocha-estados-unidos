/**
 * Slack notifications (Incoming Webhook) — local / ops tests.
 * No email/phone/SSN in the text. Do not invent volume or outcomes.
 * Does not touch SignalHub or VPS ForgeOps.
 */

export type SlackNovaSolicitacao = {
  codigo: string;
  previsao: Date;
  nome: string;
  categoria?: string | null;
  /** U.S. state code or US (federal). */
  state?: string | null;
  /** @deprecated Prefer `state` */
  uf?: string | null;
  plano?: string | null;
};

function labelPlano(plano: string | null | undefined): string {
  switch ((plano || "").toLowerCase()) {
    case "essencial":
    case "essential":
      return "Essential ($49)";
    case "padrao":
    case "standard":
      return "Standard ($79)";
    case "premium":
    case "completo":
    case "complete":
      return "Premium ($119)";
    default:
      return plano?.trim() || "not specified";
  }
}

function labelCategoria(cat: string | null | undefined): string {
  const map: Record<string, string> = {
    fcra_credit_reporting: "FCRA — credit reporting",
    fdcpa_debt_collection: "FDCPA — debt collection",
    tcpa_robocalls: "TCPA — robocalls / spam",
    lemon_law_warranty: "Lemon Law / Magnuson-Moss",
    product_warranty: "Lemon Law / Magnuson-Moss (legacy id)",
    udap_deceptive_practices: "UDAP — unfair / deceptive",
    dot_flights_baggage: "DOT — flights / baggage",
    health_plan_denial: "Health plan denial",
    negativacao_indevida: "FCRA — credit reporting (legacy id)",
    cobranca_indevida: "FDCPA — debt collection (legacy id)",
  };
  if (!cat) return "not specified";
  return map[cat] || cat;
}

export function montarTextoSlackNovaSolicitacao(
  dados: SlackNovaSolicitacao
): string {
  const previsao = dados.previsao.toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
  const state = (dados.state || dados.uf || "—").toUpperCase();
  return [
    "*New lead — /request form*",
    "",
    `*Name:* ${dados.nome.trim() || "—"}`,
    `*Category:* ${labelCategoria(dados.categoria)}`,
    `*State:* ${state}`,
    `*Plan:* ${labelPlano(dados.plano)}`,
    `*Code:* \`${dados.codigo}\``,
    `*Queue estimate:* ${previsao}`,
    "",
    "_No email/phone on this channel — open the authenticated panel._",
  ].join("\n");
}

/**
 * Fires Incoming Webhook if `SLACK_WEBHOOK_NOVOS_CASOS` is set.
 * Silent failure (does not break submit).
 */
export async function notificarSlackNovaSolicitacao(
  dados: SlackNovaSolicitacao
): Promise<boolean> {
  const url = process.env.SLACK_WEBHOOK_NOVOS_CASOS?.trim();
  if (!url) return false;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: montarTextoSlackNovaSolicitacao(dados) }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      console.error(
        "[slack] webhook novos-casos failed",
        res.status,
        await res.text().catch(() => "")
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("[slack] webhook novos-casos error", err);
    return false;
  }
}

/** Optional error webhook for ops tests. */
export async function notificarSlackErro(
  mensagem: string
): Promise<boolean> {
  const url = process.env.SLACK_WEBHOOK_ERROS?.trim();
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `*Error (local)*\n${mensagem}` }),
      signal: AbortSignal.timeout(8_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export type SlackCorpusIngestao = {
  categoria: string;
  state: string;
  total: number;
  status: string;
  fonte?: string;
};

/**
 * Alert when a CourtListener corpus cell was written (Python / Node sync).
 * Uses SLACK_WEBHOOK_CORPUS or falls back to SLACK_WEBHOOK_NOVOS_CASOS.
 * No case names / PII — counts and cell ids only.
 */
export async function notificarSlackCorpusIngestao(
  dados: SlackCorpusIngestao
): Promise<boolean> {
  const url =
    process.env.SLACK_WEBHOOK_CORPUS?.trim() ||
    process.env.SLACK_WEBHOOK_NOVOS_CASOS?.trim();
  if (!url) return false;

  const text = [
    "*Corpus ingest — CourtListener*",
    "",
    `*Category:* \`${dados.categoria}\``,
    `*State:* \`${dados.state.toUpperCase()}\``,
    `*Items saved:* ${dados.total}`,
    `*Status:* ${dados.status}`,
    `*Source:* ${dados.fonte || "courtlistener-ingestor"}`,
    "",
    "_Deterministic JSON write — no LLM in the ingest path._",
  ].join("\n");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(8_000),
    });
    return res.ok;
  } catch (err) {
    console.error("[slack] corpus ingest error", err);
    return false;
  }
}
