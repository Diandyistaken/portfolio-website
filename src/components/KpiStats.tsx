"use client";

import { useEffect, useRef, useState } from "react";
import { animate, m, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(reducedMotion ? value : 0);

  useEffect(() => motionValue.on("change", (latest) => setDisplay(Math.round(latest))), [motionValue]);
  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) { motionValue.set(value); return; }
    return animate(motionValue, value, { duration: 1.35, ease: "easeOut" }).stop;
  }, [inView, motionValue, reducedMotion, value]);

  return <span ref={ref} className="font-display text-3xl font-semibold text-foreground sm:text-4xl">{display}{suffix}</span>;
}

export function KpiStats() {
  const { t } = useLanguage();
  return (
    <m.div className="mt-5 grid grid-cols-3 border-t border-foreground/10 pt-6" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
      {t.about.stats.map((stat) => (
        <div key={stat.label} className="border-r border-foreground/10 px-3 text-center last:border-r-0 sm:px-6">
          <Counter value={stat.value} suffix={stat.suffix} />
          <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted sm:text-xs">{stat.label}</p>
        </div>
      ))}
    </m.div>
  );
}
