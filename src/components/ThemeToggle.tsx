"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t.common.themeToLight : t.common.themeToDark}
      className="flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-foreground/5"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
