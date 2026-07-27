// Where the admin password hash lives. Reads prefer Vercel Edge Config (so a
// password reset takes effect instantly, no redeploy); the ADMIN_PASSWORD_HASH
// env var is the fallback/initial value. Writes go through the Vercel REST API
// and need VERCEL_TOKEN.
//
// Fail-closed rule: once Edge Config is configured it becomes the source of
// truth. If a read FAILS (network/5xx), we must NOT silently fall back to the
// env var — that env var can hold the OLD hash a reset already replaced, which
// would quietly bring a rotated-out password back to life. On an unreachable
// store we serve the last value we actually read (bounded by BRIDGE_TTL) and
// otherwise deny. The env var is only trusted when Edge Config is reachable but
// genuinely has no value yet (initial state, before the first reset).

const EDGE_CONFIG_KEY = "admin_password_hash";

// Skip the network when we read successfully very recently — collapses the
// ~18 requests of one arena page-load into a single Edge Config read. Kept
// short so a password reset propagates almost immediately.
const POSITIVE_TTL_MS = 10_000;
// How long a previously-good value may bridge an Edge Config outage before we
// fail closed. Long enough to ride out a blip, short enough to bound risk.
const BRIDGE_TTL_MS = 5 * 60_000;

type EdgeConfigConnection = { id: string; readToken: string };

type HashRead =
  | { kind: "value"; hash: string }
  | { kind: "absent" } // reachable, key not set
  | { kind: "unreachable" }; // configured but read failed

let cache: { hash: string; ts: number } | null = null;

function parseConnection(): EdgeConfigConnection | null {
  const connection = process.env.EDGE_CONFIG;
  if (!connection) return null;
  try {
    const url = new URL(connection);
    const id = url.pathname.replace(/^\//, "");
    const readToken = url.searchParams.get("token");
    if (!id || !readToken) return null;
    return { id, readToken };
  } catch {
    return null;
  }
}

async function readHashFromEdgeConfig(connection: EdgeConfigConnection): Promise<HashRead> {
  try {
    const response = await fetch(
      `https://edge-config.vercel.com/${connection.id}/item/${EDGE_CONFIG_KEY}?token=${connection.readToken}`,
      { cache: "no-store" },
    );
    if (!response.ok) return { kind: "unreachable" };
    const value = (await response.json()) as unknown;
    if (typeof value === "string" && value.length > 0) return { kind: "value", hash: value };
    return { kind: "absent" };
  } catch {
    return { kind: "unreachable" };
  }
}

/** Current admin password hash, or null if there is none / the store is down. */
export async function getStoredPasswordHash(): Promise<string | null> {
  const connection = parseConnection();
  // Edge Config not configured at all → the env var is the source of truth.
  if (!connection) return process.env.ADMIN_PASSWORD_HASH ?? null;

  // Recent successful read → reuse it instead of hammering the store.
  if (cache && Date.now() - cache.ts < POSITIVE_TTL_MS) return cache.hash;

  const read = await readHashFromEdgeConfig(connection);
  if (read.kind === "value") {
    cache = { hash: read.hash, ts: Date.now() };
    return read.hash;
  }
  if (read.kind === "absent") {
    // Reachable, no value yet: initial state before any reset — env is correct.
    return process.env.ADMIN_PASSWORD_HASH ?? null;
  }
  // Unreachable: bridge with the last known-good value, else fail closed.
  // Never fall back to the env var here — it may be a rotated-out hash.
  if (cache && Date.now() - cache.ts < BRIDGE_TTL_MS) return cache.hash;
  return null;
}

export function canPersistPasswordHash(): boolean {
  return Boolean(parseConnection() && process.env.VERCEL_TOKEN);
}

/** Persist a new hash to Edge Config. Throws with a clear message on failure. */
export async function setStoredPasswordHash(hash: string): Promise<void> {
  const connection = parseConnection();
  const apiToken = process.env.VERCEL_TOKEN;
  if (!connection || !apiToken) {
    throw new Error("Edge Config yazımı yapılandırılmamış (EDGE_CONFIG + VERCEL_TOKEN gerekli).");
  }
  const teamId = process.env.VERCEL_TEAM_ID;
  const query = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
  const response = await fetch(`https://api.vercel.com/v1/edge-config/${connection.id}/items${query}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ operation: "upsert", key: EDGE_CONFIG_KEY, value: hash }],
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Edge Config güncellenemedi (${response.status}): ${detail.slice(0, 200)}`);
  }
  // Reflect the new hash immediately so this instance stops honouring the old
  // one without waiting for the positive-cache window to lapse.
  cache = { hash, ts: Date.now() };
}
