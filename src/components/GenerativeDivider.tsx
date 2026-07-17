"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  m,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePerfLite } from "./SectionBackdrop";
import { AccessKey } from "./KeyHunt";

// #114 daily cipher: date-seeded ROT13 word; typing the decoded word anywhere
// awards the CRYPTANALYST badge. English tech words — terminal artifacts.
const CIPHER_WORDS = ["firewall", "cipher", "packet", "kernel", "exploit", "socket", "daemon"];
const rot13 = (word: string) =>
  word.replace(/[a-z]/g, (char) =>
    String.fromCharCode(((char.charCodeAt(0) - 97 + 13) % 26) + 97),
  );

/**
 * #114 Daily cipher chip: shows today's ROT13'd word under the day divider;
 * decoding it (typing the plain word anywhere) fires a decrypt animation and
 * the CRYPTANALYST achievement. A new cipher every day, no streak UI.
 */
function CipherChip() {
  const [dayWord, setDayWord] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const dayIndex = Math.floor(Date.now() / 86400000);
      const word = CIPHER_WORDS[dayIndex % CIPHER_WORDS.length];
      setDayWord(word);
      try {
        setSolved(localStorage.getItem("mm-cipher-v1") === String(dayIndex));
      } catch {
        // ignore
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!dayWord || solved) return;
    let buffer = "";
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.key.length !== 1) return;
      buffer = (buffer + event.key.toLowerCase()).slice(-dayWord.length);
      if (buffer === dayWord) {
        setSolved(true);
        try {
          localStorage.setItem("mm-cipher-v1", String(Math.floor(Date.now() / 86400000)));
        } catch {
          // ignore
        }
        window.dispatchEvent(new Event("app:cipher-solved"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dayWord, solved]);

  if (!dayWord) return null;
  return (
    <p aria-hidden="true" className="mt-3 font-mono text-[0.6rem] tracking-[0.14em] text-muted/70">
      cipher_of_day:{" "}
      <span className={solved ? "text-accent" : ""}>{solved ? `${dayWord} ✓` : rot13(dayWord)}</span>
      {!solved && <span className="ml-1.5 text-muted/50">(rot13)</span>}
    </p>
  );
}

/**
 * #79 Cursor gravity well: the divider's flanking hairlines are rendered as
 * tiny ticks that bend vertically toward the cursor like iron filings within
 * 200px — a smooth attraction curve traveling with the pointer. Direct style
 * writes from one rAF loop; static hairline under reduced-motion/perf-lite.
 */
function GravityTicks({ align }: { align: "left" | "right" }) {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const alive = !reducedMotion && !perfLite;
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!alive) return;
    if (window.matchMedia("(hover: none)").matches) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ticks = Array.from(wrap.children) as HTMLElement[];
    let raf = 0;
    const onMove = (event: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const bounds = wrap.getBoundingClientRect();
        if (bounds.bottom < -40 || bounds.top > window.innerHeight + 40) return;
        for (const tick of ticks) {
          const rect = tick.getBoundingClientRect();
          const dx = event.clientX - (rect.left + rect.width / 2);
          const dy = event.clientY - (rect.top + rect.height / 2);
          const pull = Math.max(0, 1 - Math.hypot(dx, dy) / 200);
          const offset = Math.sign(dy || 1) * pull * 7;
          tick.style.transform = `translateY(${offset.toFixed(1)}px) scaleY(${(1 + pull * 1.6).toFixed(2)})`;
          tick.style.opacity = (0.35 + pull * 0.65).toFixed(2);
        }
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [alive]);

  if (!alive) {
    return (
      <span
        className={`hidden h-px w-12 sm:block lg:w-20 ${
          align === "left"
            ? "bg-gradient-to-r from-transparent to-accent/40"
            : "bg-gradient-to-l from-transparent to-accent/40"
        }`}
        aria-hidden="true"
      />
    );
  }

  return (
    <span ref={wrapRef} aria-hidden="true" className="hidden w-12 items-center justify-between sm:flex lg:w-20">
      {Array.from({ length: 14 }).map((_, index) => (
        <span key={index} className="h-2 w-px bg-accent/40" style={{ opacity: 0.35 }} />
      ))}
    </span>
  );
}

/**
 * #80 Coupled-oscillator beads: five beads under the chip ride invisible
 * springs — scroll velocity yanks the wire, the middle bead reacts first and
 * the neighbours follow with propagating lag, so hard scroll-stops ripple
 * visibly down the chain.
 */
function OscillatorBeads() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const alive = !reducedMotion && !perfLite;
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const impulse = useTransform(velocity, [-2600, 2600], [9, -9], { clamp: true });
  const middle = useSpring(impulse, { stiffness: 190, damping: 7 });
  const inner = useSpring(middle, { stiffness: 160, damping: 8 });
  const outer = useSpring(inner, { stiffness: 130, damping: 9 });

  if (!alive) return null;
  const chain = [outer, inner, middle, inner, outer];
  return (
    <div className="mt-4 flex items-center justify-center gap-3" aria-hidden="true">
      {chain.map((spring, index) => (
        <m.span
          key={index}
          style={{ y: spring }}
          className="h-1.5 w-1.5 rounded-full bg-accent/50 shadow-[0_0_6px_rgb(var(--accent-rgb)/0.4)]"
        />
      ))}
    </div>
  );
}

// #78 payloads — terminal artifacts, English on purpose
const PACKETS = [
  { tag: "[SYN]", hex: "0x53 0x59 0x4E → handshake" },
  { tag: "[ACK]", hex: "0x41 0x43 0x4B → confirmed" },
  { tag: "[DATA]", hex: "0x44 0x41 0x54 0x41 → 64 bytes" },
];
const PACKET_STARTS = [0.08, 0.42, 0.75];

/**
 * #78 Packet stream: [SYN]/[ACK]/[DATA] clusters travel along a hairline at
 * scroll-velocity-bound speed. A packet within ~120px of the cursor gets
 * "inspected" — it pauses, swells and opens a hex payload tooltip, then
 * resumes when the cursor leaves. One rAF loop, direct style writes.
 */
function PacketStream() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const alive = !reducedMotion && !perfLite;
  const lineRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!alive) return;
    const line = lineRef.current;
    if (!line) return;
    const mouse = { x: -9999, y: -9999 };
    const onMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };
    const positions = [...PACKET_STARTS];
    let last = performance.now();
    let lastScroll = window.scrollY;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min(0.06, (now - last) / 1000);
      last = now;
      const scrollDelta = Math.abs(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      const bounds = line.getBoundingClientRect();
      if (bounds.bottom < -100 || bounds.top > window.innerHeight + 100) return;
      const speed = 0.06 + Math.min(0.55, scrollDelta / 300);
      for (let i = 0; i < positions.length; i++) {
        const chip = chipRefs.current[i];
        if (!chip) continue;
        const chipX = bounds.left + positions[i] * bounds.width;
        const near =
          Math.hypot(mouse.x - chipX, mouse.y - (bounds.top + bounds.height / 2)) < 120;
        if (near) {
          chip.classList.add("packet-chip--inspect");
        } else {
          chip.classList.remove("packet-chip--inspect");
          positions[i] = (positions[i] + speed * dt) % 1;
        }
        chip.style.left = `${(positions[i] * 100).toFixed(2)}%`;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [alive]);

  if (!alive) return null;
  return (
    <div ref={lineRef} aria-hidden="true" className="relative mt-5 hidden h-4 w-full max-w-md sm:block">
      <span className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
      {PACKETS.map((packet, index) => (
        <span
          key={packet.tag}
          ref={(el) => {
            chipRefs.current[index] = el;
          }}
          className="packet-chip font-mono"
          style={{ left: `${PACKET_STARTS[index] * 100}%` }}
        >
          {packet.tag}
          <span className="packet-tip font-mono">{packet.hex}</span>
        </span>
      ))}
    </div>
  );
}

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
        <GravityTicks align="left" />

        <div
          onMouseEnter={retype}
          data-prox data-prox-lean data-prox-radius="220" className="terminal-panel prox-heat prox-lean flex items-center gap-3 rounded-full border border-foreground/10 px-4 py-2 shadow-[0_10px_36px_rgb(0_0_0/0.4)] sm:px-5 sm:py-2.5"
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

        <GravityTicks align="right" />
        </div>
        {/* #80 beads on the day divider, #78 packet stream on sunset */}
        {quoteId === "day" ? <OscillatorBeads /> : <PacketStream />}
        {quoteId === "day" && (
          <div className="flex items-center gap-2">
            <CipherChip />
            {/* #67 hidden key no.1 */}
            <AccessKey id="divider" className="mt-3" />
          </div>
        )}
      </div>
    </section>
  );
}
