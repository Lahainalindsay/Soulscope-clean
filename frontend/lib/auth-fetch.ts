// Bound auth requests only; recordings and database requests keep their existing behavior.
export function createAuthFetch(fetcher: typeof fetch = fetch, timeoutMs = 20_000): typeof fetch {
  return async (input, init) => {
    const url = input instanceof Request ? input.url : String(input);
    if (!new URL(url).pathname.startsWith("/auth/v1/")) return fetcher(input, init);
    const controller = new AbortController();
    const signal = init?.signal ?? (input instanceof Request ? input.signal : null);
    const cancel = () => controller.abort(signal?.reason);
    if (signal?.aborted) cancel();
    else signal?.addEventListener("abort", cancel, { once: true });
    const timer = setTimeout(() => controller.abort(new DOMException("Authentication request timed out", "TimeoutError")), timeoutMs);
    try {
      return await fetcher(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
    }
  };
}
