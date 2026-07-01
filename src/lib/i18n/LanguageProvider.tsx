"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { tr } from "./tr";
import { en } from "./en";
import { de } from "./de";
import type { Content, Locale } from "./types";

export const locales: Locale[] = ["tr", "en", "de"];

export const localeLabels: Record<Locale, string> = {
  tr: "TR",
  en: "EN",
  de: "DE",
};

const dictionaries: Record<Locale, Content> = { tr, en, de };

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Content;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("tr");

  useEffect(() => {
    const stored = window.localStorage.getItem("lang");
    if (stored && locales.includes(stored as Locale)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored as Locale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = dictionaries[locale].meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", dictionaries[locale].meta.description);
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem("lang", next);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: dictionaries[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
