/**
 * A bounded fetch: geocoding and routing hit shared public services with
 * no uptime guarantee, so every call here must resolve — never hang —
 * within a fixed time, whether that's a slow network, a blocked host, or
 * the service itself being down. Callers treat a null return exactly
 * like any other failure and fall back to a sensible default.
 */
export async function fetchWithTimeout(
  url: string,
  timeoutMs = 6000
): Promise<Response | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
