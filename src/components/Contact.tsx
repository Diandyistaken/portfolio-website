"use client";

import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { Check, Copy, Mail } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { GithubIcon, LinkedinIcon, InstagramIcon } from "./icons";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { MagneticButton } from "./MagneticButton";
import { CONTAINER } from "@/lib/layout";
import { usePerfLite } from "./SectionBackdrop";

type CopyState = "idle" | "copied" | "failed";

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
              <a
                href={mailtoHref}
                aria-label={revealedEmail ?? undefined}
                className="font-mono max-w-full break-all text-xl font-semibold tracking-tight transition-colors hover:text-accent sm:text-3xl md:text-4xl 3xl:text-5xl"
              >
                <span aria-hidden="true">{displayEmail ?? "···"}</span>
              </a>
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
