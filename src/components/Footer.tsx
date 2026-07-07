"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-foreground/10 px-6 py-6">
      <p className="font-mono mx-auto max-w-6xl text-xs text-muted">
        © {new Date().getFullYear()} {t.personalInfo.name}. {t.footer.rights}
      </p>
    </footer>
  );
}
