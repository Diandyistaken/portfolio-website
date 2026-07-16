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
  | "status-dj";

/** Event → achievement wiring. Components dispatch, this component listens. */
const EVENT_MAP: Record<string, AchievementId> = {
  "app:robot-click": "robot-friend",
  "app:hack-egg": "white-hat",
  "app:email-copied": "first-contact",
};

/** Counted events: unlock after N occurrences. */
const COUNTED: Record<string, { id: AchievementId; count: number }> = {
  "app:terminal-extra": { id: "shell-runner", count: 3 },
  "app:status-cycled": { id: "status-dj", count: 5 },
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
  const unlockedRef = useRef<Set<AchievementId> | null>(null);
  const countsRef = useRef<Record<string, number>>({});
  const queueRef = useRef<AchievementId[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalCount = t.achievements.items.length;

  useEffect(() => {
    unlockedRef.current = loadUnlocked();

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
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
      } catch {
        // storage may be unavailable (private mode) — toasts still work
      }
      queueRef.current.push(id);
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
      handlers.forEach(([event, handler]) => window.removeEventListener(event, handler));
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const item = toast ? t.achievements.items.find((entry) => entry.id === toast) : null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-50" aria-live="polite">
      <AnimatePresence>
        {item && (
          <m.div
            key={item.id}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="achievement-chip flex items-center gap-3 rounded-lg px-4 py-3"
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
    </div>
  );
}
