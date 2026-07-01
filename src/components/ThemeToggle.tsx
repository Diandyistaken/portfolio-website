"use client";

import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === "dark";

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isDark ? t.common.themeToLight : t.common.themeToDark}
      className="relative flex h-10 w-10 items-center justify-center rounded-full glass text-foreground transition-shadow hover:shadow-[0_0_20px_rgb(var(--surface-border)/0.15)]"
    >
      <motion.span
        key={theme}
        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </motion.span>
    </motion.button>
  );
}
