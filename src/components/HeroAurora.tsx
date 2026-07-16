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
  { className: "left-[10%] top-[-12%]", size: "32rem", duration: 24, xRange: [0, 30, -10, 0], yRange: [0, 24, 10, 0] },
  { className: "right-[4%] top-[8%]", size: "26rem", duration: 28, xRange: [0, -24, 16, 0], yRange: [0, -16, 20, 0] },
];

/**
 * Fallback hero atmosphere for devices that don't get the 3D scene
 * (HeroBackdrop decides): two soft, slow-drifting glows in the fixed accent
 * hue, masked to fade top and bottom. Two, not more — restraint is the
 * point of this direction.
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
