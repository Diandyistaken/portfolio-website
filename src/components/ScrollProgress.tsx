"use client";

import { m, useReducedMotion, useScroll } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reducedMotion = useReducedMotion();

  return (
    <m.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-accent"
      style={{ scaleX: reducedMotion ? 1 : scrollYProgress }}
    />
  );
}
