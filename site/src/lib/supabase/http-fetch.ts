/** Fetch com timeout e retentativas leves (rede instável / Supabase lento). */
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit & { timeoutMs?: number; retries?: number }
): Promise<Response> {
  const timeoutMs = init?.timeoutMs ?? 20_000;
  const retries = init?.retries ?? 2;
  const rest = { ...init };
  delete rest.timeoutMs;
  delete rest.retries;

  let lastError: unknown;
  for (let tentativa = 0; tentativa <= retries; tentativa++) {
    try {
      return await fetch(input, {
        ...rest,
        signal: rest.signal ?? AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof Error &&
        (error.name === "TimeoutError" || error.name === "AbortError");
      if (!retryable || tentativa === retries) break;
      await new Promise((r) => setTimeout(r, 400 * (tentativa + 1)));
    }
  }
  throw lastError;
}
