import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./session";

const SECRET = "test-secret-key-for-vitest";

describe("session token", () => {
  it("verifies a freshly created token", async () => {
    const token = await createSessionToken(60, SECRET);
    expect(await verifySessionToken(token, SECRET)).toBe(true);
  });

  it("rejects a missing or malformed token", async () => {
    expect(await verifySessionToken(undefined, SECRET)).toBe(false);
    expect(await verifySessionToken("", SECRET)).toBe(false);
    expect(await verifySessionToken("v1.only-two-parts", SECRET)).toBe(false);
    expect(await verifySessionToken("garbage.token.value", SECRET)).toBe(false);
  });

  it("rejects a tampered signature", async () => {
    const token = await createSessionToken(60, SECRET);
    const tampered = token.slice(0, -2) + (token.endsWith("aa") ? "bb" : "aa");
    expect(await verifySessionToken(tampered, SECRET)).toBe(false);
  });

  it("rejects a tampered expiry", async () => {
    const token = await createSessionToken(60, SECRET);
    const [version, expiry, signature] = token.split(".");
    const extended = `${version}.${Number(expiry) + 9_999_999}.${signature}`;
    expect(await verifySessionToken(extended, SECRET)).toBe(false);
  });

  it("rejects an expired token", async () => {
    const token = await createSessionToken(-1, SECRET);
    expect(await verifySessionToken(token, SECRET)).toBe(false);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken(60, "another-secret");
    expect(await verifySessionToken(token, SECRET)).toBe(false);
  });
});
