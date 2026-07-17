"use client";

import { useRef, useState } from "react";
import {
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { Reveal } from "./Reveal";
import { DecryptText } from "./DecryptText";
import { usePerfLite } from "./SectionBackdrop";

const GLYPHS = "#@%&<>/\\|=+*01ABCDEF";

export function SectionHeading({
  index,
  kicker,
  title,
  description,
}: {
  index: string;
  kicker: string;
  title: string;
  description?: string;
}) {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const alive = !reducedMotion && !perfLite;

  // #94 velocity breathe + #92 direction-aware kicker
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const trackingRaw = useTransform(velocity, [-2600, 0, 2600], ["0.14em", "0em", "0.14em"], { clamp: true });
  const tracking = useSpring(trackingRaw, { stiffness: 200, damping: 26 });
  const [dir, setDir] = useState<"down" | "up" | null>(null);
  useMotionValueEvent(velocity, "change", (value) => {
    if (!alive) return;
    if (value > 400) setDir("down");
    else if (value < -400) setDir("up");
  });

  // #84 shake-overheat glitch: shaking the cursor over the title corrupts it
  const [glitch, setGlitch] = useState(0); // 0..1 heat
  const reversals = useRef(0);
  const lastDx = useRef(0);
  const heatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onTitleMove = (event: React.MouseEvent<HTMLHeadingElement>) => {
    if (!alive) return;
    const dx = event.movementX;
    if (dx !== 0 && Math.sign(dx) !== Math.sign(lastDx.current) && Math.abs(dx) > 2) {
      reversals.current += 1;
      if (reversals.current > 5) {
        reversals.current = 0;
        setGlitch(1);
        if (heatTimer.current) clearTimeout(heatTimer.current);
        heatTimer.current = setTimeout(() => setGlitch(0), 900);
      }
    }
    lastDx.current = dx;
  };

  const glitchedTitle =
    glitch > 0
      ? Array.from(title, (char, i) =>
          char === " " ? " " : i % 3 === (Math.floor(glitch * 3) % 3) ? GLYPHS[(i * 7) % GLYPHS.length] : char,
        ).join("")
      : title;

  return (
    <Reveal>
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <span className="flex shrink-0 items-center gap-1.5">
          <DecryptText text={`[ ${index} ] // ${kicker}`} className="kicker" delay={0.1} />
          {alive && dir && (
            <span className="font-mono text-[0.55rem] tracking-[0.14em] text-accent/60">
              {dir === "down" ? "▼ SCANNING" : "▲ REWIND"}
            </span>
          )}
        </span>
        <span
          className="h-px flex-1"
          style={{
            background:
              "linear-gradient(to right, rgb(var(--accent-rgb) / 0.6), rgb(var(--accent-rgb) / 0.05))",
          }}
          aria-hidden="true"
        />
      </div>
      <m.h2
        data-prox
        data-prox-radius="420"
        onMouseMove={onTitleMove}
        aria-label={title}
        style={alive ? { letterSpacing: tracking } : undefined}
        className={`prox-title font-display mt-4 max-w-2xl text-section font-medium tracking-tight 3xl:max-w-4xl ${
          glitch > 0 ? "text-accent" : ""
        }`}
      >
        <span aria-hidden="true">{glitchedTitle}</span>
      </m.h2>
      {description && (
        <p className="mt-3 max-w-xl text-sm text-muted [text-shadow:0_2px_16px_rgb(0_0_0/0.7)] sm:text-base 3xl:max-w-2xl 3xl:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  );
}
