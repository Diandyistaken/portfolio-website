"use client";

import { useCallback, type PointerEvent } from "react";
import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionStyle,
} from "framer-motion";

const MAX_TILT = 7;

export function useTilt3D<T extends HTMLElement>() {
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 180, damping: 22, mass: 0.6 });
  const smoothY = useSpring(pointerY, { stiffness: 180, damping: 22, mass: 0.6 });
  const rotateX = useTransform(smoothY, [-1, 1], [MAX_TILT, -MAX_TILT]);
  const rotateY = useTransform(smoothX, [-1, 1], [-MAX_TILT, MAX_TILT]);

  const reset = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  const canTilt = useCallback(() => {
    if (reducedMotion || typeof window === "undefined") return false;

    return (
      window.matchMedia("(pointer: fine)").matches &&
      !document.documentElement.classList.contains("perf-lite")
    );
  }, [reducedMotion]);

  const onPointerMove = useCallback(
    (event: PointerEvent<T>) => {
      if (!canTilt()) {
        reset();
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      pointerX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
      pointerY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
    },
    [canTilt, pointerX, pointerY, reset],
  );

  const motionStyle: MotionStyle = {
    rotateX,
    rotateY,
    transformPerspective: 1000,
    transformStyle: "preserve-3d",
  };

  return {
    handlers: { onPointerMove, onPointerLeave: reset, onPointerCancel: reset },
    motionStyle,
  };
}
