/**
 * Fixed-window rate limiter on Upstash Redis (the same store the visit counter
 * already uses), driven over its REST API with a plain `fetch` — no extra
 * dependency, works from every Vercel runtime.
 *
 * Fails OPEN: when Redis is unconfigured or unreachable the call is allowed.
 * A limiter must never be the thing that locks the owner out of their own site
 * over a transient store hiccup; its job is to blunt abuse, not to gate access.
 */

const URL_ENV = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN_ENV = process.env.UPSTASH_REDIS_REST_TOKEN;

export type RateLimitResult = {
  /** false once the window's request count has exceeded `limit`. */
  allowed: boolean;
  /** Requests still permitted in the current window (0 when blocked). */
  remaining: number;
};

const ALLOW = (limit: number): RateLimitResult => ({ allowed: true, remaining: limit });

/**
 * Count one hit against `key` and report whether it is still within `limit`
 * for the rolling `windowSeconds`. INCR + EXPIRE in a single pipeline; the
 * expiry refreshes on every hit, which keeps an actively-abused key blocked
 * until it goes quiet for a full window.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  if (!URL_ENV || !TOKEN_ENV) return ALLOW(limit);
  try {
    const response = await fetch(`${URL_ENV}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN_ENV}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(windowSeconds)],
      ]),
      cache: "no-store",
    });
    if (!response.ok) return ALLOW(limit);
    const payload = (await response.json()) as { result?: unknown; error?: string }[];
    const first = payload[0];
    if (!first || first.error) return ALLOW(limit);
    const count = typeof first.result === "number" ? first.result : Number(first.result) || 0;
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  } catch {
    return ALLOW(limit);
  }
}

/**
 * Best-effort client IP from the platform's forwarding headers. Never trust it
 * for authorization — it is only a bucketing key for rate limiting, where the
 * worst case of a spoofed value is an attacker rate-limiting themselves.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? "unknown";
}

/**
 * Check a per-IP window and a global window together (one call, first block
 * wins). The global cap stops a distributed set of IPs from getting around the
 * per-IP limit on a resource that costs money or sends mail.
 */
export async function rateLimitGuard(opts: {
  scope: string;
  ip: string;
  perIp: { limit: number; windowSeconds: number };
  global: { limit: number; windowSeconds: number };
}): Promise<RateLimitResult> {
  const perIp = await rateLimit(`rl:${opts.scope}:ip:${opts.ip}`, opts.perIp.limit, opts.perIp.windowSeconds);
  if (!perIp.allowed) return perIp;
  return rateLimit(`rl:${opts.scope}:global`, opts.global.limit, opts.global.windowSeconds);
}
