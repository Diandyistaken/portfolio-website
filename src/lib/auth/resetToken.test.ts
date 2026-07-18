import { describe, expect, it } from "vitest";
import { createResetToken, verifyResetToken } from "./resetToken";

const SECRET = "test-secret-key-for-vitest";
const CURRENT_HASH = "scrypt:16384:8:1:saltsalt:hashhash";

describe("reset token", () => {
  it("verifies a fresh token against the current password hash", async () => {
    const token = await createResetToken(CURRENT_HASH, 60, SECRET);
    expect(await verifyResetToken(token, CURRENT_HASH, SECRET)).toBe(true);
  });

  it("rejects missing or malformed tokens", async () => {
    expect(await verifyResetToken(undefined, CURRENT_HASH, SECRET)).toBe(false);
    expect(await verifyResetToken("", CURRENT_HASH, SECRET)).toBe(false);
    expect(await verifyResetToken("r1.123.abc", CURRENT_HASH, SECRET)).toBe(false);
  });

  it("dies once the password hash changes (single-use across resets)", async () => {
    const token = await createResetToken(CURRENT_HASH, 60, SECRET);
    expect(await verifyResetToken(token, "scrypt:16384:8:1:other:hash", SECRET)).toBe(false);
  });

  it("rejects an expired token", async () => {
    const token = await createResetToken(CURRENT_HASH, -1, SECRET);
    expect(await verifyResetToken(token, CURRENT_HASH, SECRET)).toBe(false);
  });

  it("rejects a tampered signature", async () => {
    const token = await createResetToken(CURRENT_HASH, 60, SECRET);
    const tampered = token.slice(0, -2) + (token.endsWith("aa") ? "bb" : "aa");
    expect(await verifyResetToken(tampered, CURRENT_HASH, SECRET)).toBe(false);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createResetToken(CURRENT_HASH, 60, "another-secret");
    expect(await verifyResetToken(token, CURRENT_HASH, SECRET)).toBe(false);
  });
});
