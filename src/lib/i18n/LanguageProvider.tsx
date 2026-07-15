"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { tr } from "./tr";
import type { Content, Locale } from "./types";

export const locales: Locale[] = ["tr", "en", "de"];

export const localeLabels: Record<Locale, string> = {
  tr: "TR",
  en: "EN",
  de: "DE",
};

export const localeNames: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
};

// tr is unprefixed ("/"), en/de live at "/en" and "/de" — each is server
// rendered with the right locale (see app/[[...locale]]/layout.tsx), so
// this client-side loader only runs for the instant-feedback swap while a
// navigation to the new locale path is in flight.
const loadDictionary = (locale: Locale): Promise<Content> => {
  switch (locale) {
    case "en":
      return import("./en").then((mod) => mod.en);
    case "de":
      return import("./de").then((mod) => mod.de);
    default:
      return Promise.resolve(tr);
  }
};

export function localePath(locale: Locale): string {
  return locale === "tr" ? "/" : `/${locale}`;
}

// localStorage can throw (Safari private mode, cookies disabled by policy) —
// a language preference is a nice-to-have, never worth crashing the page.
function readStoredLocale(): Locale | null {
  try {
    const stored = window.localStorage.getItem("lang");
    return stored && locales.includes(stored as Locale) ? (stored as Locale) : null;
  } catch {
    return null;
  }
}

function writeStoredLocale(locale: Locale) {
  try {
    window.localStorage.setItem("lang", locale);
  } catch {
    // best-effort only
  }
}

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Content;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

type LanguageProviderProps = {
  children: ReactNode;
  initialLocale?: Locale;
  initialDict?: Content;
};

export function LanguageProvider({
  children,
  initialLocale = "tr",
  initialDict,
}: LanguageProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [dict, setDict] = useState<Content>(initialDict ?? tr);
  const requestRef = useRef<Locale>(initialLocale);

  // Keep in sync when the route's locale changes from outside setLocale
  // (browser back/forward, a direct link) — adjusted during render (React's
  // documented pattern for this) instead of an effect, to avoid an extra
  // cascading render pass.
  const [prevInitialLocale, setPrevInitialLocale] = useState(initialLocale);
  if (initialLocale !== prevInitialLocale) {
    setPrevInitialLocale(initialLocale);
    setLocaleState(initialLocale);
  }

  // A stored preference from an earlier visit should win, but as a real
  // navigation to the matching locale path — not a silent text swap — so
  // the URL stays the source of truth for search engines and sharing.
  useEffect(() => {
    const stored = readStoredLocale();
    if (stored && stored !== initialLocale) {
      router.replace(`${localePath(stored)}${window.location.hash}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    requestRef.current = locale;
    if (locale === initialLocale && initialDict) return; // SSR already has it
    loadDictionary(locale).then((d) => {
      // ignore stale loads if the user switched again mid-flight
      if (requestRef.current === locale) setDict(d);
    });
  }, [locale, initialLocale, initialDict]);

  useEffect(() => {
    document.documentElement.lang = dict.htmlLang;
    document.title = dict.meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", dict.meta.description);
  }, [dict]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    writeStoredLocale(next);
    router.push(`${localePath(next)}${window.location.hash}`);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: dict }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
