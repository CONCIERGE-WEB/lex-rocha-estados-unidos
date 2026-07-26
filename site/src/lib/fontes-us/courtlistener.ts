/**
 * CourtListener REST v4 client (Free Law Project).
 * Auth: Authorization: Token <COURTLISTENER_API_TOKEN>
 * Docs: https://www.courtlistener.com/help/api/rest/
 *
 * Never invents opinions — only maps API payloads. Without a token, search returns null.
 */

export const COURTLISTENER_API_BASE =
  "https://www.courtlistener.com/api/rest/v4";

export type CourtListenerSearchHit = {
  cluster_id: number | null;
  case_name: string;
  absolute_url: string;
  date_filed: string | null;
  court_id: string | null;
  snippet: string | null;
  citation: string | null;
};

export type CourtListenerSearchResult = {
  count: number;
  results: CourtListenerSearchHit[];
  rawQuery: string;
};

function tokenFromEnv(env: NodeJS.ProcessEnv = process.env): string | null {
  const t =
    env.COURTLISTENER_API_TOKEN?.trim() ||
    env.COURTLISTENER_TOKEN?.trim() ||
    "";
  return t.length > 0 ? t : null;
}

/** Map one API search result object → curated hit (fields only when present). */
export function mapCourtListenerSearchResult(
  row: Record<string, unknown>
): CourtListenerSearchHit | null {
  const caseName =
    (typeof row.caseName === "string" && row.caseName) ||
    (typeof row.case_name === "string" && row.case_name) ||
    "";
  const path =
    (typeof row.absolute_url === "string" && row.absolute_url) ||
    (typeof row.absoluteUrl === "string" && row.absoluteUrl) ||
    "";
  if (!caseName.trim() || !path.trim()) return null;

  const absolute_url = path.startsWith("http")
    ? path
    : `https://www.courtlistener.com${path.startsWith("/") ? "" : "/"}${path}`;

  const clusterRaw = row.cluster_id ?? row.id ?? null;
  const cluster_id =
    typeof clusterRaw === "number"
      ? clusterRaw
      : typeof clusterRaw === "string" && /^\d+$/.test(clusterRaw)
        ? Number(clusterRaw)
        : null;

  return {
    cluster_id,
    case_name: caseName.trim(),
    absolute_url,
    date_filed:
      typeof row.dateFiled === "string"
        ? row.dateFiled
        : typeof row.date_filed === "string"
          ? row.date_filed
          : null,
    court_id:
      typeof row.court_id === "string"
        ? row.court_id
        : typeof row.court === "string"
          ? row.court
          : null,
    snippet:
      typeof row.snippet === "string"
        ? row.snippet.replace(/<\/?[^>]+>/g, "").trim() || null
        : null,
    citation:
      typeof row.citation === "string"
        ? row.citation
        : Array.isArray(row.citation)
          ? String(row.citation[0] ?? "") || null
          : null,
  };
}

export type BuscarOpinioesParams = {
  q: string;
  /** Opinion search — CourtListener `type=o`. */
  type?: "o";
  pageSize?: number;
  /** Optional court id filter (e.g. scotus, ca9). */
  court?: string;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
  env?: NodeJS.ProcessEnv;
};

/**
 * Search case-law opinions. Returns `null` when token is missing (local-safe).
 * Throws on HTTP errors when a token is configured.
 */
export async function buscarOpinioesCourtListener(
  params: BuscarOpinioesParams
): Promise<CourtListenerSearchResult | null> {
  const env = params.env ?? process.env;
  const token = tokenFromEnv(env);
  if (!token) return null;

  const pageSize = Math.min(Math.max(params.pageSize ?? 10, 1), 20);
  const url = new URL(`${COURTLISTENER_API_BASE}/search/`);
  url.searchParams.set("q", params.q);
  url.searchParams.set("type", params.type ?? "o");
  url.searchParams.set("page_size", String(pageSize));
  if (params.court?.trim()) {
    url.searchParams.set("court", params.court.trim());
  }

  const fetchImpl = params.fetchImpl ?? fetch;
  const res = await fetchImpl(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      Accept: "application/json",
    },
    signal: params.signal ?? AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `CourtListener search failed HTTP ${res.status}: ${body.slice(0, 200)}`
    );
  }

  const json = (await res.json()) as {
    count?: number;
    results?: Record<string, unknown>[];
  };

  const results = (json.results ?? [])
    .map((r) => mapCourtListenerSearchResult(r))
    .filter((x): x is CourtListenerSearchHit => x !== null);

  return {
    count: typeof json.count === "number" ? json.count : results.length,
    results,
    rawQuery: params.q,
  };
}

export function courtListenerConfigurado(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  return tokenFromEnv(env) !== null;
}
