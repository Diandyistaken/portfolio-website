import { stem, tokenize, withinOneEdit } from "./normalize";

/** One knowledge-base entry, as authored in src/lib/i18n/<locale>.ts. */
export type ChatIntent = {
  id: string;
  keywords: string[];
  responses: string[];
  /** Follow-up chips offered after this answer. */
  followups?: string[];
  /** When true, `responses` entries are split on "||" into separate bubbles. */
  multi?: boolean;
};

export type ChatBrain = {
  intents: ChatIntent[];
  fallbacks: string[];
  chips: string[];
};

/** Mutable per-conversation memory. Owned by the component, passed back in. */
export type ChatContext = {
  /** How many times each intent has been asked — drives "deepening" replies. */
  asked: Record<string, number>;
  /** Last matched intent id, so "devam" / "tell me more" has a referent. */
  lastIntentId: string | null;
  /** Rotates fallbacks so the bot doesn't repeat itself when lost. */
  fallbackIndex: number;
};

export function createContext(): ChatContext {
  return { asked: {}, lastIntentId: null, fallbackIndex: 0 };
}

export type ChatReply = {
  /** One or more bubbles to type out in order. */
  bubbles: string[];
  /** Chips to show under the conversation after this reply. */
  chips: string[];
  /** Matched intent id, or null when this was a fallback. */
  intentId: string | null;
};

/** Words that mean "go on" rather than starting a new topic. */
const CONTINUE_WORDS = [
  "devam", "daha", "baska", "peki", "sonra", "anlat",
  "more", "go on", "continue", "else", "another",
  "mehr", "weiter", "noch",
];

/**
 * Below this score a "match" is noise — better to admit we didn't get it.
 * Calibrated so ONE exact stem hit (2.0 + length bonus) always clears it,
 * while a lone typo-tolerant hit (1.0) never does.
 */
const SCORE_THRESHOLD = 1.5;

type CompiledIntent = {
  intent: ChatIntent;
  /** Pre-stemmed keyword tokens, deduped. */
  terms: { full: string; tokens: string[] }[];
};

/** Pre-stem the knowledge base once per locale instead of on every message. */
export function compile(brain: ChatBrain): CompiledIntent[] {
  return brain.intents.map((intent) => ({
    intent,
    terms: intent.keywords.map((keyword) => {
      const tokens = tokenize(keyword).map(stem);
      return { full: tokenize(keyword).join(" "), tokens };
    }),
  }));
}

/**
 * Score one intent against the visitor's tokens.
 *
 * Weighting, strongest signal first:
 *   3.0  multi-word keyword matched as a phrase ("yapay zeka")
 *   2.0  exact token match after stemming
 *   1.0  one-typo match on a long token
 * Longer keywords count slightly more so "cv" can't outrank "career advice".
 */
function scoreIntent(compiled: CompiledIntent, tokens: string[], stems: string[], raw: string): number {
  let score = 0;
  for (const term of compiled.terms) {
    if (term.tokens.length === 0) continue;

    // phrase match
    if (term.tokens.length > 1) {
      if (raw.includes(term.full)) score += 3 + term.full.length * 0.02;
      continue;
    }

    const target = term.tokens[0];
    if (stems.includes(target)) {
      score += 2 + target.length * 0.04;
      continue;
    }
    // typo tolerance only on longer words, to avoid ben/sen style collisions
    if (target.length >= 5 && tokens.some((token) => token.length >= 5 && withinOneEdit(token, target))) {
      score += 1;
    }
  }
  return score;
}

/** Split a stored response into bubbles when the intent is marked `multi`. */
function toBubbles(text: string, multi: boolean | undefined): string[] {
  if (!multi) return [text];
  return text
    .split("||")
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Pick a reply for `input`.
 *
 * Mutates `context` (ask counts, last intent, fallback rotation) so repeat
 * questions get progressively deeper answers instead of the same line.
 */
export function respond(
  compiled: CompiledIntent[],
  brain: ChatBrain,
  input: string,
  context: ChatContext,
): ChatReply {
  const tokens = tokenize(input);
  const stems = tokens.map(stem);
  const raw = tokens.join(" ");

  // "tell me more" — stay on the previous topic and go one level deeper.
  const wantsMore =
    context.lastIntentId !== null &&
    tokens.length <= 4 &&
    CONTINUE_WORDS.some((word) => raw.includes(word.replace(/\s/g, " ")));

  let winner: CompiledIntent | null = null;

  if (wantsMore) {
    winner = compiled.find((entry) => entry.intent.id === context.lastIntentId) ?? null;
  }

  if (!winner) {
    let best = SCORE_THRESHOLD;
    for (const entry of compiled) {
      const score = scoreIntent(entry, tokens, stems, raw);
      if (score > best) {
        best = score;
        winner = entry;
      }
    }
  }

  if (!winner) {
    const fallback = brain.fallbacks[context.fallbackIndex % brain.fallbacks.length];
    context.fallbackIndex += 1;
    context.lastIntentId = null;
    return { bubbles: [fallback], chips: brain.chips.slice(0, 4), intentId: null };
  }

  const { intent } = winner;
  const seen = context.asked[intent.id] ?? 0;
  context.asked[intent.id] = seen + 1;
  context.lastIntentId = intent.id;

  // Walk down the response ladder: 0 = short, later = deeper. Once the ladder
  // is exhausted, stay on the last (deepest) answer rather than looping back.
  const index = Math.min(seen, intent.responses.length - 1);
  const bubbles = toBubbles(intent.responses[index] ?? intent.responses[0], intent.multi);

  const chips = (intent.followups && intent.followups.length > 0 ? intent.followups : brain.chips).slice(0, 3);

  return { bubbles, chips, intentId: intent.id };
}
