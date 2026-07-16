"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";

export type SequenceItem = { Component: ComponentType; holdMs?: number };

type CrossfadeSequenceProps = {
  items: SequenceItem[];
  holdMs?: number;
  fadeMs?: number;
};

/**
 * Cycles through a list of self-contained animations, holding each one on
 * screen for its own tuned duration (a 4s CSS loop and a continuous
 * starfield don't want the same hold time — a flat duration for everyone
 * makes fast ones repeat and slow ones feel cut off), then crossfading
 * slowly into the next. No shared particle state, no per-frame lerping
 * between unrelated shapes (that's what caused the earlier stutter). Only
 * the active item (and, briefly, the outgoing one during the fade) is ever
 * mounted, so picking 10+ items here doesn't mean 10+ animations running
 * at once.
 */
export function CrossfadeSequence({ items, holdMs: defaultHoldMs = 7000, fadeMs = 2200 }: CrossfadeSequenceProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (items.length <= 1) return;
    let timeout: ReturnType<typeof setTimeout>;
    let fadeTimeout: ReturnType<typeof setTimeout> | undefined;

    const advance = () => {
      const next = (indexRef.current + 1) % items.length;
      setPrevIndex(indexRef.current);
      setActiveIndex(next);
      indexRef.current = next;
      if (fadeTimeout) clearTimeout(fadeTimeout);
      fadeTimeout = setTimeout(() => setPrevIndex(null), fadeMs);
      timeout = setTimeout(advance, (items[next].holdMs ?? defaultHoldMs) + fadeMs);
    };

    timeout = setTimeout(advance, (items[indexRef.current].holdMs ?? defaultHoldMs) + fadeMs);
    return () => {
      clearTimeout(timeout);
      if (fadeTimeout) clearTimeout(fadeTimeout);
    };
  }, [items, defaultHoldMs, fadeMs]);

  if (items.length === 0) return null;
  const Active = items[activeIndex].Component;
  const Prev = prevIndex !== null ? items[prevIndex].Component : null;

  return (
    <div className="relative h-full w-full">
      {Prev && (
        <div
          key={`prev-${prevIndex}`}
          className="absolute inset-0"
          style={{ animation: `lab-crossfade-out ${fadeMs}ms ease-in-out forwards` }}
        >
          <Prev />
        </div>
      )}
      <div
        key={`active-${activeIndex}`}
        className="absolute inset-0"
        style={{ animation: `lab-crossfade-in ${fadeMs}ms ease-in-out forwards` }}
      >
        <Active />
      </div>
      <style>{`
        @keyframes lab-crossfade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lab-crossfade-out { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
    </div>
  );
}
