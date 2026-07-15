"use client";

import { ChevronDown, UserPlus } from "lucide-react";
import { Dropdown } from "./Dropdown";
import { LinkedinIcon, InstagramIcon } from "./icons";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function FollowMenu() {
  const { t } = useLanguage();

  return (
    <Dropdown
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-2 rounded-md border border-foreground/15 px-4 py-2 font-mono text-xs text-foreground transition-colors hover:border-foreground/30"
        >
          <UserPlus size={14} />
          {t.hero.followLabel}
          <ChevronDown
            size={13}
            className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      )}
    >
      {(close) => (
        <div className="flex flex-col">
          <a
            href={t.personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={close}
            className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:bg-foreground/5 focus-visible:text-foreground"
          >
            <LinkedinIcon className="h-4 w-4 text-accent" />
            {t.hero.followLinkedin}
          </a>
          <a
            href={t.personalInfo.instagram}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={close}
            className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:bg-foreground/5 focus-visible:text-foreground"
          >
            <InstagramIcon className="h-4 w-4 text-accent" />
            {t.hero.followInstagram}
          </a>
          {[
            ["Freelancer", "F", "https://www.freelancer.com/u/muhammedmaksut"],
            ["Upwork", "Up", "https://www.upwork.com/freelancers/~01221182b8c340bf9a"],
            ["Fiverr", "fi", "https://www.fiverr.com/diandy_"],
            ["Bionluk", "b", "https://bionluk.com/muhammedmaksut"],
          ].map(([label, monogram, href]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={close}
              className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:bg-foreground/5 focus-visible:text-foreground"
            >
              <span className="grid h-4 w-4 place-items-center font-mono text-[0.55rem] font-semibold text-accent" aria-hidden="true">
                {monogram}
              </span>
              {label}
            </a>
          ))}
        </div>
      )}
    </Dropdown>
  );
}
