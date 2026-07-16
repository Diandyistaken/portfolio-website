"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

/**
 * Fixed right-edge dot rail (desktop): one dot per section, the active one
 * glows and grows, hovering reveals a mono label chip, clicking jumps with
 * the same radar-ping used by the navbar. Scroll position, embodied.
 */
export function SectionRail() {
  const { t } = useLanguage();
  const [active, setActive] = useState<string | null>(null);

  const items = [
    { id: "about", label: t.nav.about },
    { id: "skills", label: t.nav.skills },
    { id: "services", label: t.nav.services },
    { id: "experience", label: t.nav.experience },
    { id: "education", label: t.nav.education },
    { id: "projects", label: t.nav.projects },
    { id: "classified", label: t.classified.kicker },
    { id: "showcase", label: t.nav.showcase },
    { id: "freelance", label: t.nav.freelance },
    { id: "goals", label: t.nav.goals },
    { id: "contact", label: t.nav.contact },
  ];

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("main section[id]");
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const ping = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.remove("radar-ping");
    void target.offsetWidth;
    target.classList.add("radar-ping");
    window.setTimeout(() => target.classList.remove("radar-ping"), 1300);
  };

  return (
    <nav
      aria-label={t.commandPalette.navigationLabel}
      className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <ul className="flex flex-col items-center gap-3">
        {items.map((item) => (
          <li key={item.id} className="group relative flex items-center">
            <a
              href={`#${item.id}`}
              onClick={() => ping(item.id)}
              aria-label={item.label}
              aria-current={active === item.id ? "true" : undefined}
              className="flex h-4 w-4 items-center justify-center"
            >
              <span className={`rail-dot ${active === item.id ? "rail-dot--active" : "group-hover:bg-foreground/50"}`} />
            </a>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-foreground/10 bg-[rgb(var(--surface)/0.95)] px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-foreground/85 opacity-0 transition-all duration-200 group-hover:-translate-x-1 group-hover:opacity-100"
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
