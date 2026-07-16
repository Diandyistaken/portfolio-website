"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePerfLite } from "./SectionBackdrop";

type LogLine = { id: number; text: string };

const MAX_LINES = 3;
const IDLE_MS = 15000;

function stamp() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

/**
 * Live syslog strip above the footer: a tail -f of what the visitor is
 * actually doing — section changes, robot pokes, easter eggs, scroll bursts,
 * idle silence. Machine-log English on purpose (it's a terminal artifact);
 * the label is localized. Makes the site feel like it's genuinely watching.
 */
export function SysLog() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [lines, setLines] = useState<LogLine[]>([]);
  const idRef = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const push = (text: string) => {
      idRef.current += 1;
      const id = idRef.current;
      setLines((previous) => [...previous.slice(-(MAX_LINES - 1)), { id, text: `${stamp()} ${text}` }]);
    };

    const armIdle = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => push("[idle] 15s of silence — all quiet on the wire"), IDLE_MS);
    };

    const events: [string, string][] = [
      ["app:robot-click", "[robot] interaction ack — morale +1"],
      ["app:hack-egg", "[sec] intrusion simulation triggered by visitor"],
      ["app:honeypot", "[sec] honeypot tripped — profiling visitor…"],
      ["app:email-copied", "[contact] email copied to clipboard"],
      ["app:terminal-extra", "[shell] bonus command executed"],
      ["app:status-cycled", "[status] hero badge cycled"],
    ];
    const handlers: [string, () => void][] = events.map(([event, text]) => {
      const handler = () => {
        push(text);
        armIdle();
      };
      window.addEventListener(event, handler);
      return [event, handler];
    });

    // section transitions
    const sections = document.querySelectorAll<HTMLElement>("main section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            push(`[nav] section=${(entry.target as HTMLElement).id}`);
            armIdle();
          }
        }
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));

    // scroll bursts (throttled: report at most once per 2.5s)
    let lastY = window.scrollY;
    let lastT = performance.now();
    let lastReport = 0;
    const onScroll = () => {
      const now = performance.now();
      const dt = now - lastT;
      if (dt < 80) return;
      const velocity = Math.abs(window.scrollY - lastY) / (dt / 1000);
      lastY = window.scrollY;
      lastT = now;
      if (velocity > 2600 && now - lastReport > 2500) {
        lastReport = now;
        push(`[scroll] velocity=${Math.round(velocity)}px/s — slow down, turbo`);
      }
      armIdle();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    armIdle();
    return () => {
      handlers.forEach(([event, handler]) => window.removeEventListener(event, handler));
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  if (perfLite) return null;

  return (
    <div className="border-t border-foreground/10 bg-[rgb(var(--surface)/0.5)] px-6 py-2.5 sm:px-10 3xl:px-16">
      <div className="mx-auto flex w-full max-w-6xl items-start gap-3 3xl:max-w-[100rem]">
        <span className="mt-0.5 flex shrink-0 items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-accent/80">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent/80" />
          </span>
          {t.syslog.label}
        </span>
        <div className="min-h-[1.1rem] flex-1 overflow-hidden font-mono text-[0.65rem] leading-relaxed text-muted">
          <AnimatePresence initial={false} mode="popLayout">
            {lines.slice(-1).map((line) => (
              <m.p
                key={line.id}
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="truncate"
              >
                {line.text}
                <span className="ops-cursor ml-0.5 inline-block text-accent/70" aria-hidden="true">▊</span>
              </m.p>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
