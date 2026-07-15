import { describe, expect, it } from "vitest";
import { tr } from "./tr";
import { en } from "./en";
import { de } from "./de";

function collectKeyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    // Arrays are content lists (items, photos, ticker lines, ...): only the
    // shape of the first element matters for structural parity, not the count.
    return value.length > 0 ? collectKeyPaths(value[0], `${prefix}[]`) : [];
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, v]) =>
      collectKeyPaths(v, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
}

function collectEmptyStringPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => collectEmptyStringPaths(item, `${prefix}[${i}]`));
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, v]) =>
      collectEmptyStringPaths(v, prefix ? `${prefix}.${key}` : key),
    );
  }
  // stats[].suffix is legitimately empty (e.g. a bare year has no "+" suffix).
  if (typeof value === "string" && value.trim() === "" && !prefix.endsWith(".suffix")) {
    return [prefix];
  }
  return [];
}

describe("locale content parity", () => {
  const locales = { tr, en, de };
  const trKeys = collectKeyPaths(tr).sort();

  for (const [name, dict] of Object.entries(locales)) {
    it(`${name} has the same key structure as tr`, () => {
      expect(collectKeyPaths(dict).sort()).toEqual(trKeys);
    });

    it(`${name} has no empty-string values`, () => {
      expect(collectEmptyStringPaths(dict)).toEqual([]);
    });

    it(`${name} htmlLang matches its own locale code`, () => {
      expect(dict.htmlLang).toBe(name);
    });
  }

  it("every locale's education.photos ids match tr's", () => {
    const trIds = tr.education.photos.map((p) => p.id).sort();
    expect(en.education.photos.map((p) => p.id).sort()).toEqual(trIds);
    expect(de.education.photos.map((p) => p.id).sort()).toEqual(trIds);
  });

  it("every locale's project ids match tr's, in the same order", () => {
    const trIds = tr.projects.items.map((p) => p.id);
    expect(en.projects.items.map((p) => p.id)).toEqual(trIds);
    expect(de.projects.items.map((p) => p.id)).toEqual(trIds);
  });
});
