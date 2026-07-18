// Node-only credential check for the login server action. The stored hash
// format is `scrypt:N:r:p:saltB64url:hashB64url` (generated once, kept in
// ADMIN_PASSWORD_HASH — never a plaintext password in the environment).
import { scryptSync, timingSafeEqual, createHash, randomBytes } from "node:crypto";
import { getStoredPasswordHash } from "./adminStore";

const MAX_INPUT_LENGTH = 256;

function safeEqual(a: string, b: string): boolean {
  // hash both sides first so length differences don't leak via timingSafeEqual
  const digestA = createHash("sha256").update(a, "utf8").digest();
  const digestB = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(digestA, digestB);
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || password.length > MAX_INPUT_LENGTH) return false;
  const parts = storedHash.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, nRaw, rRaw, pRaw, saltRaw, hashRaw] = parts;
  const N = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (![N, r, p].every((value) => Number.isInteger(value) && value > 0)) return false;
  try {
    const salt = Buffer.from(saltRaw, "base64url");
    const expected = Buffer.from(hashRaw, "base64url");
    const actual = scryptSync(password, salt, expected.length, { N, r, p });
    return expected.length > 0 && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/** Generate a fresh scrypt hash string for a new password. */
export function hashPassword(password: string): string {
  const N = 16384;
  const r = 8;
  const p = 1;
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, { N, r, p });
  return `scrypt:${N}:${r}:${p}:${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const storedHash = await getStoredPasswordHash();
  if (!expectedUsername || !storedHash) return false;
  if (!username || username.length > MAX_INPUT_LENGTH) return false;
  const usernameOk = safeEqual(username, expectedUsername);
  const passwordOk = verifyPassword(password, storedHash);
  return usernameOk && passwordOk;
}
