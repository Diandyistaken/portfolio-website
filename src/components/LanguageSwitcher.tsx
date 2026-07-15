"use client";

import { Check, Globe } from "lucide-react";
import {
  locales,
  localeLabels,
  localeNames,
  useLanguage,
} from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/types";
import { Dropdown } from "./Dropdown";

// per-language signature colors used for the option dots
const localeColors: Record<Locale, string> = {
  tr: "#ef4444",
  en: "#38bdf8",
  de: "#f5c169",
};

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <Dropdown
      align="right"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label={t.common.languageSwitcher}
          className="tap-pop flex h-9 items-center gap-1.5 rounded-md px-2.5 font-mono text-xs text-foreground transition-colors hover:bg-foreground/5"
        >
          <Globe size={14} className={open ? "text-accent" : undefined} />
          {localeLabels[locale]}
        </button>
      )}
    >
      {(close) => (
        <>
          <p className="px-3 pb-1.5 pt-1 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted">
            {t.common.languageSwitcher}
          </p>
          {locales.map((l) => {
            const active = l === locale;
            return (
              <button
                key={l}
                type="button"
                role="menuitem"
                onClick={() => {
                  setLocale(l);
                  close();
                }}
                className={`tap-pop flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm outline-none transition-all duration-200 hover:translate-x-0.5 focus-visible:bg-foreground/5 ${
                  active
                    ? "bg-foreground/[0.06] text-foreground"
                    : "text-muted hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    background: localeColors[l],
                    boxShadow: active ? `0 0 10px ${localeColors[l]}` : undefined,
                  }}
                />
                <span className="flex-1">{localeNames[l]}</span>
                <span className="font-mono text-[0.65rem] tracking-[0.15em] text-muted">
                  {localeLabels[l]}
                </span>
                {active && <Check size={14} className="text-accent" />}
              </button>
            );
          })}
        </>
      )}
    </Dropdown>
  );
}
