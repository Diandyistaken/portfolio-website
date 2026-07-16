"use client";

import { m, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import type { ReactNode } from "react";
import { usePerfLite } from "./SectionBackdrop";

/**
 * Wraps a marquee track and skews it with scroll velocity: fling the page
 * and the ticker leans into the motion like it has inertia, then springs
 * back upright. Transform-only, so it stays on the compositor.
 */
export function VelocityTrack({ children, className }: { children: ReactNode; className?: string }) {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const skewRaw = useTransform(velocity, [-1800, 0, 1800], [6, 0, -6], { clamp: true });
  const skew = useSpring(skewRaw, { stiffness: 220, damping: 28 });
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();

  if (reducedMotion || perfLite) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div className={className} style={{ skewX: skew }}>
      {children}
    </m.div>
  );
}
