"use client";

import { m, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
};

// Sections rise out of the video plane with a perspective tilt, so every
// block reads as a holographic panel snapping into place.
export function Reveal({ children, delay = 0, className, y = 26 }: RevealProps) {
  const variants: Variants = {
    hidden: { opacity: 0, y, rotateX: 10, scale: 0.985, transformPerspective: 1000 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transformPerspective: 1000,
      transition: {
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
    >
      {children}
    </m.div>
  );
}

export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
      },
    },
  };

  return (
    <m.div
      className={className}
      style={{ perspective: 1200 }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={container}
    >
      {children}
    </m.div>
  );
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 24, rotateX: 12, transformPerspective: 900 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transformPerspective: 900,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};
