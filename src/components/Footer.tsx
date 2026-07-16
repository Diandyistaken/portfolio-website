"use client";

import { ArrowUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CONTAINER } from "@/lib/layout";

const FREELANCE_LINKS = [
  { label: "Freelancer", href: "https://www.freelancer.com/u/muhammedmaksut" },
  { label: "Upwork", href: "https://www.upwork.com/freelancers/~01221182b8c340bf9a" },
  { label: "Fiverr", href: "https://www.fiverr.com/diandy_" },
  { label: "Bionluk", href: "https://bionluk.com/muhammedmaksut" },
];

export function Footer() {
  const { t } = useLanguage();

  const navLinks = [
    { label: t.nav.about, href: "#about" },
    { label: t.nav.projects, href: "#projects" },
    { label: t.nav.contact, href: "#contact" },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-foreground/10 py-12 sm:py-16 3xl:py-20">
      <div
        className="footer-ecg pointer-events-none absolute inset-x-0 top-0 h-px"
        aria-hidden="true"
      />
      <div className={`${CONTAINER} grid grid-cols-1 gap-10 px-6 sm:px-10 md:grid-cols-3 3xl:px-16`}>
        <div>
          <p className="font-display text-lg font-medium">{t.personalInfo.name}</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{t.footer.tagline}</p>
        </div>

        <nav aria-label={t.nav.about} className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.1em] text-muted md:items-center">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-accent">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-2 font-mono text-[0.68rem] text-muted md:items-end">
          <span className="uppercase tracking-[0.12em] text-foreground/45">Freelance</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 md:justify-end">
            {FREELANCE_LINKS.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={`${CONTAINER} mt-10 flex flex-col items-center gap-4 border-t border-foreground/10 px-6 pt-6 sm:flex-row sm:justify-between sm:px-10 3xl:px-16`}>
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} {t.personalInfo.name}. {t.footer.rights}
        </p>
        <a
          href="#top"
          className="tap-pop group flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent"
        >
          {t.footer.backToTop}
          <ArrowUp
            size={13}
            className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:animate-bounce"
          />
        </a>
      </div>
    </footer>
  );
}
