"use client";

import { useEffect, useRef, useState } from "react";
import { RevealGroup } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { DecryptText } from "./DecryptText";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { experienceMeta } from "@/lib/data";
import { AnimatePresence, m, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { CONTAINER } from "@/lib/layout";
import { usePerfLite } from "./SectionBackdrop";

/**
 * Timeline row whose node dot lights up the moment the row enters view.
 * #73 plunger nodes: the dot is also a mechanical push-button — clicking
 * depresses it, re-decrypts the role text and fires a current line from the
 * node to the card. Plunging every node triggers a full-spine sweep.
 */
function TimelineRow({
  exp,
  company,
  animated,
  onPlunge,
}: {
  exp: ReturnType<typeof useLanguage>["t"]["experience"]["items"][number];
  company: string;
  animated: boolean;
  onPlunge: (id: string) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const lit = useInView(rowRef, { once: true, amount: 0.5 });
  const [pressCount, setPressCount] = useState(0);
  const currentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentOn, setCurrentOn] = useState(false);
  useEffect(() => {
    return () => {
      if (currentTimer.current) clearTimeout(currentTimer.current);
    };
  }, []);

  const plunge = () => {
    if (!animated) return;
    setPressCount((count) => count + 1);
    setCurrentOn(true);
    if (currentTimer.current) clearTimeout(currentTimer.current);
    currentTimer.current = setTimeout(() => setCurrentOn(false), 900);
    onPlunge(exp.id);
  };

  return (
    <m.div
      ref={rowRef}
      initial={animated ? { opacity: 0, x: -28, rotateY: -6 } : false}
      whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
      whileHover={animated ? { x: 4, rotateY: 1 } : undefined}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative grid min-w-0 grid-cols-1 gap-2 border-b border-foreground/10 py-6 last:border-b-0 sm:grid-cols-[8rem_1fr] sm:gap-8 3xl:grid-cols-[11rem_1fr] 3xl:gap-12 3xl:py-8"
    >
      {animated ? (
        <m.button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={plunge}
          whileTap={{ scale: 0.5, x: 1 }}
          transition={{ type: "spring", stiffness: 600, damping: 18 }}
          data-prox
          data-prox-radius="120"
          className={`timeline-node cursor-pointer ${lit ? "timeline-node--lit" : ""}`}
        />
      ) : (
        <span data-prox data-prox-radius="120" className={`timeline-node ${lit ? "timeline-node--lit" : ""}`} aria-hidden="true" />
      )}
      {/* #73 current line: node → card surge on plunge */}
      <AnimatePresence>
        {currentOn && (
          <m.span
            aria-hidden="true"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-0 top-[2.2rem] hidden h-px w-28 origin-left bg-accent shadow-[0_0_8px_rgb(var(--accent-rgb)/0.9)] sm:block"
          />
        )}
      </AnimatePresence>
      <p className="font-mono text-xs text-muted">{exp.period}</p>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-semibold">
          {animated && pressCount > 0 ? <DecryptText key={pressCount} text={exp.role} delay={0} /> : exp.role}
        </h3>
        <p className="text-sm text-accent">{company}</p>
        <p className="mt-3 max-w-2xl break-words text-sm leading-relaxed text-muted 3xl:max-w-4xl 3xl:text-base">
          {exp.description}
        </p>
      </div>
    </m.div>
  );
}

export function Experience() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();

  // #73: plunging every node once triggers a full-timeline current sweep
  const plungedRef = useRef<Set<string>>(new Set());
  const [sweepKey, setSweepKey] = useState(0);
  const sweptRef = useRef(false);
  const onPlunge = (id: string) => {
    plungedRef.current.add(id);
    if (!sweptRef.current && plungedRef.current.size >= t.experience.items.length) {
      sweptRef.current = true;
      setSweepKey((key) => key + 1);
    }
  };

  // The accent spine now DRAWS with scroll (scrubbed, not one-shot): it
  // grows as you read down the timeline and springs smoothly between steps.
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 78%", "end 55%"],
  });
  const spineScale = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });
  // #24 Packet rider: a glowing dot travels down the spine as it draws,
  // like a packet routing through the timeline.
  const packetTop = useTransform(spineScale, (value) => `${Math.min(1, value) * 100}%`);
  const packetOpacity = useTransform(spineScale, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);

  return (
    <section id="experience" className="relative overflow-hidden px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      <div className={`relative z-10 ${CONTAINER}`}>
        <div className="mx-auto max-w-3xl 3xl:max-w-5xl 4xl:max-w-6xl">
          <SectionHeading index="04" kicker={t.experience.kicker} title={t.experience.title} diffCorrect />

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted 3xl:max-w-3xl 3xl:text-base">
          {t.experience.intro}
        </p>

        <div ref={listRef}>
          <RevealGroup stagger={0.1} className="surface relative mt-14 flex flex-col overflow-hidden rounded-lg px-6 sm:px-8 3xl:px-12">
            <m.div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-px origin-top bg-accent/50 shadow-[0_0_14px_rgb(var(--accent-rgb)/0.35)]"
              style={reducedMotion || perfLite ? { scaleY: 1 } : { scaleY: spineScale }}
            />
            {!reducedMotion && !perfLite && (
              <m.span
                aria-hidden="true"
                className="absolute left-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_14px_rgb(var(--accent-rgb)/1)]"
                style={{ top: packetTop, opacity: packetOpacity }}
              />
            )}
            {/* #73 payoff: every node plunged → a surge runs down the spine */}
            {sweepKey > 0 && (
              <m.span
                key={sweepKey}
                aria-hidden="true"
                initial={{ top: "0%", opacity: 0 }}
                animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute left-0 h-14 w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_16px_rgb(var(--accent-rgb)/1)]"
              />
            )}
            {t.experience.items.map((exp) => (
              <TimelineRow
                key={exp.id}
                exp={exp}
                company={experienceMeta[exp.id].company}
                animated={!reducedMotion && !perfLite}
                onPlunge={onPlunge}
              />
            ))}
          </RevealGroup>
        </div>
        </div>
      </div>
    </section>
  );
}
