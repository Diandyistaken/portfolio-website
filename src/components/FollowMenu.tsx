"use client";

import { motion } from "framer-motion";
import { ChevronDown, UserPlus } from "lucide-react";
import { Dropdown } from "./Dropdown";
import { LinkedinIcon, InstagramIcon } from "./icons";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function FollowMenu() {
  const { t } = useLanguage();

  return (
    <Dropdown
      trigger={({ toggle, open }) => (
        <motion.button
          type="button"
          onClick={toggle}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="glass flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground transition-shadow hover:shadow-[0_0_20px_rgb(var(--surface-border)/0.12)]"
        >
          <UserPlus size={15} />
          {t.hero.followLabel}
          <ChevronDown
            size={14}
            className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </motion.button>
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
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted outline-none transition-colors hover:bg-white/5 hover:text-foreground focus-visible:bg-white/5 focus-visible:text-foreground"
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
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted outline-none transition-colors hover:bg-white/5 hover:text-foreground focus-visible:bg-white/5 focus-visible:text-foreground"
          >
            <InstagramIcon className="h-4 w-4 text-accent-2" />
            {t.hero.followInstagram}
          </a>
        </div>
      )}
    </Dropdown>
  );
}
