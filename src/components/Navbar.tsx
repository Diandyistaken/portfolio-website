"use client";

import { useEffect, useId, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAdmin } from "./AdminProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CONTAINER } from "@/lib/layout";
import { isPerfLite } from "@/lib/perfLite";
import { ping, setSonarEnabled } from "@/lib/sonar";
import { RecruiterMode } from "./RecruiterMode";

// Overlay only opens on demand (⌘K or the trigger button): no reason to ship
// it in the initial bundle.
const CommandPalette = dynamic(() => import("./CommandPalette").then((mod) => mod.CommandPalette), { ssr: false });

const SCRAMBLE_CHARS = "#$@%&<>/\\|=+*01";

/**
 * #88 WebAudio sonar toggle: an opt-in "AUDIO OFF/ON" chip in the navbar HUD.
 * While on, key interactions emit whisper-quiet synthesized blips — anchors
 * ping low, easter eggs ping twice, the honeypot gets a rising sweep. One
 * lazy AudioContext, localStorage persistence, no assets.
 */
function AudioToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem("mm-audio-v1") === "on";
        setOn(saved);
        setSonarEnabled(saved);
      } catch {
        // storage unavailable — stays off
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const onAnchor = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("a[href^='#']")) ping(320, 0.06, 0.016);
    };
    const onHack = () => {
      ping(600, 0.07, 0.02);
      timers.push(setTimeout(() => ping(780, 0.07, 0.02), 110));
    };
    const onHoneypot = () => ping(240, 0.5, 0.022, 980);
    const onCopied = () => ping(700, 0.09, 0.02);
    const onAchievement = () => {
      ping(520, 0.06, 0.016);
      timers.push(setTimeout(() => ping(880, 0.08, 0.016), 90));
    };
    document.addEventListener("click", onAnchor);
    window.addEventListener("app:hack-egg", onHack);
    window.addEventListener("app:honeypot", onHoneypot);
    window.addEventListener("app:email-copied", onCopied);
    window.addEventListener("app:achievement-unlocked", onAchievement);
    return () => {
      document.removeEventListener("click", onAnchor);
      window.removeEventListener("app:hack-egg", onHack);
      window.removeEventListener("app:honeypot", onHoneypot);
      window.removeEventListener("app:email-copied", onCopied);
      window.removeEventListener("app:achievement-unlocked", onAchievement);
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const toggle = () => {
    setOn((value) => {
      const next = !value;
      setSonarEnabled(next);
      try {
        localStorage.setItem("mm-audio-v1", next ? "on" : "off");
      } catch {
        // ignore
      }
      if (next) ping(520, 0.09, 0.03);
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label="AUDIO"
      className="hidden h-8 items-center rounded-md border border-foreground/10 px-2 font-mono text-[0.6rem] tracking-wide transition-colors hover:border-accent/40 md:flex"
    >
      {on ? <span className="text-accent">AUDIO ON</span> : <span className="text-muted">AUDIO OFF</span>}
    </button>
  );
}

/** Nav link that scrambles into glyphs and resolves back on hover. */
function ScrambleLink({ label, href, onNavigate }: { label: string; href: string; onNavigate: (href: string) => void }) {
  const [display, setDisplay] = useState(label);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reducedMotion = useReducedMotion();

  // Locale switch changes `label`: adjust state during render (React's
  // sanctioned reset pattern) instead of via an effect.
  const [previousLabel, setPreviousLabel] = useState(label);
  if (previousLabel !== label) {
    setPreviousLabel(label);
    setDisplay(label);
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const scramble = () => {
    if (reducedMotion || isPerfLite() || timer.current) return;
    let step = 0;
    const total = 9;
    timer.current = setInterval(() => {
      step += 1;
      const resolved = Math.floor((step / total) * label.length);
      setDisplay(
        Array.from(label, (char, i) =>
          i < resolved || char === " "
            ? char
            : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
        ).join(""),
      );
      if (step >= total) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setDisplay(label);
      }
    }, 32);
  };

  return (
    <a
      href={href}
      onMouseEnter={scramble}
      onClick={() => onNavigate(href)}
      data-prox
      data-prox-radius="130"
      className="nav-link transition-colors hover:text-foreground"
    >
      {display}
    </a>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Only mount the palette (and fetch its chunk) once the visitor has
  // actually opened it once — keeps it out of the initial JS entirely.
  const [paletteEverOpened, setPaletteEverOpened] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const paletteTriggerRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();
  const { isAdmin } = useAdmin();
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

  const activeLabel =
    activeSection === "classified"
      ? t.classified.kicker
      : navLinks.find((link) => link.href === `#${activeSection}`)?.label ?? null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section HUD: track which section owns the viewport so the logo's "MMÇ"
  // tag can morph into a live "> bölüm" readout while scrolling.
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("main section[id]");
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // One-shot radar ripple on the target section after anchor navigation.
  const pingSection = (href: string) => {
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    target.classList.remove("radar-ping");
    // restart the CSS animation even when re-pinging the same section
    void target.offsetWidth;
    target.classList.add("radar-ping");
    window.setTimeout(() => target.classList.remove("radar-ping"), 1300);
  };

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
          {/* Morphs from the monogram into a live section readout once a
              section owns the viewport — a tiny HUD, not just a logo. */}
          <span className="font-mono relative h-4 min-w-24 text-xs tracking-[0.1em] text-muted">
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={scrolled && activeLabel ? activeLabel : "brand"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.16 }}
                className="absolute inset-0 whitespace-nowrap"
              >
                {scrolled && activeLabel ? (
                  <>
                    <span className="text-accent">&gt;</span> {activeLabel.toLocaleLowerCase("tr")}
                  </>
                ) : (
                  "MMÇ"
                )}
              </m.span>
            </AnimatePresence>
          </span>
        </a>

        <ul className="hidden items-center gap-5 font-mono text-xs uppercase tracking-[0.08em] text-muted lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <ScrambleLink label={link.label} href={link.href} onNavigate={pingSection} />
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          {isAdmin ? (
            <Link
              href="/admin"
              className="mr-1 flex h-8 items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-2 font-mono text-[0.6rem] tracking-wide text-accent transition-colors hover:bg-accent/20"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
              <span className="hidden sm:inline">{t.admin.navChip} · MAKSUT</span>
              <span className="sm:hidden">{t.admin.navChip}</span>
            </Link>
          ) : (
            <Link
              href="/admin"
              className="mr-1 flex h-8 items-center gap-1.5 rounded-md border border-foreground/10 px-2 font-mono text-[0.6rem] uppercase tracking-wide text-muted transition-colors hover:border-accent/40 hover:text-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full border border-muted" aria-hidden="true" />
              {t.admin.loginCta}
            </Link>
          )}
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
          <AudioToggle />
          <RecruiterMode />
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
                    onClick={() => {
                      setOpen(false);
                      pingSection(link.href);
                    }}
                    className="block rounded-md px-2 py-2.5 text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="mt-1 border-t border-white/10 pt-2">
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-2 py-2.5 transition-colors ${
                    isAdmin ? "text-accent" : "text-muted hover:text-foreground"
                  }`}
                >
                  {isAdmin ? `● ${t.admin.navChip} · ${t.admin.panelCta}` : `○ ${t.admin.loginCta}`}
                </Link>
              </li>
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
