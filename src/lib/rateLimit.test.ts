import { afterEach, describe, expect, it, vi } from "vitest";
import { clientIp } from "./rateLimit";

describe("clientIp", () => {
  it("takes the first hop of x-forwarded-for", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.7, 70.41.3.18, 150.172.238.178" });
    expect(clientIp(h)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip, then a constant", () => {
    expect(clientIp(new Headers({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});

describe("rateLimit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("falls back to an in-process counter when Upstash is not configured", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    const { rateLimit } = await import("./rateLimit");
    for (let i = 1; i <= 3; i++) {
      expect((await rateLimit("rl:mem", 3, 60)).allowed).toBe(true);
    }
    // 4th hit in the same window is blocked even with no Redis behind it
    expect((await rateLimit("rl:mem", 3, 60)).allowed).toBe(false);
  });

  it("starts a fresh in-process window once the old one expires", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    const { rateLimit } = await import("./rateLimit");
    expect((await rateLimit("rl:exp", 1, 60)).allowed).toBe(true);
    expect((await rateLimit("rl:exp", 1, 60)).allowed).toBe(false);
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 61_000);
    expect((await rateLimit("rl:exp", 1, 60)).allowed).toBe(true);
    vi.useRealTimers();
  });

  it("blocks once the count exceeds the limit", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    let count = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        count += 1;
        return { ok: true, json: async () => [{ result: count }, { result: 1 }] } as Response;
      }),
    );
    const { rateLimit } = await import("./rateLimit");
    for (let i = 1; i <= 3; i++) {
      expect((await rateLimit("rl:test", 3, 60)).allowed).toBe(true);
    }
    expect((await rateLimit("rl:test", 3, 60)).allowed).toBe(false);
  });

  it("fails OPEN when the store errors", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const { rateLimit } = await import("./rateLimit");
    expect((await rateLimit("rl:test", 3, 60)).allowed).toBe(true);
  });
});
