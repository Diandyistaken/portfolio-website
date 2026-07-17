"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useInView, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePerfLite } from "./SectionBackdrop";

type BrickState = "intact" | "cracked" | "gone";

/**
 * #40 Firewall brick-break: a row of ASCII "FW-0x" bricks above the day
 * divider. First click cracks a brick, second shatters it into particles;
 * break them all and the wall reports "FIREWALL BYPASSED". Replayable — the
 * parent rebuilds the wall after a beat.
 */
function FirewallBricks({ onAllDown }: { onAllDown: () => void }) {
  const [bricks, setBricks] = useState<BrickState[]>(() => Array(8).fill("intact"));

  const hit = (index: number) => {
    setBricks((prev) => {
      const next = [...prev];
      if (next[index] === "intact") next[index] = "cracked";
      else if (next[index] === "cracked") next[index] = "gone";
      if (next.every((state) => state === "gone")) onAllDown();
      return next;
    });
  };

  return (
    <div className="mb-4 flex justify-center gap-1" aria-hidden="true">
      {bricks.map((state, index) => (
        <span key={index} className="relative">
          <AnimatePresence>
            {state !== "gone" && (
              <m.button
                type="button"
                onClick={() => hit(index)}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{
                  opacity: state === "cracked" ? 0.5 : 1,
                  scale: 1,
                  x: state === "cracked" ? [0, -1, 1, 0] : 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`font-mono relative block rounded-[3px] border px-1.5 py-0.5 text-[0.5rem] tracking-wide transition-colors ${
                  state === "cracked"
                    ? "border-foreground/10 text-muted/60 line-through"
                    : "border-accent/30 text-accent/80 hover:border-accent/60"
                }`}
              >
                FW-{String(index + 1).padStart(2, "0")}
              </m.button>
            )}
          </AnimatePresence>
          {/* shatter particles fly out the moment a brick goes */}
          {state === "gone" &&
            [0, 1, 2, 3, 4].map((particle) => (
              <m.span
                key={particle}
                aria-hidden="true"
                initial={{ opacity: 1, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  x: (particle - 2) * 9,
                  y: (particle % 2 === 0 ? -1 : 1) * (8 + particle * 3),
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-accent"
              />
            ))}
        </span>
      ))}
    </div>
  );
}

/**
 * Section-break "breather" between major sections: a framed terminal chip
 * floating over a faded dot-grid with flanking accent hairlines. The command
 * types itself out when scrolled into view and happily retypes on hover —
 * a small toy, not just a label.
 */
export function GenerativeDivider({ quoteId }: { quoteId: "day" | "sunset" }) {
  const { t } = useLanguage();
  const baseText = t.dividers[quoteId];
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const instant = reducedMotion || perfLite;

  // #40 firewall: only the "day" divider carries the breakable wall.
  const hasWall = quoteId === "day" && !instant;
  const [bypassed, setBypassed] = useState(false);
  const [wallKey, setWallKey] = useState(0);
  const bypassTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (bypassTimer.current) clearTimeout(bypassTimer.current);
    };
  }, []);
  const onAllDown = () => {
    setBypassed(true);
    if (bypassTimer.current) clearTimeout(bypassTimer.current);
    bypassTimer.current = setTimeout(() => {
      setBypassed(false);
      setWallKey((key) => key + 1);
    }, 10000);
  };

  const text = bypassed ? t.dividers.bypass : baseText;

  // `instant` derives the fully-typed state at render time — the effect only
  // drives the animated path.
  const [typedChars, setTypedChars] = useState(0);
  const [run, setRun] = useState(0);
  const typing = useRef(false);
  // when bypassed, show the whole line at once (it's a payoff, not a tease)
  const chars = instant || bypassed ? text.length : typedChars;

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

      <div className="relative flex flex-col items-center px-6">
        {hasWall && (
          <FirewallBricks key={wallKey} onAllDown={onAllDown} />
        )}
        <div className="flex items-center gap-4 sm:gap-5">
        <span
          className="hidden h-px w-12 bg-gradient-to-r from-transparent to-accent/40 sm:block lg:w-20"
          aria-hidden="true"
        />

        <div
          onMouseEnter={retype}
          data-prox data-prox-radius="220" className="terminal-panel prox-heat flex items-center gap-3 rounded-full border border-foreground/10 px-4 py-2 shadow-[0_10px_36px_rgb(0_0_0/0.4)] sm:px-5 sm:py-2.5"
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
      </div>
    </section>
  );
}
