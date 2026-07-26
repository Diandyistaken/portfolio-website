/**
 * Visit counter storage, on Upstash Redis over its REST API.
 *
 * Plain `fetch` instead of an SDK: one less dependency, and the REST endpoint
 * is the only thing that works reliably from every Vercel runtime.
 *
 * Serverless is the whole reason this needs a store at all — an in-memory
 * counter would reset on every cold start and count differently on each
 * instance, so it would simply report wrong numbers.
 *
 * If the credentials are absent the module reports "not configured" and the UI
 * renders nothing. A portfolio must never show an invented visitor number.
 */

const URL_ENV = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN_ENV = process.env.UPSTASH_REDIS_REST_TOKEN;

export function isVisitStoreConfigured() {
  return Boolean(URL_ENV && TOKEN_ENV);
}

export type VisitStats = {
  /** Distinct visitors counted for the current UTC day. */
  today: number;
  /** Every visit ever recorded (a return visit counts again). */
  total: number;
};

/** UTC so the daily bucket does not shift with the viewer's timezone. */
export function dayKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

async function pipeline(commands: string[][]): Promise<unknown[]> {
  const response = await fetch(`${URL_ENV}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN_ENV}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`upstash ${response.status}`);
  const payload = (await response.json()) as { result?: unknown; error?: string }[];
  return payload.map((entry) => {
    if (entry.error) throw new Error(entry.error);
    return entry.result;
  });
}

const asNumber = (value: unknown) => (typeof value === "number" ? value : Number(value) || 0);

/**
 * Record one visit and return the fresh figures.
 *
 * `visitorId` is a random per-browser token — never an IP, never anything
 * derived from one. It only ever reaches a HyperLogLog, which stores a
 * probabilistic sketch rather than the values themselves, so the store cannot
 * be mined for who visited.
 */
export async function recordVisit(visitorId: string): Promise<VisitStats> {
  const day = dayKey();
  const results = await pipeline([
    ["INCR", "visits:total"],
    ["PFADD", `visits:hll:${day}`, visitorId],
    ["PFCOUNT", `visits:hll:${day}`],
    // daily buckets are only interesting for a while; 60 days is plenty
    ["EXPIRE", `visits:hll:${day}`, String(60 * 60 * 24 * 60)],
  ]);
  return { total: asNumber(results[0]), today: asNumber(results[2]) };
}

/** Read the figures without recording anything. */
export async function readVisits(): Promise<VisitStats> {
  const day = dayKey();
  const results = await pipeline([
    ["GET", "visits:total"],
    ["PFCOUNT", `visits:hll:${day}`],
  ]);
  return { total: asNumber(results[0]), today: asNumber(results[1]) };
}
