"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ArrowDownToLine, ArrowRight, Copy, Search, X } from "lucide-react";
import { cvFiles } from "@/lib/data";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

type PaletteItem = {
  id: string;
  label: string;
  group: "navigation" | "actions";
  icon: typeof ArrowRight;
  run: () => void | Promise<void>;
};

export function CommandPalette({ open, onOpenChange, triggerRef }: CommandPaletteProps) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const items = useMemo<PaletteItem[]>(() => {
    const sections = [
      ["about", t.nav.about], ["skills", t.nav.skills], ["services", t.nav.services],
      ["experience", t.nav.experience], ["education", t.nav.education], ["projects", t.nav.projects],
      ["showcase", t.nav.showcase], ["goals", t.nav.goals], ["contact", t.nav.contact],
    ];
    return [
      ...sections.map(([id, label]) => ({
        id, label, group: "navigation" as const, icon: ArrowRight,
        run: () => document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }),
      })),
      { id: "download-cv", label: t.commandPalette.downloadCv, group: "actions", icon: ArrowDownToLine, run: () => {
        const link = document.createElement("a"); link.href = cvFiles.tr; link.download = "Muhammed-Maksut-Cakmaktas-CV-TR.pdf"; link.click();
      } },
      { id: "copy-email", label: copied ? t.commandPalette.emailCopied : t.commandPalette.copyEmail, group: "actions", icon: Copy, run: async () => {
        await navigator.clipboard.writeText(t.personalInfo.email); setCopied(true);
      } },
    ];
  }, [copied, reduceMotion, t]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr");
    return needle ? items.filter((item) => item.label.toLocaleLowerCase("tr").includes(needle)) : items;
  }, [items, query]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());
    // ESC must close the palette even when focus has left the search input
    const onDocKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setQuery(""); setCopied(false); onOpenChange(false); }
    };
    document.addEventListener("keydown", onDocKeyDown);
    return () => { document.removeEventListener("keydown", onDocKeyDown); document.body.style.overflow = previousOverflow; trigger?.focus(); };
  }, [open, triggerRef, onOpenChange]);

  const close = () => { setQuery(""); setCopied(false); onOpenChange(false); };
  const select = async (item: PaletteItem) => { await item.run(); if (item.id !== "copy-email") close(); };

  return (
    <AnimatePresence>
      {open && (
        <m.div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[14vh] sm:pt-[18vh]" role="presentation">
          <m.button aria-label={t.commandPalette.closeLabel} className="absolute inset-0 bg-[#02040a]/75 backdrop-blur-sm" onClick={close}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <m.div role="dialog" aria-modal="true" aria-label={t.commandPalette.openLabel}
            initial={reduceMotion ? false : { opacity: 0, y: -14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }} className="surface relative w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-[#090d16]/95 shadow-[0_28px_100px_rgb(0_0_0/0.6)]">
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search size={17} className="shrink-0 text-muted" />
              <input ref={inputRef} value={query} onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }} placeholder={t.commandPalette.placeholder}
                aria-controls="command-palette-list" aria-activedescendant={filtered[activeIndex]?.id ? `command-${filtered[activeIndex].id}` : undefined}
                onKeyDown={(e) => {
                  if (e.key === "Escape") close();
                  if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => filtered.length ? (i + 1) % filtered.length : 0); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => filtered.length ? (i - 1 + filtered.length) % filtered.length : 0); }
                  if (e.key === "Enter" && filtered[activeIndex]) { e.preventDefault(); void select(filtered[activeIndex]); }
                }}
                className="h-14 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted/60" />
              <button type="button" onClick={close} aria-label={t.commandPalette.closeLabel} className="rounded p-1 text-muted hover:text-foreground"><X size={16} /></button>
            </div>
            <div id="command-palette-list" role="listbox" className="max-h-[min(25rem,55vh)] overflow-y-auto p-2">
              {filtered.length === 0 ? <p className="px-3 py-8 text-center text-sm text-muted">{t.commandPalette.emptyLabel}</p> : filtered.map((item, index) => {
                const Icon = item.icon; const firstInGroup = index === 0 || filtered[index - 1].group !== item.group;
                return <div key={item.id}>
                  {firstInGroup && <p className="px-3 pb-1 pt-3 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted/60">{item.group === "navigation" ? t.commandPalette.navigationLabel : t.commandPalette.actionsLabel}</p>}
                  <button id={`command-${item.id}`} role="option" aria-selected={index === activeIndex} onMouseEnter={() => setActiveIndex(index)} onClick={() => void select(item)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${index === activeIndex ? "bg-accent/12 text-foreground" : "text-muted hover:text-foreground"}`}>
                    <Icon size={15} className={index === activeIndex ? "text-accent" : ""} /><span>{item.label}</span>
                  </button>
                </div>;
              })}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
