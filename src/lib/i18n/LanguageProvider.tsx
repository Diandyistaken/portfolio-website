"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

// tr ships in the main bundle (it's the SSR default); en/de are code-split
// and fetched only when the visitor actually switches language.
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

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Content;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");
  const [dict, setDict] = useState<Content>(tr);
  const requestRef = useRef<Locale>("tr");

  useEffect(() => {
    const stored = window.localStorage.getItem("lang");
    if (stored && locales.includes(stored as Locale)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored as Locale);
    }
  }, []);

  useEffect(() => {
    requestRef.current = locale;
    loadDictionary(locale).then((d) => {
      // ignore stale loads if the user switched again mid-flight
      if (requestRef.current === locale) setDict(d);
    });
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = dict.htmlLang;
    document.title = dict.meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", dict.meta.description);
  }, [dict]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem("lang", next);
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
