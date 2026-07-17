"use client";

import { useState } from "react";
import { m, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity, useReducedMotion } from "framer-motion";
import { usePerfLite } from "./SectionBackdrop";

/**
 * #66 Robot rappel descent: a mini-bot rappels down the LEFT viewport edge on
 * a dashed tether, its position mapped to scroll progress through a springy
 * lag; fast scrolls swing it outward, and at the bottom it lands and waves.
 * A companion journey out of dead scroll distance. Desktop, motion-safe only.
 */
export function RappelBot() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const { scrollYProgress, scrollY } = useScroll();
  // springy lag on the descent + sideways swing from scroll velocity
  const descent = useSpring(scrollYProgress, { stiffness: 55, damping: 14 });
  const top = useTransform(descent, (value) => `${8 + Math.max(0, Math.min(1, value)) * 78}vh`);
  const velocity = useVelocity(scrollY);
  const swing = useSpring(useTransform(velocity, [-3200, 3200], [-16, 16], { clamp: true }), {
    stiffness: 120,
    damping: 8,
  });
  const [landed, setLanded] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reducedMotion || perfLite) return;
    setLanded((previous) => (previous === value > 0.985 ? previous : value > 0.985));
  });

  if (reducedMotion || perfLite) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed left-4 top-0 z-30 hidden h-full xl:block">
      {/* tether from the top edge down to the bot */}
      <m.span
        className="absolute left-1/2 top-0 w-px border-l border-dashed border-accent/30"
        style={{ height: top }}
      />
      <m.div style={{ top, x: swing, rotate: swing }} className="absolute -left-2.5">
        <div className="flex flex-col items-center">
          {/* grip */}
          <span className="h-2 w-px bg-accent/50" />
          {/* mini-bot */}
          <span className="flex h-4 w-5 items-center justify-center gap-[2px] rounded-md border border-accent/50 bg-[rgb(var(--surface)/0.95)]">
            <span className={`h-1 w-1 rounded-full bg-accent ${landed ? "" : "robot-eye"}`} />
            <span className={`h-1 w-1 rounded-full bg-accent ${landed ? "" : "robot-eye"}`} />
          </span>
          {/* landing wave: one arm up when the descent completes */}
          <span
            className={`mt-[1px] h-1.5 w-1 origin-top rounded-full bg-accent/60 transition-transform duration-500 ${
              landed ? "-rotate-[130deg]" : "rotate-0"
            }`}
          />
        </div>
      </m.div>
    </div>
  );
}
