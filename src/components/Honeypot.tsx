"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePerfLite } from "./SectionBackdrop";

const LINE_MS = 650;
const CLOSE_MS = 5600;

function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("OPR/")) return "Opera";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Safari/")) return "Safari";
  return "bilinmeyen ajan";
}

/**
 * The honeypot: a mono "[ DO NOT CLICK — ADMIN ONLY ]" button in the footer.
 * Clicking it triggers a mock intrusion skit — screen-edge alarm frame, a
 * typed "profiling" log of the visitor (browser, viewport, click count),
 * then a deadpan all-clear. Repeat offenders get a drier log line. Also
 * tips off the robot and unlocks an achievement.
 */
export function Honeypot() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [lines, setLines] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const clicksRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timersRef.current.forEach((timer) => clearTimeout(timer));
  }, []);

  const close = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
    setOpen(false);
    setLines([]);
  };

  const trip = () => {
    clicksRef.current += 1;
    window.dispatchEvent(new Event("app:honeypot"));

    const profile = t.honeypot.profile
      .replace("{browser}", detectBrowser())
      .replace("{viewport}", `${window.innerWidth}×${window.innerHeight}`)
      .replace("{clicks}", String(clicksRef.current));
    const script =
      clicksRef.current > 1
        ? [t.honeypot.again, profile, t.honeypot.closed]
        : [t.honeypot.intro, profile, t.honeypot.verdict, t.honeypot.closed];

    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
    setOpen(true);

    if (reducedMotion || perfLite) {
      setLines(script);
    } else {
      setLines([]);
      script.forEach((line, index) => {
        timersRef.current.push(
          setTimeout(() => setLines((previous) => [...previous, line]), 350 + index * LINE_MS),
        );
      });
    }
    timersRef.current.push(setTimeout(close, CLOSE_MS));
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={trip}
        className="tap-pop group inline-flex items-center gap-2 rounded-md border border-foreground/15 px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.14em] text-muted transition-colors hover:border-accent/60 hover:text-accent"
      >
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70 opacity-60 group-hover:opacity-100" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent/80" />
        </span>
        {t.honeypot.button}
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80]"
            onClick={close}
          >
            {/* alarm frame around the viewport */}
            <m.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.4, 1, 0.6] }}
              transition={{ duration: 1.6 }}
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: "inset 0 0 0 2px rgb(var(--accent-rgb) / 0.7), inset 0 0 60px rgb(var(--accent-rgb) / 0.15)" }}
            />
            <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" aria-hidden="true" />

            <div className="absolute left-1/2 top-1/2 w-[min(92vw,30rem)] -translate-x-1/2 -translate-y-1/2">
              <m.div
                initial={reducedMotion ? false : { scale: 0.92, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="terminal-panel rounded-xl border border-accent/40 p-5 shadow-[0_30px_90px_rgb(0_0_0/0.6)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center gap-2 border-b border-foreground/10 pb-3 text-accent">
                  <ShieldAlert size={15} aria-hidden="true" />
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em]">honeypot.log</span>
                </div>
                <div className="min-h-[7rem] pt-3 font-mono text-xs leading-relaxed sm:text-sm" aria-live="polite">
                  {lines.map((line, index) => (
                    <m.p
                      key={`${index}-${line}`}
                      initial={reducedMotion ? false : { opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={index === 0 ? "text-accent" : "mt-1.5 text-foreground/85"}
                    >
                      {line}
                    </m.p>
                  ))}
                  <span className="ops-cursor mt-1 inline-block text-accent" aria-hidden="true">▊</span>
                </div>
              </m.div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
