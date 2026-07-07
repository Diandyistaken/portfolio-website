"use client";

import { ChevronDown, Download, FileText } from "lucide-react";
import { Dropdown } from "./Dropdown";
import { cvFiles } from "@/lib/data";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function CvDownload() {
  const { t } = useLanguage();

  return (
    <Dropdown
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-2 rounded-md border border-foreground/15 px-4 py-2 font-mono text-xs text-foreground transition-colors hover:border-foreground/30"
        >
          <Download size={14} />
          {t.hero.cvLabel}
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
            href={cvFiles.tr}
            download
            role="menuitem"
            onClick={close}
            className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:bg-foreground/5 focus-visible:text-foreground"
          >
            <FileText size={15} className="text-accent" />
            {t.hero.cvOptionTr}
          </a>
          <a
            href={cvFiles.en}
            download
            role="menuitem"
            onClick={close}
            className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm text-muted outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:bg-foreground/5 focus-visible:text-foreground"
          >
            <FileText size={15} className="text-accent" />
            {t.hero.cvOptionEn}
          </a>
        </div>
      )}
    </Dropdown>
  );
}
