"use client";

import {
  m,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useState } from "react";
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
  const reduceMotion = useReducedMotion();
  const [isHovering, setIsHovering] = useState(false);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const spring = { stiffness: 160, damping: 18, mass: 0.4 };
  const rotateX = useSpring(useTransform(my, [0, 1], [maxTilt, -maxTilt]), spring);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-maxTilt, maxTilt]), spring);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mx.set(x);
    my.set(y);
    e.currentTarget.style.setProperty("--holo-x", `${x * 100}%`);
    e.currentTarget.style.setProperty("--holo-y", `${y * 100}%`);
  };

  const reset = () => {
    setIsHovering(false);
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <m.div
      className={`holo-card${className ? ` ${className}` : ""}`}
      data-hovered={isHovering || undefined}
      onPointerEnter={(event) => {
        if (!reduceMotion && event.pointerType !== "touch") setIsHovering(true);
      }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      animate={
        reduceMotion
          ? undefined
          : {
              scale: isHovering ? 1.02 : 1,
              boxShadow: isHovering
                ? "0 28px 70px rgb(0 0 0 / 0.62), 0 0 38px rgb(var(--accent-rgb) / 0.16)"
                : "0 12px 36px rgb(0 0 0 / 0.28)",
            }
      }
      transition={{ type: "spring", stiffness: 180, damping: 20, mass: 0.5 }}
      style={{
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
      <span className="holo-glare" aria-hidden="true" />
    </m.div>
  );
}
