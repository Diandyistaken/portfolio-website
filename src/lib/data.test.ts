import { describe, expect, it } from "vitest";
import { tr } from "./i18n/tr";
import {
  skillsMeta,
  servicesMeta,
  experienceMeta,
  educationPhotosMeta,
  projectsMeta,
  goalsMeta,
} from "./data";

// Content (tr.ts) and structural data (data.ts) are split on purpose so a
// locale never risks drifting non-text fields — but that split only holds
// if every id on one side has exactly one match on the other.
describe("content <-> structural data referential integrity", () => {
  it("every skills category id has a skillsMeta entry, and vice versa", () => {
    const contentIds = tr.skills.categories.map((c) => c.id).sort();
    expect(Object.keys(skillsMeta).sort()).toEqual(contentIds);
  });

  it("every service id has a servicesMeta entry, and vice versa", () => {
    const contentIds = tr.services.items.map((s) => s.id).sort();
    expect(Object.keys(servicesMeta).sort()).toEqual(contentIds);
  });

  it("every experience id has an experienceMeta entry, and vice versa", () => {
    const contentIds = tr.experience.items.map((e) => e.id).sort();
    expect(Object.keys(experienceMeta).sort()).toEqual(contentIds);
  });

  it("every education photo id has an educationPhotosMeta entry, and vice versa", () => {
    const contentIds = tr.education.photos.map((p) => p.id).sort();
    expect(Object.keys(educationPhotosMeta).sort()).toEqual(contentIds);
  });

  it("every project id has a projectsMeta entry, and vice versa", () => {
    const contentIds = tr.projects.items.map((p) => p.id).sort();
    expect(Object.keys(projectsMeta).sort()).toEqual(contentIds);
  });

  it("every goal id has a goalsMeta entry, and vice versa", () => {
    const contentIds = tr.goals.items.map((g) => g.id).sort();
    expect(Object.keys(goalsMeta).sort()).toEqual(contentIds);
  });

  it("every project url is https and every tag list is non-empty", () => {
    for (const [id, meta] of Object.entries(projectsMeta)) {
      expect(meta.url.startsWith("https://"), `${id} url should be https`).toBe(true);
      expect(meta.tags.length, `${id} should have at least one tag`).toBeGreaterThan(0);
    }
  });

  it("every goal progress is between 0 and 100", () => {
    for (const [id, meta] of Object.entries(goalsMeta)) {
      expect(meta.progress, `${id} progress`).toBeGreaterThanOrEqual(0);
      expect(meta.progress, `${id} progress`).toBeLessThanOrEqual(100);
    }
  });
});
