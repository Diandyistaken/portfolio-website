"use client";

import { useRef, useState } from "react";
import { m, useSpring, useTransform } from "framer-motion";

const LANYARD_LENGTH = 72;
const MAX_SWING = 70;

/**
 * #68 Draggable ID badge on a lanyard: a "SECURITY CLEARANCE" mini-badge
 * hangs off the hero photo card. Grab and fling it — it swings on a damped
 * pendulum spring, the cord following. Double-click flips it to a back face
 * with a barcode and "ACCESS: GRANTED". Fine-pointer sizes only.
 */
export function HeroBadge() {
  const anchorRef = useRef<HTMLDivElement>(null);
  // pendulum angle in degrees: 0 = hanging straight down
  const angle = useSpring(0, { stiffness: 150, damping: 7 });
  const badgeX = useTransform(angle, (a) => Math.sin((a * Math.PI) / 180) * LANYARD_LENGTH);
  const badgeY = useTransform(angle, (a) => Math.cos((a * Math.PI) / 180) * LANYARD_LENGTH);
  const badgeRotate = useTransform(angle, (a) => a * 0.6);
  const [flipped, setFlipped] = useState(false);
  const dragging = useRef(false);

  const onDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(hover: none)").matches) return;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    event.preventDefault();
    const anchor = anchorRef.current?.getBoundingClientRect();
    if (!anchor) return;
    const dx = event.clientX - (anchor.left + anchor.width / 2);
    const dy = Math.max(10, event.clientY - anchor.top);
    const next = (Math.atan2(dx, dy) * 180) / Math.PI;
    angle.set(Math.max(-MAX_SWING, Math.min(MAX_SWING, next)));
  };
  const onUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }
    angle.set(0); // underdamped spring → pendulum swing back to rest
  };

  return (
    <div ref={anchorRef} aria-hidden="true" className="absolute -right-5 top-4 z-20 hidden md:block">
      {/* anchor clip */}
      <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full border border-accent/60 bg-background" />
      {/* lanyard */}
      <svg className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2 overflow-visible" width="2" height="2">
        <m.line x1={0} y1={0} x2={badgeX} y2={badgeY} stroke="rgb(var(--accent-rgb) / 0.5)" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
      {/* the badge */}
      <m.div
        style={{ x: badgeX, y: badgeY, rotate: badgeRotate, perspective: 500 }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDoubleClick={() => setFlipped((value) => !value)}
        className="absolute left-1/2 top-1 -ml-10 w-20 cursor-grab touch-none select-none active:cursor-grabbing"
      >
        <m.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          className="relative h-12 w-20 [transform-style:preserve-3d]"
        >
          {/* front */}
          <div className="terminal-panel absolute inset-0 flex flex-col justify-between rounded-md border border-accent/40 p-1.5 [backface-visibility:hidden]">
            <p className="font-mono text-[0.4rem] tracking-[0.16em] text-accent">SECURITY CLEARANCE</p>
            <p className="font-mono text-[0.5rem] font-bold text-foreground/90">M. MAKSUT</p>
            <p className="font-mono text-[0.38rem] text-muted">LEVEL: ROOT</p>
          </div>
          {/* back */}
          <div className="terminal-panel absolute inset-0 flex flex-col justify-between rounded-md border border-accent/40 p-1.5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div
              className="h-4 w-full rounded-[2px]"
              style={{
                background:
                  "repeating-linear-gradient(90deg, rgb(var(--foreground-rgb)/0.8) 0 2px, transparent 2px 4px, rgb(var(--foreground-rgb)/0.8) 4px 5px, transparent 5px 8px)",
              }}
            />
            <p className="font-mono text-[0.42rem] tracking-[0.14em] text-accent">ACCESS: GRANTED</p>
          </div>
        </m.div>
      </m.div>
    </div>
  );
}
