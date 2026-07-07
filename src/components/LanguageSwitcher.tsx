"use client";

import { Check, Globe } from "lucide-react";
import { Dropdown } from "./Dropdown";
import { locales, localeLabels, useLanguage } from "@/lib/i18n/LanguageProvider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <Dropdown
      align="right"
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label={t.common.languageSwitcher}
          className="flex h-9 items-center gap-1.5 rounded-md px-2.5 font-mono text-xs text-foreground transition-colors hover:bg-foreground/5"
        >
          <Globe size={14} />
          {localeLabels[locale]}
        </button>
      )}
    >
      {(close) => (
        <div className="flex flex-col">
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitem"
              onClick={() => {
                setLocale(l);
                close();
              }}
              className="flex items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm text-muted outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:bg-foreground/5 focus-visible:text-foreground"
            >
              {localeLabels[l]}
              {l === locale && <Check size={14} className="text-accent" />}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  );
}
