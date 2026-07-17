"use client";

import { animate, m, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePerfLite } from "./SectionBackdrop";

/**
 * Scroll progress hairline + #42 slingshot launcher: the bar carries a
 * draggable thumb — pull it sideways like a bowstring (the bar visibly
 * tenses) and release to launch the page into a momentum scroll proportional
 * to the pull, overshooting a few pixels before the spring settles. Any
 * wheel/touch/key input cancels the launch immediately.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      setFine(window.matchMedia("(hover: hover) and (pointer: fine)").matches),
    );
    return () => cancelAnimationFrame(raf);
  }, []);

  const launchRef = useRef<{ stop: () => void } | null>(null);
  const pullX = useMotionValue(0);
  // bowstring tension: the hairline thickens as the thumb is pulled
  const barScaleY = useTransform(pullX, [-280, 0, 280], [2.6, 1, 2.6]);
  const thumbLeft = useTransform(scrollYProgress, (value) => `calc(${(value * 100).toFixed(2)}% - 7px)`);

  useEffect(() => {
    const cancel = () => {
      launchRef.current?.stop();
      launchRef.current = null;
    };
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", cancel);
    return () => {
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
      launchRef.current?.stop();
    };
  }, []);

  const interactive = fine && !reducedMotion && !perfLite;

  const onDragEnd = () => {
    const pull = pullX.get();
    if (Math.abs(pull) < 24) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const target = Math.max(0, Math.min(max, window.scrollY + (pull / window.innerWidth) * max));
    launchRef.current?.stop();
    launchRef.current = animate(window.scrollY, target, {
      type: "spring",
      stiffness: 55,
      damping: 13,
      restDelta: 0.5,
      onUpdate: (value) => window.scrollTo(0, value),
    });
  };

  return (
    <>
      <m.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-accent"
        style={{
          scaleX: reducedMotion ? 1 : scrollYProgress,
          scaleY: interactive ? barScaleY : 1,
        }}
      />
      {interactive && (
        <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[101] h-0">
          <m.div
            drag="x"
            dragSnapToOrigin
            dragElastic={0.12}
            dragConstraints={{ left: -280, right: 280 }}
            dragTransition={{ bounceStiffness: 500, bounceDamping: 22 }}
            onDragEnd={onDragEnd}
            whileDrag={{ scale: 1.5 }}
            whileHover={{ scale: 1.3 }}
            style={{ left: thumbLeft, x: pullX, top: -5 }}
            className="absolute h-3.5 w-3.5 cursor-grab rounded-full border border-accent bg-background shadow-[0_0_10px_rgb(var(--accent-rgb)/0.7)] active:cursor-grabbing"
          />
        </div>
      )}
    </>
  );
}
