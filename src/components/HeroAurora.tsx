"use client";

import { m, useReducedMotion } from "framer-motion";

type Blob = {
  className: string;
  size: string;
  duration: number;
  xRange: number[];
  yRange: number[];
};

const BLOBS: Blob[] = [
  { className: "left-[8%] top-[-10%]", size: "34rem", duration: 22, xRange: [0, 40, -10, 0], yRange: [0, 30, 10, 0] },
  { className: "right-[2%] top-[10%]", size: "28rem", duration: 26, xRange: [0, -30, 20, 0], yRange: [0, -20, 25, 0] },
  { className: "left-[30%] bottom-[-15%]", size: "30rem", duration: 30, xRange: [0, 25, -25, 0], yRange: [0, -15, 15, 0] },
];

/**
 * Generated atmosphere for the hero — soft, slow-drifting color blobs in the
 * scroll-cycling accent hue, masked to fade top and bottom (same technique
 * as a photo-background hero, minus the photo). Light/color, not objects —
 * deliberately not another "floating shapes" attempt.
 */
export function HeroAurora() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{
        maskImage: "linear-gradient(180deg, transparent, black 15%, black 80%, transparent)",
        WebkitMaskImage: "linear-gradient(180deg, transparent, black 15%, black 80%, transparent)",
      }}
      aria-hidden="true"
    >
      {BLOBS.map((blob, i) => (
        <m.div
          key={i}
          className={`absolute rounded-full ${blob.className}`}
          style={{
            width: blob.size,
            height: blob.size,
            background:
              "radial-gradient(circle, rgb(var(--accent-rgb) / 0.32), transparent 70%)",
            filter: "blur(70px)",
          }}
          animate={
            reduceMotion
              ? undefined
              : { x: blob.xRange, y: blob.yRange }
          }
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
