"use client";

import { m, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { PointerEvent, ReactNode } from "react";

// Pointer-tracked 3D tilt for hologram-style cards.
export function TiltCard({
  children,
  className,
  maxTilt = 9,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spring = { stiffness: 160, damping: 18, mass: 0.4 };
  const rotateX = useSpring(useTransform(my, [0, 1], [maxTilt, -maxTilt]), spring);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-maxTilt, maxTilt]), spring);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <m.div
      className={className}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </m.div>
  );
}
