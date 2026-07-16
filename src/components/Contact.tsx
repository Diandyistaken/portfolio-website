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

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    try {
      await navigator.clipboard.writeText(t.personalInfo.email);
      setCopyState("copied");
      window.dispatchEvent(new Event("app:email-copied"));
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
            initial="idle"
            whileHover={reducedMotion || perfLite ? undefined : "hover"}
            className="surface relative overflow-hidden rounded-lg p-6 text-center sm:p-10 3xl:p-12"
          >
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
                className="font-display max-w-full break-all text-xl font-semibold tracking-tight transition-colors hover:text-accent sm:text-3xl md:text-4xl 3xl:text-5xl"
              >
                {revealedEmail ?? "···"}
              </a>
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
