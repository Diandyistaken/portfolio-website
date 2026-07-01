"use client";

import { motion } from "framer-motion";
import { ChevronDown, Download, FileText } from "lucide-react";
import { Dropdown } from "./Dropdown";
import { cvFiles } from "@/lib/data";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function CvDownload() {
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
          <Download size={15} />
          {t.hero.cvLabel}
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
            href={cvFiles.tr}
            download
            role="menuitem"
            onClick={close}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted outline-none transition-colors hover:bg-white/5 hover:text-foreground focus-visible:bg-white/5 focus-visible:text-foreground"
          >
            <FileText size={15} className="text-accent" />
            {t.hero.cvOptionTr}
          </a>
          <a
            href={cvFiles.en}
            download
            role="menuitem"
            onClick={close}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted outline-none transition-colors hover:bg-white/5 hover:text-foreground focus-visible:bg-white/5 focus-visible:text-foreground"
          >
            <FileText size={15} className="text-accent-2" />
            {t.hero.cvOptionEn}
          </a>
        </div>
      )}
    </Dropdown>
  );
}
