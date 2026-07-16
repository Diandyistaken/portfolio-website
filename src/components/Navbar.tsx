"use client";

import { useEffect, useId, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, m } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CONTAINER } from "@/lib/layout";

// Overlay only opens on demand (⌘K or the trigger button): no reason to ship
// it in the initial bundle.
const CommandPalette = dynamic(() => import("./CommandPalette").then((mod) => mod.CommandPalette), { ssr: false });

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Only mount the palette (and fetch its chunk) once the visitor has
  // actually opened it once — keeps it out of the initial JS entirely.
  const [paletteEverOpened, setPaletteEverOpened] = useState(false);
  const paletteTriggerRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();
  const mobileMenuId = useId();

  const navLinks = [
    { label: t.nav.about, href: "#about" },
    { label: t.nav.skills, href: "#skills" },
    { label: t.nav.services, href: "#services" },
    { label: t.nav.experience, href: "#experience" },
    { label: t.nav.education, href: "#education" },
    { label: t.nav.projects, href: "#projects" },
    { label: t.nav.showcase, href: "#showcase" },
    { label: t.nav.freelance, href: "#freelance" },
    { label: t.nav.goals, href: "#goals" },
    { label: t.nav.contact, href: "#contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase("tr") === "k") {
        event.preventDefault();
        setPaletteEverOpened(true);
        setPaletteOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
            ? "border-white/10 bg-[rgb(var(--background-rgb)/0.65)] backdrop-blur-md"
          : "border-transparent"
      }`}
    >
      <nav className={`${CONTAINER} flex items-center justify-between px-6 py-4 sm:px-10 3xl:px-16`}>
        <a href="#top" aria-label="Home" className="flex items-center gap-2.5 text-foreground">
          <Logo className="h-7 w-7" />
          <span className="font-mono text-xs tracking-[0.1em] text-muted">MMÇ</span>
        </a>

        <ul className="hidden items-center gap-5 font-mono text-xs uppercase tracking-[0.08em] text-muted lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="nav-link transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <button
            ref={paletteTriggerRef}
            type="button"
            onClick={() => {
              setPaletteEverOpened(true);
              setPaletteOpen(true);
            }}
            aria-label={t.commandPalette.openLabel}
            aria-haspopup="dialog"
            className="hidden h-8 items-center rounded-md border border-foreground/10 px-2 font-mono text-[0.65rem] text-muted transition-colors hover:border-accent/40 hover:text-foreground md:flex"
          >
            ⌘K
          </button>
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t.common.closeMenu : t.common.openMenu}
            aria-expanded={open}
            aria-controls={mobileMenuId}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-foreground/10 text-foreground lg:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
            id={mobileMenuId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden border-b border-white/10 bg-[rgb(var(--background-rgb)/0.9)] backdrop-blur-md lg:hidden"
          >
            <ul className={`${CONTAINER} flex flex-col gap-1 px-6 py-3 font-mono text-sm uppercase tracking-[0.06em] sm:px-10`}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-2 py-2.5 text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </m.div>
        )}
      </AnimatePresence>
      {paletteEverOpened && (
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} triggerRef={paletteTriggerRef} />
      )}
    </header>
  );
}
