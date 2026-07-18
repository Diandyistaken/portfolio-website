// Stateless admin session: `v1.<expMs>.<sig>` where sig is an HMAC-SHA256
// over the version+expiry, keyed by SESSION_SECRET. Web Crypto only — the
// same module runs in the proxy (edge runtime) and in server actions.

export const SESSION_COOKIE = "mc_admin";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const TOKEN_VERSION = "v1";

function getSecret(secret?: string): string {
  const value = secret ?? process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not configured");
  return value;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

function timingSafeEqualString(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bytesA = encoder.encode(a);
  const bytesB = encoder.encode(b);
  // compare over a fixed length so mismatched lengths don't short-circuit
  const length = Math.max(bytesA.length, bytesB.length);
  let diff = bytesA.length === bytesB.length ? 0 : 1;
  for (let i = 0; i < length; i++) {
    diff |= (bytesA[i] ?? 0) ^ (bytesB[i] ?? 0);
  }
  return diff === 0;
}

export async function createSessionToken(
  maxAgeSeconds: number = SESSION_MAX_AGE_SECONDS,
  secret?: string,
): Promise<string> {
  const expiresAt = Date.now() + maxAgeSeconds * 1000;
  const payload = `${TOKEN_VERSION}.${expiresAt}`;
  const signature = await hmac(payload, getSecret(secret));
  return `${payload}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret?: string,
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [version, expiresAtRaw, signature] = parts;
  if (version !== TOKEN_VERSION) return false;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;
  let expected: string;
  try {
    expected = await hmac(`${version}.${expiresAt}`, getSecret(secret));
  } catch {
    return false;
  }
  return timingSafeEqualString(signature, expected);
}
