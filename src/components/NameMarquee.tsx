"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const line = "MUHAMMED MAKSUT · SİBER GÜVENLİK · SAP · ";

export function NameMarquee() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="name-marquee overflow-hidden border-y border-foreground/10 py-5" aria-hidden="true">
      <div className="name-marquee-track flex w-max whitespace-nowrap font-display text-[10vw] font-semibold uppercase leading-none tracking-[-0.04em]" style={{ animationPlayState: visible && !reducedMotion ? "running" : "paused" }}>
        <span>{line.repeat(2)}</span><span>{line.repeat(2)}</span>
      </div>
    </div>
  );
}
