"use client";

import { Gamepad2, Layers, Network, Shield } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { skillsMeta } from "@/lib/data";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CONTAINER } from "@/lib/layout";
import { useTilt3D } from "@/lib/useTilt3D";
import { usePerfLite } from "./SectionBackdrop";

/** #116 Firefly: a lone glow-dot drifts among the chips and flees the cursor;
 *  idle, it perches on a random spot and pulses. */
function Firefly() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 20, y: 30 });

  useEffect(() => {
    if (reducedMotion || perfLite) return;
    if (window.matchMedia("(hover: none)").matches) return;
    const self = { x: 20, y: 30, vx: 0.15, vy: 0.1 };
    let mouse = { x: -999, y: -999 };
    let raf = 0;
    const onMove = (event: MouseEvent) => {
      const box = ref.current?.parentElement?.getBoundingClientRect();
      if (!box) return;
      mouse = { x: ((event.clientX - box.left) / box.width) * 100, y: ((event.clientY - box.top) / box.height) * 100 };
    };
    const loop = () => {
      const dx = self.x - mouse.x;
      const dy = self.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 22) {
        self.vx += (dx / dist) * 0.6;
        self.vy += (dy / dist) * 0.6;
      }
      self.vx = self.vx * 0.94 + (Math.sin(self.y * 0.3) * 0.02);
      self.vy = self.vy * 0.94 + (Math.cos(self.x * 0.3) * 0.02);
      self.x = Math.max(2, Math.min(98, self.x + self.vx));
      self.y = Math.max(2, Math.min(98, self.y + self.vy));
      setPos({ x: self.x, y: self.y });
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion, perfLite]);

  if (reducedMotion || perfLite) return null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_3px_rgb(var(--accent-rgb)/0.7)]"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    />
  );
}

const icons = {
  cyber: Shield,
  gamedev: Gamepad2,
  corporate: Network,
  other: Layers,
} as const;


const BRUTE_CHARS = "abcdef0123456789#$%&";

/** #16 Brute-force chip: hovering "cracks" the tool name character by
 *  character, like a password brute-forcer locking in each position. */
function BruteChip({ label }: { label: string }) {
  const [display, setDisplay] = useState(label);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();

  const crack = () => {
    if (reducedMotion || perfLite || timer.current) return;
    let step = 0;
    const total = 10;
    timer.current = setInterval(() => {
      step += 1;
      const locked = Math.floor((step / total) * label.length);
      setDisplay(
        Array.from(label, (char, index) =>
          index < locked || char === " " || char === "·"
            ? char
            : BRUTE_CHARS[Math.floor(Math.random() * BRUTE_CHARS.length)],
        ).join(""),
      );
      if (step >= total) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setDisplay(label);
      }
    }, 28);
  };

  return (
    <span onMouseEnter={crack} className="inline-block">
      {display}
    </span>
  );
}

type SkillCategory = ReturnType<typeof useLanguage>["t"]["skills"]["categories"][number];

function SkillCard({ category, matched, canToss }: { category: SkillCategory; matched: string | null; canToss: boolean }) {
  const Icon = icons[category.id as keyof typeof icons];
  const meta = skillsMeta[category.id];
  const tilt = useTilt3D<HTMLDivElement>();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();

  return (
    <m.div
      {...tilt.handlers}
      style={tilt.motionStyle}
      variants={revealItem}
      whileHover={reducedMotion || perfLite ? undefined : "hover"}
      className={`surface surface-hover group relative overflow-hidden rounded-lg p-6 ${
        meta.size === "lg" ? "sm:col-span-2" : ""
      }`}
    >
      {/* #87 x-ray watermark: a huge faint category icon behind the card,
          brightening on hover like a scanned circuit. */}
      <Icon
        size={140}
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 -right-6 text-accent opacity-[0.03] transition-opacity duration-300 group-hover:opacity-[0.08]"
      />
      <m.div data-prox data-prox-radius="320" variants={{ hover: { z: 26, scale: 1.06 } }} className="prox-icon relative mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-foreground/12 text-accent [transform:translateZ(10px)]">
        <Icon size={18} />
      </m.div>
      <m.h3 variants={{ hover: { z: 20 } }} className="font-display text-lg font-semibold [transform:translateZ(8px)]">
        {category.title}
      </m.h3>

      <ul className="mt-4 space-y-3 [transform:translateZ(5px)]">
        {category.items.map((item) => (
          <li key={item.label}>
            <p className="text-sm font-medium">{item.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {item.description}
            </p>
          </li>
        ))}
      </ul>

      {meta.tools && (
        <div className="mt-5 flex flex-wrap gap-2 [transform:translateZ(12px)]">
          {meta.tools.map((tool, index) => (
            /* #41 flick-toss: grab a chip and fling it — it flies with real
               momentum, rubber-bands off invisible walls (dragConstraints +
               bounce), then spring-snaps back into its slot. */
            <m.span
              key={tool}
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.3, delay: index * 0.045 },
                },
              }}
              drag={canToss}
              dragSnapToOrigin
              dragElastic={0.2}
              dragConstraints={{ left: -150, right: 150, top: -80, bottom: 80 }}
              dragTransition={{ bounceStiffness: 420, bounceDamping: 13 }}
              whileDrag={{ scale: 1.15, zIndex: 40 }}
              data-prox
              className={`prox-chip font-mono relative rounded-sm border px-2.5 py-1 text-[0.7rem] text-muted transition-colors ${
                canToss ? "cursor-grab active:cursor-grabbing" : ""
              } ${
                matched && tool.toLowerCase().includes(matched) ? "border-accent bg-accent/10 text-accent" : "border-foreground/12"
              }`}
            >
              <BruteChip label={tool} />
            </m.span>
          ))}
        </div>
      )}
    </m.div>
  );
}

export function Skills() {
  const { t } = useLanguage();
  // #85 keystroke sniffer: typing a tech name anywhere (no input focused)
  // pulses the matching chip and prints a grep toast.
  const [matched, setMatched] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // #41 chips are flick-tossable on fine pointers only (drag would fight
  // scrolling on touch); static under reduced-motion / perf-lite.
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      setFinePointer(window.matchMedia("(hover: hover) and (pointer: fine)").matches),
    );
    return () => cancelAnimationFrame(raf);
  }, []);
  const canToss = finePointer && !reducedMotion && !perfLite;

  useEffect(() => {
    const tools = t.skills.categories
      .flatMap((category) => skillsMeta[category.id].tools ?? [])
      .map((tool) => tool.toLowerCase());
    let buffer = "";
    let clearMatch: ReturnType<typeof setTimeout> | null = null;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (event.key.length !== 1) return;
      buffer = (buffer + event.key.toLowerCase()).slice(-16);
      for (const tool of tools) {
        const clean = tool.replace(/[^a-z0-9.#]/g, "");
        if (clean.length >= 3 && buffer.endsWith(clean)) {
          setMatched(clean);
          setToast(`grep: match found in /skills → ${tool}`);
          if (clearMatch) clearTimeout(clearMatch);
          clearMatch = setTimeout(() => {
            setMatched(null);
            setToast(null);
          }, 2200);
          break;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (clearMatch) clearTimeout(clearMatch);
    };
  }, [t]);

  return (
    <section id="skills" className="relative overflow-hidden px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      <div className={`relative z-10 ${CONTAINER}`}>
        <SectionHeading
        index="02"
          kicker={t.skills.kicker}
          title={t.skills.title}
          description={t.skills.description}
        />

        <div className="relative mt-14">
          <Firefly />
          <RevealGroup
            stagger={0.08}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 3xl:gap-6"
          >
            {t.skills.categories.map((category) => (
              <SkillCard key={category.id} category={category} matched={matched} canToss={canToss} />
            ))}
          </RevealGroup>
        </div>

        <AnimatePresence>
          {toast && (
            <m.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 font-mono text-xs text-accent"
            >
              {toast}
            </m.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
