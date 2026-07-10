"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Check, Globe } from "lucide-react";
import {
  locales,
  localeLabels,
  localeNames,
  useLanguage,
} from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/types";

// per-language signature colors used for the option dots
const localeColors: Record<Locale, string> = {
  tr: "#ef4444",
  en: "#38bdf8",
  de: "#f5c169",
};

const panelVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const, staggerChildren: 0.05 },
  },
  exit: { opacity: 0, y: -6, scale: 0.96, transition: { duration: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const } },
};

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.common.languageSwitcher}
        aria-expanded={open}
        aria-controls={menuId}
        className="tap-pop flex h-9 items-center gap-1.5 rounded-md px-2.5 font-mono text-xs text-foreground transition-colors hover:bg-foreground/5"
      >
        <m.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex"
        >
          <Globe size={14} className={open ? "text-accent" : undefined} />
        </m.span>
        {localeLabels[locale]}
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            id={menuId}
            role="menu"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: "top right" }}
            className="surface absolute right-0 top-full z-50 mt-2 min-w-[12.5rem] overflow-hidden rounded-lg p-1.5"
          >
            <p className="px-3 pb-1.5 pt-1 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted">
              {t.common.languageSwitcher}
            </p>
            {locales.map((l) => {
              const active = l === locale;
              return (
                <m.button
                  key={l}
                  type="button"
                  role="menuitem"
                  variants={itemVariants}
                  onClick={() => {
                    setLocale(l);
                    setOpen(false);
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
                </m.button>
              );
            })}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
