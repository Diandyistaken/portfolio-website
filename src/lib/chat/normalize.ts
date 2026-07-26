/**
 * Text normalization for the robot's local chat engine.
 *
 * No API, no cloud: everything the visitor types is matched in the browser.
 * The hard part is Turkish — it is agglutinative, so "proje", "projen",
 * "projelerin" and "projeleriniz" are all the same question, and visitors
 * routinely drop diacritics ("nasilsin" for "nasılsın").
 */

/** Fold diacritics so "nasilsin" matches "nasılsın" and "koennen" ~ "können". */
const FOLD: Record<string, string> = {
  ı: "i", İ: "i", ş: "s", Ş: "s", ğ: "g", Ğ: "g",
  ü: "u", Ü: "u", ö: "o", Ö: "o", ç: "c", Ç: "c",
  â: "a", î: "i", û: "u", ä: "a", Ä: "a", ß: "ss", é: "e", è: "e",
};

export function fold(input: string): string {
  let out = "";
  for (const char of input.toLowerCase()) out += FOLD[char] ?? char;
  return out;
}

/**
 * Turkish suffixes, longest first — order matters because the stripper is
 * greedy and iterative ("projelerinizden" → "projelerini" → … → "proje").
 */
const SUFFIXES = [
  "lerinizden", "larinizdan", "lerimizden", "larimizdan",
  "lerinden", "larindan", "lerimiz", "larimiz", "leriniz", "lariniz",
  "lerini", "larini", "lerin", "larin", "leri", "lari",
  "iyorum", "iyorsun", "misin", "musun", "miyim",
  "dan", "den", "tan", "ten", "nin", "nun", "nin", "num",
  "ler", "lar", "sin", "sun", "siz", "suz", "yor",
  "im", "in", "un", "um", "en", "an", "de", "da", "te", "ta",
  "ta", "ki", "si", "su", "yi", "yu", "ye", "ya", "le", "la",
  "i", "u", "e", "a", "n", "m",
];

const MIN_STEM = 3;

/** Iteratively strip suffixes down to a stem, never shorter than MIN_STEM. */
export function stem(word: string): string {
  let current = word;
  let changed = true;
  while (changed && current.length > MIN_STEM) {
    changed = false;
    for (const suffix of SUFFIXES) {
      if (current.length - suffix.length >= MIN_STEM && current.endsWith(suffix)) {
        current = current.slice(0, -suffix.length);
        changed = true;
        break;
      }
    }
  }
  return current;
}

/** Split folded text into word tokens (letters + digits only). */
export function tokenize(input: string): string[] {
  return fold(input)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0);
}

/**
 * Is `a` within one edit of `b`? Bounded on purpose: only used for tokens of
 * 5+ characters, so a single typo forgives but "ben"/"sen" never collide.
 */
export function withinOneEdit(a: string, b: string): boolean {
  if (a === b) return true;
  const lengthGap = Math.abs(a.length - b.length);
  if (lengthGap > 1) return false;

  if (a.length === b.length) {
    let diffs = 0;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i] && ++diffs > 1) return false;
    }
    return diffs === 1;
  }

  // one insertion / deletion
  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  let i = 0;
  let j = 0;
  let skipped = false;
  while (i < shorter.length && j < longer.length) {
    if (shorter[i] === longer[j]) {
      i++;
      j++;
      continue;
    }
    if (skipped) return false;
    skipped = true;
    j++;
  }
  return true;
}
