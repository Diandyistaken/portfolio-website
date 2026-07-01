"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="px-6 pb-10 pt-6 text-center text-xs text-muted">
      <p>
        © {new Date().getFullYear()} {t.personalInfo.name}. {t.footer.rights}
      </p>
    </footer>
  );
}
