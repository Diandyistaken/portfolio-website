import { notFound } from "next/navigation";
import type { Content, Locale } from "./types";
import { tr } from "./tr";
import { en } from "./en";
import { de } from "./de";

export const supportedLocales: Locale[] = ["tr", "en", "de"];

const dictionaries: Record<Locale, Content> = { tr, en, de };

export function getDictionary(locale: Locale): Content {
  return dictionaries[locale];
}

// tr is unprefixed ("/") so the existing canonical URL keeps working;
// en/de are prefixed ("/en", "/de") so each locale has a crawlable,
// server-rendered URL search engines can index independently.
export function resolveLocale(segments: string[] | undefined): Locale {
  if (!segments || segments.length === 0) return "tr";
  if (segments.length > 1) notFound();
  const [segment] = segments;
  if (segment === "en" || segment === "de") return segment;
  notFound();
}

export function localePath(locale: Locale): string {
  return locale === "tr" ? "/" : `/${locale}`;
}
