"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Lock, ShieldAlert, ShieldCheck, Unlock, Wrench, Zap } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CONTAINER } from "@/lib/layout";
import { usePerfLite } from "./SectionBackdrop";

/** #8 Redaction peel: press-and-HOLD a bar to peel a clip-path hole revealing
 *  a wireframe underneath — but at ~70% a CLEARANCE DENIED stamp snaps it
 *  shut. Teases without ever revealing anything, which is the joke. */
function PeelBar({ className }: { className: string }) {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const ref = useRef<HTMLSpanElement>(null);
  const [radius, setRadius] = useState(0);
  const [posX, setPosX] = useState(50);
  const [denied, setDenied] = useState(false);
  const holding = useRef(false);
  const raf = useRef(0);

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const onDown = (event: React.PointerEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (reducedMotion || perfLite || window.matchMedia("(hover: none)").matches) return;
    const el = ref.current;
    if (!el) return;
    holding.current = true;
    setDenied(false);
    el.setPointerCapture(event.pointerId);
    const maxR = el.getBoundingClientRect().width * 0.7;
    const startedAt = performance.now();
    const loop = () => {
      if (!holding.current) return;
      const r = Math.min(maxR, ((performance.now() - startedAt) / 900) * maxR);
      setRadius(r);
      if (r >= maxR) {
        holding.current = false;
        setRadius(0);
        setDenied(true);
        setTimeout(() => setDenied(false), 800);
        return;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  };
  const onMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    if (!holding.current) return;
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setPosX(((event.clientX - rect.left) / rect.width) * 100);
  };
  const onUp = (event: React.PointerEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (!holding.current) return;
    holding.current = false;
    try {
      ref.current?.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }
    const shrink = () => {
      setRadius((current) => {
        const next = Math.max(0, current - 6);
        if (next > 0) raf.current = requestAnimationFrame(shrink);
        return next;
      });
    };
    raf.current = requestAnimationFrame(shrink);
  };

  return (
    <span
      ref={ref}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className={`redacted-bar relative cursor-grab touch-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <span
        className="absolute inset-0"
        style={{
          clipPath: `circle(${radius}px at ${posX}% 50%)`,
          background:
            "repeating-linear-gradient(90deg, rgb(var(--accent-rgb)/0.5) 0 1px, transparent 1px 6px), repeating-linear-gradient(0deg, rgb(var(--accent-rgb)/0.35) 0 1px, transparent 1px 6px)",
        }}
      />
      {denied && (
        <span className="absolute inset-0 flex items-center justify-center bg-background/70 font-mono text-[0.5rem] uppercase tracking-widest text-accent">
          denied
        </span>
      )}
    </span>
  );
}

const CLEARANCE_TARGET = 3;
// teasing words that flicker into view for a beat during the DENIED skit
const TEASE_WORDS = ["fintech", "gov", "retail", "ai"];
const TITLE_CIPHER = "█▓▒#$5f%&@01";

/**
 * #46 Hold-to-declassify: the small second redaction bar hides a sector word.
 * Press-and-hold decrypts it character by character behind a thin progress
 * line; release early and it re-scrambles shut. A full 700ms hold reveals it
 * permanently with a [DECLASSIFIED] micro-tag.
 */
function HoldWord({ word }: { word: string }) {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [progress, setProgress] = useState(0);
  const [declassified, setDeclassified] = useState(false);
  const holding = useRef(false);
  const raf = useRef(0);

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const onDown = (event: React.PointerEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (declassified || reducedMotion || perfLite) return;
    if (window.matchMedia("(hover: none)").matches) return;
    holding.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const startedAt = performance.now();
    const loop = () => {
      if (!holding.current) return;
      const next = Math.min(1, (performance.now() - startedAt) / 700);
      setProgress(next);
      if (next >= 1) {
        holding.current = false;
        setDeclassified(true);
        return;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  };
  const onUp = (event: React.PointerEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (!holding.current) return;
    holding.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }
    // released early → scramble collapse back to fully redacted
    const shrink = () => {
      setProgress((current) => {
        const next = Math.max(0, current - 0.09);
        if (next > 0) raf.current = requestAnimationFrame(shrink);
        return next;
      });
    };
    raf.current = requestAnimationFrame(shrink);
  };

  if (declassified) {
    return (
      <span
        aria-hidden="true"
        onClick={(event) => event.stopPropagation()}
        className="inline-flex h-6 items-center gap-1.5 font-mono text-[0.68rem] text-accent"
      >
        {word}
        <span className="text-[0.5rem] tracking-[0.14em] text-accent/70">[DECLASSIFIED]</span>
      </span>
    );
  }

  const revealed = Math.floor(progress * word.length);
  return (
    <span
      aria-hidden="true"
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onClick={(event) => event.stopPropagation()}
      className="redacted-bar relative inline-flex h-6 w-14 cursor-grab touch-none items-center justify-center overflow-hidden rounded-sm sm:w-20"
    >
      {progress > 0 && (
        <>
          <span className="relative z-10 font-mono text-[0.6rem] text-background">
            {Array.from(word, (char, index) =>
              index < revealed ? char : TITLE_CIPHER[(index * 7 + Math.floor(progress * 20)) % TITLE_CIPHER.length],
            ).join("")}
          </span>
          <span
            className="absolute bottom-0 left-0 z-10 h-[2px] bg-accent"
            style={{ width: `${progress * 100}%` }}
          />
        </>
      )}
    </span>
  );
}

/**
 * #51 Proximity decrypt: classified card titles idle as cipher text and
 * resolve character by character as the cursor approaches — backing away
 * re-encrypts. Touch / reduced-motion / perf-lite read plain text.
 */
function ProxDecrypt({ text }: { text: string }) {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const ref = useRef<HTMLSpanElement>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    if (reducedMotion || perfLite) return;
    if (window.matchMedia("(hover: none)").matches) return;
    const raf0 = requestAnimationFrame(() => setFine(true));
    let raf = 0;
    const onMove = (event: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = ref.current;
        if (!el) return;
        const bounds = el.getBoundingClientRect();
        if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
        const clampedX = Math.max(bounds.left, Math.min(event.clientX, bounds.right));
        const clampedY = Math.max(bounds.top, Math.min(event.clientY, bounds.bottom));
        const distance = Math.hypot(event.clientX - clampedX, event.clientY - clampedY);
        const next = Math.max(0, Math.min(1, 1 - (distance - 30) / 240));
        if (Math.abs(next - progressRef.current) >= 0.04 || next === 0 || next === 1) {
          progressRef.current = next;
          setProgress(next);
        }
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf0);
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion, perfLite]);

  const staticText = reducedMotion || perfLite || !fine;
  const resolved = Math.floor(progress * text.length);
  const display = staticText
    ? text
    : Array.from(text, (char, index) =>
        char === " " || index < resolved
          ? char
          : TITLE_CIPHER[(index * 5 + Math.floor(progress * 25)) % TITLE_CIPHER.length],
      ).join("");

  return (
    <span ref={ref} aria-label={text}>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}

function readClearance(): number {
  try {
    const raw = localStorage.getItem("mm-achievements-v1");
    return raw ? (JSON.parse(raw) as unknown[]).length : 0;
  } catch {
    return 0;
  }
}

type ClassifiedItem = ReturnType<typeof useLanguage>["t"]["classified"]["items"][number];

/** One NDA card + the #7 "clearance check denied" click skit. */
function ClassifiedCard({
  item,
  index,
  isFirst,
  cleared,
  bonus,
  statusIcon,
  labels,
}: {
  item: ClassifiedItem;
  index: number;
  isFirst: boolean;
  cleared: boolean;
  bonus: string;
  statusIcon: Record<ClassifiedItem["status"], ReactNode>;
  labels: {
    fileLabel: string;
    redactedLabel: string;
    verifying: string;
    denied: string[];
    bonusLabel: string;
    statuses: Record<ClassifiedItem["status"], string>;
  };
}) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<"scan" | "denied">("scan");
  const [denyLine, setDenyLine] = useState("");
  const clickCount = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timers.current.forEach((timer) => clearTimeout(timer));
  }, []);

  const runSkit = () => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
    clickCount.current += 1;
    setActive(true);
    setPhase("scan");
    setDenyLine("");
    // after the scan sweep, slam the DENIED stamp + a cycling denial line
    timers.current.push(
      setTimeout(() => {
        setPhase("denied");
        const lines = labels.denied;
        setDenyLine(clickCount.current === 1 ? labels.verifying : lines[(clickCount.current - 1) % lines.length]);
      }, 620),
    );
    timers.current.push(setTimeout(() => setActive(false), 2600));
  };

  return (
    <m.article
      variants={revealItem}
      onClick={runSkit}
      animate={active ? { x: [0, -4, 4, -3, 3, 0] } : undefined}
      transition={active ? { duration: 0.4 } : undefined}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          runSkit();
        }
      }}
      className="surface surface-hover target-frame group relative cursor-pointer overflow-hidden rounded-lg p-6 outline-none sm:p-7 3xl:p-9"
    >
      {/* #7 scan sweep */}
      <AnimatePresence>
        {active && phase === "scan" && (
          <m.span
            aria-hidden="true"
            initial={{ x: "-120%" }}
            animate={{ x: "120%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-y-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-accent/25 to-transparent"
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[0.68rem] tracking-[0.14em] text-muted">
          {`${labels.fileLabel} // ${item.code}`}
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-accent/40 px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.16em] text-accent">
          <Lock size={10} aria-hidden="true" />
          {item.tag}
        </span>
      </div>

      {/* Redacted "name" line: the bar IS the point — reads as a censored
          classified file, backed by a screen-reader label. During the skit
          the first bar flickers a teasing word into view. */}
      <div className="mt-5 flex items-center gap-3">
        <span className="sr-only">{labels.redactedLabel}</span>
        <span className="relative">
          <PeelBar className="block h-6 w-36 rounded-sm sm:w-44" />
          <AnimatePresence>
            {active && phase === "denied" && (
              <m.span
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.5, times: [0, 0.2, 0.6, 1] }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[0.6rem] uppercase tracking-widest text-background"
              >
                {TEASE_WORDS[index % TEASE_WORDS.length]}
              </m.span>
            )}
          </AnimatePresence>
        </span>
        <HoldWord word={TEASE_WORDS[(index + 2) % TEASE_WORDS.length]} />
      </div>

      <h3 className="font-display mt-4 text-lg font-semibold sm:text-xl"><ProxDecrypt text={item.type} /></h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{item.blurb}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {item.stack.map((tech) => (
          <span
            key={tech}
            data-prox
            className="prox-chip font-mono rounded-sm border border-foreground/12 px-2.5 py-1 text-[0.7rem] text-muted"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* #7 denial line + stamp */}
      <AnimatePresence>
        {active && phase === "denied" && (
          <m.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-center gap-2 font-mono text-[0.68rem] text-accent"
          >
            <ShieldAlert size={12} aria-hidden="true" />
            {denyLine}
          </m.div>
        )}
      </AnimatePresence>

      {isFirst && (
        <AnimatePresence>
          {cleared && (
            <m.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 border-l-2 border-accent/50 pl-3 font-mono text-[0.7rem] leading-relaxed text-accent/90"
            >
              {bonus}
            </m.p>
          )}
        </AnimatePresence>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-foreground/10 pt-4">
        <span className="font-mono text-[0.68rem] text-muted">{item.year}</span>
        <span
          className={`flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] ${
            item.status === "delivered" ? "text-accent" : "text-foreground/70"
          }`}
        >
          {statusIcon[item.status]}
          {labels.statuses[item.status]}
        </span>
      </div>

      {/* ACCESS DENIED stamp */}
      <AnimatePresence>
        {active && phase === "denied" && (
          <m.span
            aria-hidden="true"
            initial={{ opacity: 0, scale: 1.4, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -6 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 16 }}
            className="pointer-events-none absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded border-2 border-accent/80 px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent"
          >
            ACCESS DENIED
          </m.span>
        )}
      </AnimatePresence>
    </m.article>
  );
}

/**
 * Anonymized client & private work: type + stack + status only. Names,
 * identities and content stay redacted on purpose (NDA / private projects) —
 * the classified-file styling turns that constraint into the design.
 */
export function ClassifiedWork() {
  const { t } = useLanguage();

  // #13 NDA Clearance Level: achievements earned around the site raise the
  // visitor's clearance; at 3+ the first record declassifies one extra,
  // pre-approved sentence. Play converts into real recruiter content.
  const [clearance, setClearance] = useState(0);
  useEffect(() => {
    const sync = () => setClearance(readClearance());
    const initial = setTimeout(sync, 0);
    window.addEventListener("app:achievement-unlocked", sync);
    return () => {
      clearTimeout(initial);
      window.removeEventListener("app:achievement-unlocked", sync);
    };
  }, []);
  const cleared = clearance >= CLEARANCE_TARGET;

  const statusIcon = {
    delivered: <ShieldCheck size={12} aria-hidden="true" />,
    active: <Zap size={12} aria-hidden="true" />,
    building: <Wrench size={12} aria-hidden="true" />,
  } as const;

  return (
    <section id="classified" className="px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      <div className={CONTAINER}>
        <SectionHeading
          index="07"
          kicker={t.classified.kicker}
          title={t.classified.title}
          description={t.classified.description}
        />

        <RevealGroup stagger={0.08} className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 3xl:gap-7">
          {t.classified.items.map((item, index) => (
            <ClassifiedCard
              key={item.code}
              item={item}
              index={index}
              isFirst={index === 0}
              cleared={cleared}
              bonus={t.classified.bonus}
              statusIcon={statusIcon}
              labels={{
                fileLabel: t.classified.fileLabel,
                redactedLabel: t.classified.redactedLabel,
                verifying: t.classified.checkVerifying,
                denied: t.classified.deniedLines,
                bonusLabel: t.classified.bonusLabel,
                statuses: t.classified.statuses,
              }}
            />
          ))}
        </RevealGroup>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs leading-relaxed text-muted">{t.classified.note}</p>
          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.14em] transition-colors ${
              cleared ? "border-accent/60 text-accent" : "border-foreground/15 text-muted"
            }`}
          >
            {cleared ? <Unlock size={11} aria-hidden="true" /> : <Lock size={11} aria-hidden="true" />}
            {t.classified.bonusLabel}: {Math.min(clearance, CLEARANCE_TARGET)}/{CLEARANCE_TARGET}
          </span>
        </div>
      </div>
    </section>
  );
}
