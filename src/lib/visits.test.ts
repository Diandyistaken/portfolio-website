import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The counter can't be verified against a real store here, so these tests pin
 * the two things that would otherwise only surface in production: the exact
 * Redis commands sent, and the fail-safe behaviour when the store is absent or
 * broken (it must never surface an invented number).
 */

const ORIGINAL = { ...process.env };

async function loadWithEnv(env: Record<string, string | undefined>) {
  vi.resetModules();
  process.env = { ...ORIGINAL, ...env };
  return import("./visits");
}

afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("visit store configuration", () => {
  it("reports unconfigured when the credentials are missing", async () => {
    const visits = await loadWithEnv({
      UPSTASH_REDIS_REST_URL: undefined,
      UPSTASH_REDIS_REST_TOKEN: undefined,
    });
    expect(visits.isVisitStoreConfigured()).toBe(false);
  });

  it("reports configured only when BOTH url and token are present", async () => {
    const half = await loadWithEnv({
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: undefined,
    });
    expect(half.isVisitStoreConfigured()).toBe(false);

    const full = await loadWithEnv({
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "token",
    });
    expect(full.isVisitStoreConfigured()).toBe(true);
  });
});

describe("recordVisit", () => {
  let sent: unknown;

  beforeEach(() => {
    sent = undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        sent = JSON.parse(String(init.body));
        return {
          ok: true,
          json: async () => [
            { result: 1234 }, // INCR visits:total
            { result: 1 }, // PFADD
            { result: 42 }, // PFCOUNT
            { result: 1 }, // EXPIRE
          ],
        } as unknown as Response;
      }),
    );
  });

  it("returns today's uniques and the running total", async () => {
    const visits = await loadWithEnv({
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "token",
    });
    const stats = await visits.recordVisit("visitor-abc");
    expect(stats).toEqual({ today: 42, total: 1234 });
  });

  it("counts uniques with a HyperLogLog, so no visitor id is ever stored", async () => {
    const visits = await loadWithEnv({
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "token",
    });
    await visits.recordVisit("visitor-abc");
    const commands = sent as string[][];
    const day = visits.dayKey();

    expect(commands[0]).toEqual(["INCR", "visits:total"]);
    expect(commands[1]).toEqual(["PFADD", `visits:hll:${day}`, "visitor-abc"]);
    expect(commands[2]).toEqual(["PFCOUNT", `visits:hll:${day}`]);
    // the id only ever reaches PFADD — never a SET, list or hash
    const storesRawId = commands.some(
      ([command, , value]) => command !== "PFADD" && value === "visitor-abc",
    );
    expect(storesRawId).toBe(false);
  });

  it("scopes the daily bucket by UTC date", async () => {
    const visits = await loadWithEnv({
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "token",
    });
    expect(visits.dayKey(new Date("2026-07-26T23:30:00Z"))).toBe("2026-07-26");
    expect(visits.dayKey(new Date("2026-07-27T00:10:00Z"))).toBe("2026-07-27");
  });

  it("expires daily buckets instead of growing forever", async () => {
    const visits = await loadWithEnv({
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "token",
    });
    await visits.recordVisit("visitor-abc");
    const commands = sent as string[][];
    expect(commands[3][0]).toBe("EXPIRE");
    expect(Number(commands[3][2])).toBeGreaterThan(0);
  });

  it("throws on a store error rather than reporting a made-up number", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 500 }) as unknown as Response),
    );
    const visits = await loadWithEnv({
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "token",
    });
    await expect(visits.recordVisit("visitor-abc")).rejects.toThrow();
  });
});
