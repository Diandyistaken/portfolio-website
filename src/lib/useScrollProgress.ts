"use client";

import { useEffect, useRef } from "react";

/**
 * Live page-scroll progress (0 at top, 1 at bottom) as a ref, not state —
 * updates on every scroll frame without triggering React re-renders.
 * Consumers (R3F useFrame, rAF loops) read `.current` directly.
 */
export function useScrollProgress() {
  const progressRef = useRef(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return progressRef;
}
