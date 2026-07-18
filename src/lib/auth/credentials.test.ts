import { scryptSync, randomBytes } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { hashPassword, verifyCredentials, verifyPassword } from "./credentials";

function makeHash(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt:16384:8:1:${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

const PASSWORD = "correct horse battery staple";
const HASH = makeHash(PASSWORD);

describe("verifyPassword", () => {
  it("accepts the right password", () => {
    expect(verifyPassword(PASSWORD, HASH)).toBe(true);
  });

  it("rejects a wrong password", () => {
    expect(verifyPassword("wrong-password", HASH)).toBe(false);
  });

  it("rejects empty and oversized input", () => {
    expect(verifyPassword("", HASH)).toBe(false);
    expect(verifyPassword("x".repeat(300), HASH)).toBe(false);
  });

  it("rejects a malformed stored hash", () => {
    expect(verifyPassword(PASSWORD, "plaintext")).toBe(false);
    expect(verifyPassword(PASSWORD, "scrypt:bad:params:1:aa:bb")).toBe(false);
  });
});

describe("hashPassword", () => {
  it("produces a hash that verifies against the same password only", () => {
    const hash = hashPassword("yeni-sifre-123456");
    expect(verifyPassword("yeni-sifre-123456", hash)).toBe(true);
    expect(verifyPassword("baska-sifre-123456", hash)).toBe(false);
  });
});

describe("verifyCredentials", () => {
  const originalUsername = process.env.ADMIN_USERNAME;
  const originalHash = process.env.ADMIN_PASSWORD_HASH;

  afterEach(() => {
    process.env.ADMIN_USERNAME = originalUsername;
    process.env.ADMIN_PASSWORD_HASH = originalHash;
  });

  it("accepts the configured username + password pair", async () => {
    process.env.ADMIN_USERNAME = "admin-user";
    process.env.ADMIN_PASSWORD_HASH = HASH;
    expect(await verifyCredentials("admin-user", PASSWORD)).toBe(true);
  });

  it("rejects a wrong username even with the right password", async () => {
    process.env.ADMIN_USERNAME = "admin-user";
    process.env.ADMIN_PASSWORD_HASH = HASH;
    expect(await verifyCredentials("someone-else", PASSWORD)).toBe(false);
  });

  it("rejects everything when env is not configured", async () => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD_HASH;
    expect(await verifyCredentials("admin-user", PASSWORD)).toBe(false);
  });
});
