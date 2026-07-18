// Password-reset token: `r1.<expMs>.<fingerprint>.<sig>` — HMAC-signed like
// the session token, plus a fingerprint of the CURRENT password hash so every
// outstanding token dies the moment the password actually changes.

const TOKEN_VERSION = "r1";
export const RESET_TOKEN_MAX_AGE_SECONDS = 30 * 60;

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

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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
  const length = Math.max(bytesA.length, bytesB.length);
  let diff = bytesA.length === bytesB.length ? 0 : 1;
  for (let i = 0; i < length; i++) {
    diff |= (bytesA[i] ?? 0) ^ (bytesB[i] ?? 0);
  }
  return diff === 0;
}

async function hashFingerprint(currentPasswordHash: string): Promise<string> {
  return (await sha256Hex(currentPasswordHash)).slice(0, 16);
}

export async function createResetToken(
  currentPasswordHash: string,
  maxAgeSeconds: number = RESET_TOKEN_MAX_AGE_SECONDS,
  secret?: string,
): Promise<string> {
  const expiresAt = Date.now() + maxAgeSeconds * 1000;
  const fingerprint = await hashFingerprint(currentPasswordHash);
  const payload = `${TOKEN_VERSION}.${expiresAt}.${fingerprint}`;
  const signature = await hmac(payload, getSecret(secret));
  return `${payload}.${signature}`;
}

export async function verifyResetToken(
  token: string | undefined,
  currentPasswordHash: string,
  secret?: string,
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [version, expiresAtRaw, fingerprint, signature] = parts;
  if (version !== TOKEN_VERSION) return false;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;
  const expectedFingerprint = await hashFingerprint(currentPasswordHash);
  if (!timingSafeEqualString(fingerprint, expectedFingerprint)) return false;
  let expected: string;
  try {
    expected = await hmac(`${version}.${expiresAt}.${fingerprint}`, getSecret(secret));
  } catch {
    return false;
  }
  return timingSafeEqualString(signature, expected);
}
