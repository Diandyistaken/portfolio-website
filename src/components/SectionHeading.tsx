"use client";

import { useEffect, useRef, useState } from "react";
import {
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { Reveal } from "./Reveal";
import { DecryptText } from "./DecryptText";
import { usePerfLite } from "./SectionBackdrop";

const GLYPHS = "#@%&<>/\\|=+*01ABCDEF";

/** #82: deterministic "wrong" character slots for the diff-correct intro. */
function diffSlots(title: string): number[] {
  const slots: number[] = [];
  for (let i = 0; i < title.length && slots.length < 3; i++) {
    if (title[i] !== " " && (i * 7 + title.length) % 4 === 1) slots.push(i);
  }
  return slots;
}

export function SectionHeading({
  index,
  kicker,
  title,
  description,
  diffCorrect = false,
}: {
  index: string;
  kicker: string;
  title: string;
  description?: string;
  /** #82 git-diff intro: type a corrupted title, then self-correct diff-style */
  diffCorrect?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const alive = !reducedMotion && !perfLite;

  // #82 phase machine: idle → corrupt → fix → done, once per visit
  const [diffPhase, setDiffPhase] = useState<"idle" | "corrupt" | "fix" | "done">("idle");
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!diffCorrect || !alive) return;
    const el = headingRef.current;
    if (!el) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timers.push(
          setTimeout(() => setDiffPhase("corrupt"), 60),
          setTimeout(() => setDiffPhase("fix"), 760),
          setTimeout(() => setDiffPhase("done"), 2100),
        );
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [diffCorrect, alive]);

  // #94 velocity breathe + #92 direction-aware kicker
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  // toned down after user feedback: the old 0.14em swing at 2600px/s read as
  // "breathing" text and was nauseating — keep a whisper of it only.
  const trackingRaw = useTransform(velocity, [-3400, 0, 3400], ["0.04em", "0em", "0.04em"], { clamp: true });
  const tracking = useSpring(trackingRaw, { stiffness: 160, damping: 34 });
  const [dir, setDir] = useState<"down" | "up" | null>(null);
  useMotionValueEvent(velocity, "change", (value) => {
    if (!alive) return;
    if (value > 400) setDir("down");
    else if (value < -400) setDir("up");
  });

  // #84 shake-overheat glitch: shaking the cursor over the title corrupts it
  const [glitch, setGlitch] = useState(0); // 0..1 heat
  const reversals = useRef(0);
  const lastDx = useRef(0);
  const heatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onTitleMove = (event: React.MouseEvent<HTMLHeadingElement>) => {
    if (!alive) return;
    const dx = event.movementX;
    if (dx !== 0 && Math.sign(dx) !== Math.sign(lastDx.current) && Math.abs(dx) > 2) {
      reversals.current += 1;
      if (reversals.current > 5) {
        reversals.current = 0;
        setGlitch(1);
        if (heatTimer.current) clearTimeout(heatTimer.current);
        heatTimer.current = setTimeout(() => setGlitch(0), 900);
      }
    }
    lastDx.current = dx;
  };

  const glitchedTitle =
    glitch > 0
      ? Array.from(title, (char, i) =>
          char === " " ? " " : i % 3 === (Math.floor(glitch * 3) % 3) ? GLYPHS[(i * 7) % GLYPHS.length] : char,
        ).join("")
      : title;

  // #82 render helper: corrupted string / per-char diff spans
  const slots = diffCorrect ? diffSlots(title) : [];
  const showDiff = alive && diffCorrect && (diffPhase === "corrupt" || diffPhase === "fix");
  const diffContent = showDiff ? (
    <>
      {diffPhase === "fix" && (
        <m.span
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.3, 1] }}
          transition={{ duration: 0.5 }}
          className="mr-2 align-middle font-mono text-[0.5em] text-accent"
        >
          +
        </m.span>
      )}
      {Array.from(title).map((char, i) => {
        const wrongChar = GLYPHS[(i * 11 + title.length) % GLYPHS.length];
        if (!slots.includes(i)) return <span key={i}>{char}</span>;
        if (diffPhase === "corrupt") {
          return (
            <span key={i} className="text-muted/80">
              {wrongChar}
            </span>
          );
        }
        // fix: wrong char strikes through and slides out, correct char lands in accent
        return (
          <span key={i} className="relative inline-block">
            <m.span
              aria-hidden="true"
              initial={{ opacity: 0.7, x: 0 }}
              animate={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.5, delay: 0.1 + slots.indexOf(i) * 0.12 }}
              className="absolute inset-0 text-muted/60 line-through"
            >
              {wrongChar}
            </m.span>
            <m.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25 + slots.indexOf(i) * 0.12 }}
              className="inline-block text-accent"
            >
              {char}
            </m.span>
          </span>
        );
      })}
    </>
  ) : null;

  return (
    <Reveal>
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <span className="flex shrink-0 items-center gap-1.5">
          <DecryptText text={`[ ${index} ] // ${kicker}`} className="kicker" delay={0.1} />
          {alive && dir && (
            <span className="font-mono text-[0.55rem] tracking-[0.14em] text-accent/60">
              {dir === "down" ? "▼ SCANNING" : "▲ REWIND"}
            </span>
          )}
        </span>
        <span
          className="h-px flex-1"
          style={{
            background:
              "linear-gradient(to right, rgb(var(--accent-rgb) / 0.6), rgb(var(--accent-rgb) / 0.05))",
          }}
          aria-hidden="true"
        />
      </div>
      <m.h2
        ref={headingRef}
        data-prox
        data-prox-radius="420"
        onMouseMove={onTitleMove}
        aria-label={title}
        style={alive ? { letterSpacing: tracking } : undefined}
        className={`prox-title font-display mt-4 max-w-2xl text-section font-medium tracking-tight 3xl:max-w-4xl ${
          glitch > 0 ? "text-accent" : ""
        }`}
      >
        <span aria-hidden="true">{showDiff ? diffContent : glitchedTitle}</span>
      </m.h2>
      {description && (
        <p className="mt-3 max-w-xl text-sm text-muted [text-shadow:0_2px_16px_rgb(0_0_0/0.7)] sm:text-base 3xl:max-w-2xl 3xl:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  );
}
