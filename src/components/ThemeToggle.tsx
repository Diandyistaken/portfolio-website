"use client";

import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { toggleTheme } from "@/lib/theme";

/**
 * Dark / light switch.
 *
 * Which icon shows is decided by CSS (`.light` on <html>), not React state:
 * the server already printed the right class, so the correct icon is painted
 * on the very first frame and never flips during hydration.
 *
 * The aria-label has to describe the ACTION, and the action depends on the
 * current theme, so both labels are rendered and CSS reveals one — a single
 * label driven by state would be wrong until hydration.
 */
export function ThemeToggle() {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      className="tap-pop group/theme relative flex h-8 w-8 items-center justify-center rounded-md border border-foreground/12 text-muted transition-colors hover:border-accent/45 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {/* dark theme active → offer light */}
      <span className="contents [.light_&]:hidden">
        <Sun size={14} aria-hidden="true" />
        <span className="sr-only">{t.common.themeToLight}</span>
      </span>
      {/* light theme active → offer dark */}
      <span className="hidden [.light_&]:contents">
        <Moon size={14} aria-hidden="true" />
        <span className="sr-only">{t.common.themeToDark}</span>
      </span>
    </button>
  );
}
