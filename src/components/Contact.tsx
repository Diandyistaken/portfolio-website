"use client";

import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion, useSpring } from "framer-motion";
import { Check, Copy, Mail } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "./icons";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { MagneticButton } from "./MagneticButton";
import { CONTAINER } from "@/lib/layout";
import { usePerfLite } from "./SectionBackdrop";

type CopyState = "idle" | "copied" | "failed";

const GRID_COLS = 8;
const GRID_ROWS = 3;

/**
 * #39 Chain-reaction node grid: ~24 dormant dots behind the contact heading.
 * Clicking one lights it and the pulse propagates to neighbours in 80ms
 * Manhattan-distance waves like a network worm; clicking mid-cascade spawns
 * colliding waves (each dot just counts overlapping pulses).
 */
function NodeGrid() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [lit, setLit] = useState<number[]>(() => Array(GRID_COLS * GRID_ROWS).fill(0));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  if (reducedMotion || perfLite) return null;

  const ignite = (index: number) => {
    const col = index % GRID_COLS;
    const row = Math.floor(index / GRID_COLS);
    for (let i = 0; i < GRID_COLS * GRID_ROWS; i++) {
      const distance =
        Math.abs((i % GRID_COLS) - col) + Math.abs(Math.floor(i / GRID_COLS) - row);
      timers.current.push(
        setTimeout(
          () => setLit((previous) => previous.map((value, j) => (j === i ? value + 1 : value))),
          distance * 80,
        ),
        setTimeout(
          () =>
            setLit((previous) =>
              previous.map((value, j) => (j === i ? Math.max(0, value - 1) : value)),
            ),
          distance * 80 + 520,
        ),
      );
    }
  };

  return (
    <div aria-hidden="true" className="absolute inset-x-0 -top-6 hidden h-36 lg:block">
      <div className="grid h-full grid-cols-8 grid-rows-3 place-items-center">
        {lit.map((value, index) => (
          <button
            key={index}
            type="button"
            tabIndex={-1}
            onClick={() => ignite(index)}
            className="grid h-5 w-5 cursor-pointer place-items-center rounded-full"
          >
            <span
              className={`block h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                value > 0
                  ? "scale-[1.8] bg-accent shadow-[0_0_10px_rgb(var(--accent-rgb)/0.9)]"
                  : "bg-foreground/15"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * #12 Typable ghost prompt: a live "$ say_hello _" line above the contact
 * card that actually accepts keystrokes; pressing Enter types a cheeky
 * response and pulses the email card. A static heading becomes a toy.
 */
function GhostPrompt({ prompt, response, onSubmit }: { prompt: string; response: string; onSubmit: () => void }) {
  const [active, setActive] = useState(false);
  const [draft, setDraft] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (typeTimer.current) clearInterval(typeTimer.current);
    };
  }, []);

  const focusInput = () => {
    setActive(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const submit = () => {
    if (!draft.trim()) return;
    onSubmit();
    setDraft("");
    const startedAt = performance.now();
    if (typeTimer.current) clearInterval(typeTimer.current);
    typeTimer.current = setInterval(() => {
      const chars = Math.min(response.length, Math.ceil((performance.now() - startedAt) / 18));
      setReply(response.slice(0, chars));
      if (chars >= response.length && typeTimer.current) clearInterval(typeTimer.current);
    }, 18);
  };

  return (
    <div className="mt-6 font-mono text-xs text-muted sm:text-sm">
      <button
        type="button"
        onClick={focusInput}
        className="flex w-full items-center gap-2 text-left"
        aria-label={prompt}
      >
        <span className="shrink-0 text-accent">$</span>
        {active ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
              } else if (event.key === "Escape") {
                setActive(false);
              }
            }}
            onBlur={() => !draft && setActive(false)}
            maxLength={80}
            placeholder={prompt}
            aria-label={prompt}
            className="min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted/50 focus:outline-none"
          />
        ) : (
          <span className="flex-1 text-foreground/70">
            {prompt}
            <span className="ops-cursor ml-0.5 inline-block text-accent" aria-hidden="true">▊</span>
          </span>
        )}
      </button>
      {reply !== null && (
        <p className="mt-1.5 pl-4 text-accent/80">
          {reply}
          <span className="ops-cursor ml-0.5 inline-block" aria-hidden="true">▊</span>
        </p>
      )}
    </div>
  );
}

// #77 hop table — terminal artifacts, English on purpose
const TRACE_HOPS = [
  "visitor.local",
  "isp.gateway [10.44.0.1]",
  "edge.cdn [172.16.9.31]",
  "maksut.dev [READY]",
];

/**
 * #77 Traceroute contact path: clicking the traceroute command animates the
 * route hop by hop with fake latencies and a packet dot riding down the list,
 * ending with a pulse on the email card. Latencies rotate per run.
 */
function Traceroute({ onArrive }: { onArrive: () => void }) {
  const [shown, setShown] = useState(0); // hops printed so far
  const [running, setRunning] = useState(false);
  const [runNo, setRunNo] = useState(0); // varies the fake latencies per run
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const trace = () => {
    if (running) return;
    setRunNo((run) => run + 1);
    setRunning(true);
    setShown(0);
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
    TRACE_HOPS.forEach((_, index) => {
      timers.current.push(setTimeout(() => setShown(index + 1), 380 * (index + 1)));
    });
    timers.current.push(
      setTimeout(() => {
        setRunning(false);
        onArrive();
      }, 380 * TRACE_HOPS.length + 300),
    );
  };

  const latency = (index: number) => 6 + ((runNo * 13 + index * 29) % 38);

  return (
    <div className="mt-3 font-mono text-xs text-muted" aria-hidden="true">
      <button
        type="button"
        tabIndex={-1}
        onClick={trace}
        className="flex items-center gap-2 text-left transition-colors hover:text-foreground"
      >
        <span className="text-accent">$</span>
        <span>traceroute maksut.dev</span>
        {!running && shown === 0 && <span className="text-[0.6rem] text-muted/60">[ run ]</span>}
      </button>
      {shown > 0 && (
        <div className="relative mt-1.5 pl-4">
          {/* packet dot riding the hop list */}
          {running && (
            <m.span
              aria-hidden="true"
              initial={{ top: 0, opacity: 0 }}
              animate={{ top: `${(shown - 0.5) * 1.25}rem`, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="absolute left-0 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent-rgb)/0.9)]"
            />
          )}
          {TRACE_HOPS.slice(0, shown).map((hop, index) => (
            <p key={hop} className="h-5 leading-5">
              <span className="text-muted/60">{index + 1}</span>{" "}
              <span className={index === TRACE_HOPS.length - 1 ? "text-accent" : "text-foreground/75"}>{hop}</span>{" "}
              <span className="text-muted/60">{latency(index)}ms</span>
            </p>
          ))}
          {!running && shown >= TRACE_HOPS.length && (
            <p className="h-5 leading-5 text-accent/80">route established ✓</p>
          )}
        </div>
      )}
    </div>
  );
}

export function Contact() {
  const { t } = useLanguage();
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Kept out of the server-rendered HTML on purpose: a plain-text mailto
  // link is exactly the pattern spam harvesters regex for. Revealing it
  // after mount stops that without touching the JSON-LD copy search
  // engines are meant to read.
  const [revealedEmail, setRevealedEmail] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberately deferred past SSR, see comment above
    setRevealedEmail(t.personalInfo.email);
  }, [t]);
  const mailtoHref = revealedEmail ? `mailto:${revealedEmail}` : undefined;

  // #5 Decrypt-on-approach: the email renders as cipher noise and resolves
  // character by character as the cursor closes in on the card, with a
  // signal-strength readout. Click/keyboard always works (real mailto).
  const cardRef = useRef<HTMLDivElement>(null);
  const [signal, setSignal] = useState(0); // 0..1
  const signalRef = useRef(0);

  useEffect(() => {
    if (reducedMotion || perfLite) return;
    if (window.matchMedia("(hover: none)").matches) return;
    let raf = 0;
    const onMove = (event: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const card = cardRef.current;
        if (!card) return;
        const bounds = card.getBoundingClientRect();
        if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
        const clampedX = Math.max(bounds.left, Math.min(event.clientX, bounds.right));
        const clampedY = Math.max(bounds.top, Math.min(event.clientY, bounds.bottom));
        const distance = Math.hypot(event.clientX - clampedX, event.clientY - clampedY);
        const next = Math.max(0, Math.min(1, 1 - distance / 420));
        if (Math.abs(next - signalRef.current) >= 0.04) {
          signalRef.current = next;
          setSignal(next);
        }
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion, perfLite]);

  const CIPHER = "#$%&@0123456789abcdef";
  const displayEmail = (() => {
    if (!revealedEmail) return null;
    if (reducedMotion || perfLite || signal >= 0.97) return revealedEmail;
    const resolved = Math.floor(signal * revealedEmail.length);
    return Array.from(revealedEmail, (char, index) =>
      index < resolved || char === "@" || char === "."
        ? char
        : CIPHER[(index * 7 + Math.floor(signal * 40)) % CIPHER.length],
    ).join("");
  })();
  const signalBars = Math.round(signal * 4);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    };
  }, []);

  // #26 Data uplink beam: a beam shoots up from the card on a successful copy
  const [beamKey, setBeamKey] = useState(0);
  // #12 ghost-prompt submit pulses the email card
  const [pulseKey, setPulseKey] = useState(0);

  // #27 Elastic email stretch-snap: drag the email horizontally and it
  // stretches like taffy; past a threshold it snaps and copies.
  const emailScale = useSpring(1, { stiffness: 320, damping: 26 });
  const emailDrag = useRef({ active: false, startX: 0, moved: false, snapped: false });

  const beginEmailDrag = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (reducedMotion || perfLite) return;
    if (window.matchMedia("(hover: none)").matches) return;
    emailDrag.current = { active: true, startX: event.clientX, moved: false, snapped: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveEmailDrag = (event: React.PointerEvent<HTMLAnchorElement>) => {
    const state = emailDrag.current;
    if (!state.active || state.snapped) return;
    const dx = event.clientX - state.startX;
    if (Math.abs(dx) > 10) state.moved = true;
    const stretch = 1 + (dx / (Math.abs(dx) + 240)) * 0.35;
    emailScale.set(Math.max(0.9, stretch));
    if (dx > 140) {
      state.snapped = true;
      void handleCopyRef.current();
      emailScale.set(1.25);
      requestAnimationFrame(() => emailScale.set(1));
    }
  };
  const endEmailDrag = (event: React.PointerEvent<HTMLAnchorElement>) => {
    if (!emailDrag.current.active) return;
    emailDrag.current.active = false;
    if (!emailDrag.current.snapped) emailScale.set(1);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // pointer may already be released
    }
  };

  const handleCopy = async () => {
    if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    try {
      await navigator.clipboard.writeText(t.personalInfo.email);
      setCopyState("copied");
      window.dispatchEvent(new Event("app:email-copied"));
      if (!reducedMotion && !perfLite) setBeamKey((key) => key + 1);
    } catch {
      setCopyState("failed");
    } finally {
      resetTimerRef.current = setTimeout(() => setCopyState("idle"), 2200);
    }
  };

  // keep a stable ref so the pointer-drag handler can call the latest copy fn
  const handleCopyRef = useRef(handleCopy);
  useEffect(() => {
    handleCopyRef.current = handleCopy;
  });

  return (
    <section id="contact" className="relative overflow-hidden px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      <div className={`relative z-10 ${CONTAINER}`}>
        <div className="mx-auto max-w-2xl 3xl:max-w-4xl">
        <div className="relative">
          <NodeGrid />
          <SectionHeading
          index="11"
            kicker={t.contact.kicker}
            title={t.contact.title}
            description={t.contact.description}
          />
        </div>

        {!reducedMotion && !perfLite && (
          <>
            <GhostPrompt
              prompt={t.contact.ghostPrompt}
              response={t.contact.ghostResponse}
              onSubmit={() => setPulseKey((key) => key + 1)}
            />
            <Traceroute onArrive={() => setPulseKey((key) => key + 1)} />
          </>
        )}

        <Reveal delay={0.1} className="mt-12">
          <m.div
            ref={cardRef}
            initial="idle"
            whileHover={reducedMotion || perfLite ? undefined : "hover"}
            className="surface relative overflow-hidden rounded-lg p-6 text-center sm:p-10 3xl:p-12"
          >
            {beamKey > 0 && (
              <m.span
                key={beamKey}
                aria-hidden="true"
                initial={{ scaleY: 0, opacity: 0.9 }}
                animate={{ scaleY: 1, opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute bottom-1/2 left-1/2 h-[60vh] w-[3px] -translate-x-1/2 origin-bottom bg-gradient-to-t from-accent via-accent/60 to-transparent shadow-[0_0_20px_rgb(var(--accent-rgb)/0.8)]"
              />
            )}
            {pulseKey > 0 && (
              <m.span
                key={`pulse-${pulseKey}`}
                aria-hidden="true"
                initial={{ opacity: 0.7, scale: 0.98 }}
                animate={{ opacity: 0, scale: 1.01 }}
                transition={{ duration: 0.7 }}
                className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-accent/60"
              />
            )}
            <m.div
              aria-hidden="true"
              variants={{
                idle: { x: "-145%", opacity: 0 },
                hover: {
                  x: "145%",
                  opacity: [0, 0.45, 0],
                  transition: { duration: 0.85, ease: "easeInOut" },
                },
              }}
              className="pointer-events-none absolute inset-y-0 z-0 w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-accent/20 to-transparent"
            />
            <div className="relative z-10 flex flex-col items-center gap-6">
            <MagneticButton className="flex max-w-full flex-col items-center gap-3">
              <m.a
                href={mailtoHref}
                aria-label={revealedEmail ?? undefined}
                onPointerDown={beginEmailDrag}
                onPointerMove={moveEmailDrag}
                onPointerUp={endEmailDrag}
                onPointerCancel={endEmailDrag}
                onClickCapture={(event) => {
                  if (emailDrag.current.moved) event.preventDefault();
                }}
                style={{ scaleX: emailScale, touchAction: "pan-y" }}
                className="font-mono block max-w-full origin-center cursor-grab break-all text-xl font-semibold tracking-tight transition-colors hover:text-accent active:cursor-grabbing sm:text-3xl md:text-4xl 3xl:text-5xl"
              >
                <span aria-hidden="true">{displayEmail ?? "···"}</span>
              </m.a>
              {!reducedMotion && !perfLite && (
                <span className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.16em] text-muted" aria-hidden="true">
                  {t.contact.signalLabel}:
                  <span className="flex items-end gap-[2px]">
                    {[0, 1, 2, 3].map((bar) => (
                      <span
                        key={bar}
                        className={`w-[3px] rounded-sm transition-colors duration-150 ${
                          bar < signalBars ? "bg-accent" : "bg-foreground/15"
                        }`}
                        style={{ height: `${5 + bar * 3}px` }}
                      />
                    ))}
                  </span>
                  <span className={signal >= 0.97 ? "text-accent" : ""}>%{Math.round(signal * 100)}</span>
                </span>
              )}
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
                <a
                  href={mailtoHref}
                  className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
                >
                  <Mail size={14} /> {t.contact.mailLabel}
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground"
                >
                  {copyState === "copied" ? (
                    <>
                      <Check size={14} className="text-accent" /> {t.contact.copiedLabel}
                    </>
                  ) : copyState === "failed" ? (
                    <span className="text-amber-400">{t.contact.copyFailedLabel}</span>
                  ) : (
                    <>
                      <Copy size={14} /> {t.contact.copyLabel}
                    </>
                  )}
                </button>
              </div>
            </MagneticButton>

            <div className="flex items-center gap-3">
              <a
                href={t.personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                data-prox data-prox-radius="200" className="prox-icon flex h-11 w-11 items-center justify-center rounded-md border border-foreground/12 text-foreground transition-colors hover:border-foreground/30"
              >
                <LinkedinIcon className="h-4.5 w-4.5" />
              </a>
              <a
                href={t.personalInfo.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                data-prox data-prox-radius="200" className="prox-icon flex h-11 w-11 items-center justify-center rounded-md border border-foreground/12 text-foreground transition-colors hover:border-foreground/30"
              >
                <InstagramIcon className="h-4.5 w-4.5" />
              </a>
              <a
                href={t.personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                data-prox data-prox-radius="200" className="prox-icon flex h-11 w-11 items-center justify-center rounded-md border border-foreground/12 text-foreground transition-colors hover:border-foreground/30"
              >
                <GithubIcon className="h-4.5 w-4.5" />
              </a>
            </div>
            </div>
          </m.div>
        </Reveal>
        </div>
      </div>
    </section>
  );
}
