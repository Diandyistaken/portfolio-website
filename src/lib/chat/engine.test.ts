import { describe, expect, it } from "vitest";
import { compile, createContext, respond, type ChatBrain } from "./engine";
import { stem, tokenize, withinOneEdit } from "./normalize";
import { tr } from "../i18n/tr";
import { en } from "../i18n/en";
import { de } from "../i18n/de";

const brain: ChatBrain = {
  intents: [
    {
      id: "projects",
      keywords: ["proje", "portfoy"],
      responses: ["kısa cevap", "daha derin cevap", "en derin cevap"],
      followups: ["Daily AI Researcher nedir?"],
    },
    {
      id: "contact",
      keywords: ["iletisim", "mail", "eposta"],
      responses: ["e-postayı kopyala"],
    },
    {
      id: "ai",
      keywords: ["yapay zeka"],
      responses: ["ilk || ikinci"],
      multi: true,
    },
  ],
  fallbacks: ["anlamadım-1", "anlamadım-2"],
  chips: ["Kim bu Maksut?", "Projeler", "İletişim", "Şaka yap"],
};

const compiled = compile(brain);

describe("normalize", () => {
  it("folds Turkish diacritics so undotted input still matches", () => {
    expect(tokenize("Nasılsın ŞÜKRÜ")).toEqual(["nasilsin", "sukru"]);
  });

  it("strips Turkish suffixes down to a shared stem", () => {
    const target = stem("proje");
    for (const inflected of ["projen", "projeler", "projelerin", "projelerinizden"]) {
      expect(stem(inflected)).toBe(target);
    }
  });

  it("never stems below three characters", () => {
    expect(stem("ben").length).toBeGreaterThanOrEqual(3);
  });

  it("accepts one edit but not two", () => {
    expect(withinOneEdit("iletisim", "iletisimm")).toBe(true);
    expect(withinOneEdit("iletisim", "iltisim")).toBe(true);
    expect(withinOneEdit("iletisim", "iltisiim")).toBe(false);
  });
});

describe("respond", () => {
  it("matches an inflected Turkish word to its intent", () => {
    // the old substring engine missed this: "projelerin" never equalled "proje"
    const reply = respond(compiled, brain, "senin projelerin neler", createContext());
    expect(reply.intentId).toBe("projects");
  });

  it("deepens the answer when the same thing is asked again", () => {
    const context = createContext();
    expect(respond(compiled, brain, "proje", context).bubbles[0]).toBe("kısa cevap");
    expect(respond(compiled, brain, "proje", context).bubbles[0]).toBe("daha derin cevap");
    expect(respond(compiled, brain, "proje", context).bubbles[0]).toBe("en derin cevap");
    // ladder exhausted: stay deep instead of looping back to the shallow line
    expect(respond(compiled, brain, "proje", context).bubbles[0]).toBe("en derin cevap");
  });

  it("treats 'devam' as staying on the previous topic", () => {
    const context = createContext();
    respond(compiled, brain, "proje", context);
    const reply = respond(compiled, brain, "devam", context);
    expect(reply.intentId).toBe("projects");
    expect(reply.bubbles[0]).toBe("daha derin cevap");
  });

  it("splits a multi response into separate bubbles", () => {
    const reply = respond(compiled, brain, "yapay zeka nedir", createContext());
    expect(reply.bubbles).toEqual(["ilk", "ikinci"]);
  });

  it("falls back — and rotates — when nothing scores above the threshold", () => {
    const context = createContext();
    const first = respond(compiled, brain, "zxqw qqq", context);
    const second = respond(compiled, brain, "zxqw qqq", context);
    expect(first.intentId).toBeNull();
    expect(first.bubbles[0]).toBe("anlamadım-1");
    expect(second.bubbles[0]).toBe("anlamadım-2");
  });

  it("offers the intent's own followup chips when it has them", () => {
    const reply = respond(compiled, brain, "proje", createContext());
    expect(reply.chips).toContain("Daily AI Researcher nedir?");
  });
});

describe("shipped knowledge base", () => {
  const locales = { tr, en, de };

  for (const [name, dict] of Object.entries(locales)) {
    it(`${name} answers its own starter chips instead of falling back`, () => {
      const localeBrain: ChatBrain = {
        intents: dict.robotChat.intents,
        fallbacks: dict.robotChat.fallbacks,
        chips: dict.robotChat.chips,
      };
      const localeCompiled = compile(localeBrain);
      for (const chip of dict.robotChat.chips) {
        const reply = respond(localeCompiled, localeBrain, chip, createContext());
        expect(reply.intentId, `${name}: chip "${chip}" fell through to a fallback`).not.toBeNull();
      }
    });

    it(`${name} has no intent with an empty response ladder`, () => {
      for (const intent of dict.robotChat.intents) {
        expect(intent.responses.length, `${name}:${intent.id}`).toBeGreaterThan(0);
        expect(intent.keywords.length, `${name}:${intent.id}`).toBeGreaterThan(0);
      }
    });
  }

  it("every locale ships the same intent ids in the same order", () => {
    const ids = tr.robotChat.intents.map((intent) => intent.id);
    expect(en.robotChat.intents.map((intent) => intent.id)).toEqual(ids);
    expect(de.robotChat.intents.map((intent) => intent.id)).toEqual(ids);
  });
});
