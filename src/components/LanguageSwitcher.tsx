"use client";

import { motion } from "framer-motion";
import { Check, Globe } from "lucide-react";
import { Dropdown } from "./Dropdown";
import { locales, localeLabels, useLanguage } from "@/lib/i18n/LanguageProvider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <Dropdown
      align="right"
      trigger={({ toggle }) => (
        <motion.button
          type="button"
          onClick={toggle}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label={t.common.languageSwitcher}
          className="relative flex h-10 items-center gap-1.5 rounded-full glass px-3 text-xs font-semibold text-foreground transition-shadow hover:shadow-[0_0_20px_rgb(var(--surface-border)/0.15)]"
        >
          <Globe size={15} />
          {localeLabels[locale]}
        </motion.button>
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
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-muted outline-none transition-colors hover:bg-white/5 hover:text-foreground focus-visible:bg-white/5 focus-visible:text-foreground"
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
