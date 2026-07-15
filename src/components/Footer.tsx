"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CONTAINER } from "@/lib/layout";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-foreground/10 py-6">
      <div className={`${CONTAINER} flex flex-col gap-4 px-6 sm:px-10 lg:flex-row lg:items-center lg:justify-between 3xl:px-16`}>
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} {t.personalInfo.name}. {t.footer.rights}
        </p>
        <nav aria-label="Freelance" className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.68rem] text-muted">
          <span className="uppercase tracking-[0.12em] text-foreground/45">Freelance</span>
          <a href="https://www.freelancer.com/u/muhammedmaksut" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">Freelancer</a>
          <a href="https://www.upwork.com/freelancers/~01221182b8c340bf9a" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">Upwork</a>
          <a href="https://www.fiverr.com/diandy_" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">Fiverr</a>
          <a href="https://bionluk.com/muhammedmaksut" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">Bionluk</a>
        </nav>
      </div>
    </footer>
  );
}
