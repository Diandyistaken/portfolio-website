"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { VelocityTrack } from "./VelocityTrack";

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
    <div ref={ref} className="name-marquee overflow-hidden border-y border-foreground/10 py-4 sm:py-5 3xl:py-8 4xl:py-10" aria-hidden="true">
      <VelocityTrack>
        <div className="name-marquee-track flex w-max whitespace-nowrap font-display text-[clamp(4.5rem,10vw,10rem)] font-semibold uppercase leading-none tracking-[-0.04em] 3xl:text-[clamp(10rem,8vw,14rem)] 4xl:text-[clamp(12rem,7vw,16rem)]" style={{ animationPlayState: visible && !reducedMotion ? "running" : "paused" }}>
          <span>{line.repeat(2)}</span><span>{line.repeat(2)}</span>
        </div>
      </VelocityTrack>
    </div>
  );
}
