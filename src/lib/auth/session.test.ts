import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./session";

const SECRET = "test-secret-key-for-vitest";
const HASH = "scrypt:16384:8:1:c2FsdA:aGFzaA"; // a stand-in stored password hash

describe("session token", () => {
  it("verifies a freshly created token", async () => {
    const token = await createSessionToken(HASH, 60, SECRET);
    expect(await verifySessionToken(token, HASH, SECRET)).toBe(true);
  });

  it("rejects a missing or malformed token", async () => {
    expect(await verifySessionToken(undefined, HASH, SECRET)).toBe(false);
    expect(await verifySessionToken("", HASH, SECRET)).toBe(false);
    expect(await verifySessionToken("v2.only-two-parts", HASH, SECRET)).toBe(false);
    expect(await verifySessionToken("garbage.token.value.here", HASH, SECRET)).toBe(false);
  });

  it("rejects a valid token when the password hash is unknown", async () => {
    const token = await createSessionToken(HASH, 60, SECRET);
    expect(await verifySessionToken(token, undefined, SECRET)).toBe(false);
  });

  it("rejects a token once the password (hash) has changed", async () => {
    const token = await createSessionToken(HASH, 60, SECRET);
    const newHash = "scrypt:16384:8:1:bmV3c2FsdA:bmV3aGFzaA";
    expect(await verifySessionToken(token, newHash, SECRET)).toBe(false);
  });

  it("rejects a tampered signature", async () => {
    const token = await createSessionToken(HASH, 60, SECRET);
    const tampered = token.slice(0, -2) + (token.endsWith("aa") ? "bb" : "aa");
    expect(await verifySessionToken(tampered, HASH, SECRET)).toBe(false);
  });

  it("rejects a tampered expiry", async () => {
    const token = await createSessionToken(HASH, 60, SECRET);
    const [version, expiry, fingerprint, signature] = token.split(".");
    const extended = `${version}.${Number(expiry) + 9_999_999}.${fingerprint}.${signature}`;
    expect(await verifySessionToken(extended, HASH, SECRET)).toBe(false);
  });

  it("rejects an expired token", async () => {
    const token = await createSessionToken(HASH, -1, SECRET);
    expect(await verifySessionToken(token, HASH, SECRET)).toBe(false);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken(HASH, 60, "another-secret");
    expect(await verifySessionToken(token, HASH, SECRET)).toBe(false);
  });
});
