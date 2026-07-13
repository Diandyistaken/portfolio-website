"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { m, useReducedMotion, useSpring } from "framer-motion";

export function MagneticButton({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const x = useSpring(0, { stiffness: 260, damping: 22 });
  const y = useSpring(0, { stiffness: 260, damping: 22 });

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - rect.left) / rect.width - 0.5) * 16);
    y.set(((event.clientY - rect.top) / rect.height - 0.5) * 16);
  };

  const reset = () => { x.set(0); y.set(0); };

  return (
    <m.div ref={ref} className={className} style={{ x, y }} onMouseMove={handleMove} onMouseLeave={reset}>
      {children}
    </m.div>
  );
}
