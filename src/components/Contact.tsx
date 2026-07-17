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
        <SectionHeading
        index="11"
          kicker={t.contact.kicker}
          title={t.contact.title}
          description={t.contact.description}
        />

        {!reducedMotion && !perfLite && (
          <GhostPrompt
            prompt={t.contact.ghostPrompt}
            response={t.contact.ghostResponse}
            onSubmit={() => setPulseKey((key) => key + 1)}
          />
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
