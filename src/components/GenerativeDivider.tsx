"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePerfLite } from "./SectionBackdrop";

/**
 * Section-break "breather" between major sections: a framed terminal chip
 * floating over a faded dot-grid with flanking accent hairlines. The command
 * types itself out when scrolled into view and happily retypes on hover —
 * a small toy, not just a label.
 */
export function GenerativeDivider({ quoteId }: { quoteId: "day" | "sunset" }) {
  const { t } = useLanguage();
  const text = t.dividers[quoteId];
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const instant = reducedMotion || perfLite;

  // `instant` derives the fully-typed state at render time — the effect only
  // drives the animated path.
  const [typedChars, setTypedChars] = useState(0);
  const [run, setRun] = useState(0);
  const typing = useRef(false);
  const chars = instant ? text.length : typedChars;

  useEffect(() => {
    if (instant || !inView) return;

    typing.current = true;
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setTypedChars(index);
      if (index >= text.length) {
        typing.current = false;
        clearInterval(timer);
      }
    }, 34);
    return () => clearInterval(timer);
  }, [inView, instant, text, run]);

  const retype = () => {
    if (instant || typing.current) return;
    setTypedChars(0);
    setRun((n) => n + 1);
  };

  return (
    <section
      ref={ref}
      className="relative flex w-full items-center justify-center overflow-hidden bg-background py-20 sm:py-24 3xl:py-28"
    >
      <div className="divider-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(48% 80% at 50% 50%, rgb(var(--accent-rgb) / 0.12), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-center gap-4 px-6 sm:gap-5">
        <span
          className="hidden h-px w-12 bg-gradient-to-r from-transparent to-accent/40 sm:block lg:w-20"
          aria-hidden="true"
        />

        <div
          onMouseEnter={retype}
          className="terminal-panel flex items-center gap-3 rounded-full border border-foreground/10 px-4 py-2 shadow-[0_10px_36px_rgb(0_0_0/0.4)] sm:px-5 sm:py-2.5"
        >
          <span className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-foreground/20" />
            <span className="h-2 w-2 rounded-full bg-foreground/20" />
            <span className="h-2 w-2 rounded-full bg-accent/70" />
          </span>
          <p className="font-mono text-xs tracking-wide text-accent sm:text-sm">
            <span className="sr-only">{text}</span>
            <span aria-hidden="true">{text.slice(0, chars)}</span>
            <span className="ops-cursor ml-0.5 inline-block" aria-hidden="true">
              ▊
            </span>
          </p>
        </div>

        <span
          className="hidden h-px w-12 bg-gradient-to-l from-transparent to-accent/40 sm:block lg:w-20"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
