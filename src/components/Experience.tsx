"use client";

import { useRef } from "react";
import { RevealGroup } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { experienceMeta } from "@/lib/data";
import { m, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { CONTAINER } from "@/lib/layout";
import { usePerfLite } from "./SectionBackdrop";

/** Timeline row whose node dot lights up the moment the row enters view. */
function TimelineRow({
  exp,
  company,
  animated,
}: {
  exp: ReturnType<typeof useLanguage>["t"]["experience"]["items"][number];
  company: string;
  animated: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const lit = useInView(rowRef, { once: true, amount: 0.5 });

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
      <span data-prox data-prox-radius="120" className={`timeline-node ${lit ? "timeline-node--lit" : ""}`} aria-hidden="true" />
      <p className="font-mono text-xs text-muted">{exp.period}</p>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-semibold">{exp.role}</h3>
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
          <SectionHeading index="04" kicker={t.experience.kicker} title={t.experience.title} />

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
            {t.experience.items.map((exp) => (
              <TimelineRow
                key={exp.id}
                exp={exp}
                company={experienceMeta[exp.id].company}
                animated={!reducedMotion && !perfLite}
              />
            ))}
          </RevealGroup>
        </div>
        </div>
      </div>
    </section>
  );
}
