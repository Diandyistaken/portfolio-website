"use client";

import { Bug, Gamepad2, Globe, Home, MonitorSmartphone, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RevealGroup } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { servicesMeta } from "@/lib/data";
import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { CONTAINER } from "@/lib/layout";
import { usePerfLite } from "./SectionBackdrop";

const icons = {
  home: Home,
  globe: Globe,
  bug: Bug,
  gamepad: Gamepad2,
  smartphone: Smartphone,
  monitor: MonitorSmartphone,
} as const;

// #70 per-card boot commands — terminal artifacts, deliberately English
const BOOT_COMMANDS: Record<string, string> = {
  home: "./deploy --smart-home",
  globe: "./scan --web-stack",
  bug: "./pentest --status",
  gamepad: "./run --game-loop",
  smartphone: "./build --mobile",
  monitor: "./sync --desktop",
};

type ServiceItem = ReturnType<typeof useLanguage>["t"]["services"]["items"][number];

/**
 * One service card carrying two toys:
 * #71 deal-in — scroll-scrubbed deal from a single deck point below the fold,
 * each card arcing into its grid slot (reverse scroll sweeps them back), and
 * #70 self-test boot — hovering draws the border clockwise and a one-line
 * mini terminal types the card's own command, stamping [ACTIVE] when done.
 */
function ServiceCard({
  service,
  index,
  alive,
  sectionProgress,
}: {
  service: ServiceItem;
  index: number;
  alive: boolean;
  sectionProgress: MotionValue<number>;
}) {
  const Icon = icons[servicesMeta[service.id].icon];
  const command = BOOT_COMMANDS[servicesMeta[service.id].icon] ?? "./self-test --run";

  // #71 deal-in transforms: each card gets its own scrub window + arc
  const column = index % 3;
  const start = index * 0.07;
  const dealY = useTransform(sectionProgress, [start, start + 0.5], [130, 0], { clamp: true });
  const dealX = useTransform(sectionProgress, [start, start + 0.5], [(1 - column) * 90, 0], { clamp: true });
  const dealRot = useTransform(
    sectionProgress,
    [start, start + 0.5],
    [(column - 1) * 7 + (index % 2 === 0 ? -2 : 2), 0],
    { clamp: true },
  );
  const dealOpacity = useTransform(sectionProgress, [start, start + 0.22], [0, 1], { clamp: true });

  // #70 self-test typing (event-driven interval, cleaned up on leave/unmount)
  const [typed, setTyped] = useState<string | null>(null);
  const typeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    return () => {
      if (typeTimer.current) clearInterval(typeTimer.current);
    };
  }, []);
  const bootUp = () => {
    if (!alive || typeTimer.current) return;
    const startedAt = performance.now();
    setTyped("");
    typeTimer.current = setInterval(() => {
      const chars = Math.min(command.length, Math.ceil((performance.now() - startedAt) / 26));
      setTyped(command.slice(0, chars));
      if (chars >= command.length && typeTimer.current) {
        clearInterval(typeTimer.current);
        typeTimer.current = null;
      }
    }, 26);
  };
  const bootDown = () => {
    if (typeTimer.current) {
      clearInterval(typeTimer.current);
      typeTimer.current = null;
    }
    setTyped(null);
  };
  const booted = typed === command;

  return (
    <m.div
      style={alive ? { y: dealY, x: dealX, rotate: dealRot, opacity: dealOpacity } : undefined}
      onMouseEnter={bootUp}
      onMouseLeave={bootDown}
    >
      <TiltCard maxTilt={5} className="surface surface-hover relative h-full overflow-hidden rounded-lg p-6">
        {/* #70 border trace: rect draws clockwise while hovering */}
        {alive && (
          <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
            <m.rect
              x="1"
              y="1"
              rx="8"
              style={{ width: "calc(100% - 2px)", height: "calc(100% - 2px)" }}
              fill="none"
              stroke="rgb(var(--accent-rgb) / 0.8)"
              strokeWidth="1.5"
              initial={false}
              animate={{ pathLength: typed !== null ? 1 : 0, opacity: typed !== null ? 1 : 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>
        )}
        <span data-prox data-prox-radius="300" className="prox-icon inline-flex h-10 w-10 items-center justify-center rounded-md border border-foreground/12 text-accent">
          <Icon size={18} />
        </span>
        <h3 className="font-display mt-4 text-lg font-semibold">
          {service.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {service.description}
        </p>
        {/* #70 mini terminal foot line */}
        {alive && typed !== null && (
          <p className="mt-3 flex items-baseline gap-1.5 font-mono text-[0.62rem]" aria-hidden="true">
            <span className="text-accent">$</span>
            <span className="text-foreground/80">
              {typed}
              {!booted && <span className="ops-cursor ml-0.5 inline-block text-accent">▊</span>}
            </span>
            {booted && (
              <m.span
                initial={{ opacity: 0, scale: 1.3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="ml-1 text-accent"
              >
                [ACTIVE]
              </m.span>
            )}
          </p>
        )}
      </TiltCard>
    </m.div>
  );
}

export function Services() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const alive = !reducedMotion && !perfLite;

  // #71 one shared scrub for the whole deal
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start 0.98", "start 0.45"],
  });

  return (
    <section id="services" className="px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      <div className={CONTAINER}>
        <SectionHeading
        index="03"
          kicker={t.services.kicker}
          title={t.services.title}
          description={t.services.description}
        />

        <div ref={gridRef}>
          <RevealGroup
            stagger={0.06}
            className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 3xl:gap-6"
          >
            {t.services.items.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                alive={alive}
                sectionProgress={scrollYProgress}
              />
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
