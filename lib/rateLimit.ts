/**
 * In-memory sliding-window rate limiter for automation endpoints.
 *
 * Default: 60 requests per 60-second window per key.
 * Key is typically "route:ip" — callers decide how to scope it.
 * State lives in module scope (single Node.js process).
 */

const windows = new Map<string, number[]>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

export function checkRateLimit(
  key: string,
  maxRequests = MAX_REQUESTS,
  windowMs = WINDOW_MS,
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const cutoff = now - windowMs;

  const timestamps = (windows.get(key) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= maxRequests) {
    const retryAfter = Math.ceil((timestamps[0] + windowMs - now) / 1000);
    windows.set(key, timestamps);
    return { allowed: false, retryAfter: Math.max(1, retryAfter) };
  }

  timestamps.push(now);
  windows.set(key, timestamps);
  return { allowed: true, retryAfter: 0 };
}

/** Extract the best available IP from standard forwarding headers. */
export function getRequestIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
