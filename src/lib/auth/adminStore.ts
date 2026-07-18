// Where the admin password hash lives. Reads prefer Vercel Edge Config (so a
// password reset takes effect instantly, no redeploy); the ADMIN_PASSWORD_HASH
// env var is the fallback/initial value. Writes go through the Vercel REST API
// and need VERCEL_TOKEN.

const EDGE_CONFIG_KEY = "admin_password_hash";

type EdgeConfigConnection = { id: string; readToken: string };

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

async function readHashFromEdgeConfig(): Promise<string | null> {
  const connection = parseConnection();
  if (!connection) return null;
  try {
    const response = await fetch(
      `https://edge-config.vercel.com/${connection.id}/item/${EDGE_CONFIG_KEY}?token=${connection.readToken}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    const value = (await response.json()) as unknown;
    return typeof value === "string" && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

/** Current admin password hash: Edge Config value beats the env fallback. */
export async function getStoredPasswordHash(): Promise<string | null> {
  const fromEdgeConfig = await readHashFromEdgeConfig();
  if (fromEdgeConfig) return fromEdgeConfig;
  return process.env.ADMIN_PASSWORD_HASH ?? null;
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
}
