"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Award } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const STORAGE_KEY = "mm-achievements-v1";
const TOAST_MS = 4200;

export type AchievementId =
  | "robot-friend"
  | "white-hat"
  | "shell-runner"
  | "explorer"
  | "first-contact"
  | "status-dj"
  | "honeypot"
  | "chatterbox"
  | "speedrunner"
  | "cryptanalyst"
  | "keymaster"
  | "sentry";

/** Event → achievement wiring. Components dispatch, this component listens. */
const EVENT_MAP: Record<string, AchievementId> = {
  "app:robot-click": "robot-friend",
  "app:hack-egg": "white-hat",
  "app:email-copied": "first-contact",
  "app:honeypot": "honeypot",
  // #104 expansion: the parti-12 discovery layer
  "app:speedrun-done": "speedrunner",
  "app:cipher-solved": "cryptanalyst",
  "app:vault-open": "keymaster",
  "app:sentry-win": "sentry",
};

/** Counted events: unlock after N occurrences. */
const COUNTED: Record<string, { id: AchievementId; count: number }> = {
  "app:terminal-extra": { id: "shell-runner", count: 3 },
  "app:status-cycled": { id: "status-dj", count: 5 },
  "app:robot-chat": { id: "chatterbox", count: 5 },
};

function loadUnlocked(): Set<AchievementId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as AchievementId[]) : []);
  } catch {
    return new Set();
  }
}

/**
 * Quiet achievement system: exploring the site's toys unlocks mono badge
 * toasts ("BAŞARIM AÇILDI — Beyaz Şapka · 2/6"). Persisted in localStorage,
 * so returning visitors keep their collection. No accounts, no tracking —
 * just a reason to poke at everything.
 */
export function Achievements() {
  const { t } = useLanguage();
  const [toast, setToast] = useState<AchievementId | null>(null);
  const [unlockedCount, setUnlockedCount] = useState(0);
  // #104: the list panel needs the concrete ids (locked ones render ██████)
  const [unlockedIds, setUnlockedIds] = useState<AchievementId[]>([]);
  const [listOpen, setListOpen] = useState(false);
  const unlockedRef = useRef<Set<AchievementId> | null>(null);
  const countsRef = useRef<Record<string, number>>({});
  const queueRef = useRef<AchievementId[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalCount = t.achievements.items.length;

  useEffect(() => {
    unlockedRef.current = loadUnlocked();
    const seedRaf = requestAnimationFrame(() => {
      const unlocked = unlockedRef.current;
      if (!unlocked) return;
      setUnlockedCount(unlocked.size);
      setUnlockedIds([...unlocked]);
    });

    const showNext = () => {
      const next = queueRef.current.shift();
      if (!next) return;
      setToast(next);
      timerRef.current = setTimeout(() => {
        setToast(null);
        timerRef.current = setTimeout(showNext, 350);
      }, TOAST_MS);
    };

    const unlock = (id: AchievementId) => {
      const unlocked = unlockedRef.current;
      if (!unlocked || unlocked.has(id)) return;
      unlocked.add(id);
      setUnlockedCount(unlocked.size);
      setUnlockedIds([...unlocked]);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
      } catch {
        // storage may be unavailable (private mode) — toasts still work
      }
      queueRef.current.push(id);
      window.dispatchEvent(new Event("app:achievement-unlocked"));
      if (!timerRef.current) showNext();
    };

    const handlers: [string, () => void][] = [];
    for (const [event, id] of Object.entries(EVENT_MAP)) {
      const handler = () => unlock(id);
      window.addEventListener(event, handler);
      handlers.push([event, handler]);
    }
    for (const [event, rule] of Object.entries(COUNTED)) {
      const handler = () => {
        countsRef.current[event] = (countsRef.current[event] ?? 0) + 1;
        if (countsRef.current[event] >= rule.count) unlock(rule.id);
      };
      window.addEventListener(event, handler);
      handlers.push([event, handler]);
    }

    // "explorer": every section seen at least once this visit
    const sections = document.querySelectorAll<HTMLElement>("main section[id]");
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          seen.add((entry.target as HTMLElement).id);
          if (seen.size >= sections.length && sections.length > 0) {
            unlock("explorer");
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    sections.forEach((section) => observer.observe(section));

    return () => {
      cancelAnimationFrame(seedRaf);
      handlers.forEach(([event, handler]) => window.removeEventListener(event, handler));
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const item = toast ? t.achievements.items.find((entry) => entry.id === toast) : null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-50" aria-live="polite">
      {/* #104 list panel: unlocked titles readable, locked ones redacted */}
      <AnimatePresence>
        {listOpen && (
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="achievement-chip pointer-events-auto mb-2 w-72 rounded-lg p-4"
          >
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-accent">
              {t.achievements.listTitle} · {unlockedCount}/{totalCount}
            </p>
            <ul className="mt-2 space-y-1.5 font-mono text-[0.68rem]">
              {t.achievements.items.map((entry) => {
                const unlocked = unlockedIds.includes(entry.id as AchievementId);
                return (
                  <li key={entry.id} className={unlocked ? "text-foreground/90" : "text-muted/50"}>
                    <span className={`mr-1.5 ${unlocked ? "text-accent" : ""}`}>{unlocked ? "◆" : "◇"}</span>
                    {unlocked ? entry.title : "██████████████"}
                  </li>
                );
              })}
            </ul>
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {item && (
          <m.div
            key={item.id}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="achievement-chip mb-2 flex items-center gap-3 rounded-lg px-4 py-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-accent/40 text-accent">
              <Award size={16} />
            </span>
            <span className="font-mono">
              <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-accent">
                {t.achievements.unlocked} · {unlockedCount}/{totalCount}
              </span>
              <span className="mt-0.5 block text-sm text-foreground">{item.title}</span>
            </span>
          </m.div>
        )}
      </AnimatePresence>

      {/* #104 persistent HUD chip — opens the list */}
      {unlockedCount > 0 && (
        <button
          type="button"
          onClick={() => setListOpen((value) => !value)}
          aria-expanded={listOpen}
          aria-label={t.achievements.listTitle}
          className="pointer-events-auto hidden items-center gap-1.5 rounded-full border border-foreground/15 bg-background/85 px-2.5 py-1 font-mono text-[0.6rem] text-muted transition-colors hover:border-accent/50 hover:text-foreground lg:flex"
        >
          <Award size={10} className="text-accent" /> {unlockedCount}/{totalCount}
        </button>
      )}
    </div>
  );
}
