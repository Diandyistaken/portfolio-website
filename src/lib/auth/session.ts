// Stateless admin session: `v2.<expMs>.<fp>.<sig>` where fp is a fingerprint of
// the CURRENT admin password hash and sig is an HMAC-SHA256 over version+expiry+
// fp, keyed by SESSION_SECRET. Binding the token to the password fingerprint is
// what lets a password change revoke every outstanding session — the same trick
// the reset token already uses (see resetToken.ts). Web Crypto only: the same
// module runs in the proxy (edge runtime) and in server actions.

export const SESSION_COOKIE = "mc_admin";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const TOKEN_VERSION = "v2";

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

/** Short fingerprint of the current password hash — changes the moment the
 *  password does, so every token minted against the old hash stops verifying. */
async function hashFingerprint(passwordHash: string): Promise<string> {
  return (await sha256Hex(passwordHash)).slice(0, 16);
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
  passwordHash: string,
  maxAgeSeconds: number = SESSION_MAX_AGE_SECONDS,
  secret?: string,
): Promise<string> {
  const expiresAt = Date.now() + maxAgeSeconds * 1000;
  const fingerprint = await hashFingerprint(passwordHash);
  const payload = `${TOKEN_VERSION}.${expiresAt}.${fingerprint}`;
  const signature = await hmac(payload, getSecret(secret));
  return `${payload}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined,
  passwordHash: string | undefined,
  secret?: string,
): Promise<boolean> {
  // No token or no password on record → not an admin. Fail closed.
  if (!token || !passwordHash) return false;
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [version, expiresAtRaw, fingerprint, signature] = parts;
  if (version !== TOKEN_VERSION) return false;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;
  // The token is only valid for the password it was minted against.
  const expectedFingerprint = await hashFingerprint(passwordHash);
  if (!timingSafeEqualString(fingerprint, expectedFingerprint)) return false;
  let expected: string;
  try {
    expected = await hmac(`${version}.${expiresAt}.${fingerprint}`, getSecret(secret));
  } catch {
    return false;
  }
  return timingSafeEqualString(signature, expected);
}
