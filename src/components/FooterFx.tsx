"use client";

import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { usePerfLite } from "./SectionBackdrop";

/**
 * #99 Footer gravity well: approaching the page bottom, the ECG heartbeat
 * quickens (animation-duration via CSS var), debris glyphs drift toward the
 * footer at increasing parallax, and at the true bottom an
 * "END OF TRANSMISSION" stamp settles in — the page gets an actual ending.
 */
export function FooterGravity() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const alive = !reducedMotion && !perfLite;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const [atEnd, setAtEnd] = useState(false);

  // debris parallax rates (page-progress driven, scrub-reversible)
  const driftA = useTransform(scrollYProgress, [0.82, 1], [-70, 26]);
  const driftB = useTransform(scrollYProgress, [0.82, 1], [-110, 18]);
  const driftC = useTransform(scrollYProgress, [0.82, 1], [-45, 32]);
  const debrisOpacity = useTransform(scrollYProgress, [0.82, 0.92, 1], [0, 0.5, 0.8]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (!alive) return;
    // ECG quickens from a calm 6s to a racing 1.6s at the very bottom
    const footer = ref.current?.closest("footer");
    if (footer) {
      const speed = 6 - Math.max(0, (progress - 0.8) / 0.2) * 4.4;
      (footer as HTMLElement).style.setProperty("--ecg-speed", `${speed.toFixed(2)}s`);
    }
    setAtEnd(progress > 0.992);
  });

  if (!alive) return null;

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none">
      <div className="absolute inset-x-0 top-0 hidden h-40 lg:block">
        <m.span style={{ y: driftA, opacity: debrisOpacity }} className="absolute left-[12%] font-mono text-[0.6rem] text-accent/40">0x1F</m.span>
        <m.span style={{ y: driftB, opacity: debrisOpacity }} className="absolute left-[46%] font-mono text-[0.55rem] text-accent/30">{"</>"}</m.span>
        <m.span style={{ y: driftC, opacity: debrisOpacity }} className="absolute left-[81%] font-mono text-[0.6rem] text-accent/40">▚▞</m.span>
      </div>
      <p
        className={`mt-8 text-center font-mono text-[0.6rem] tracking-[0.34em] transition-all duration-700 ${
          atEnd ? "text-accent/80 opacity-100" : "opacity-0"
        }`}
      >
        ── END OF TRANSMISSION ──
      </p>
    </div>
  );
}

const PONG_HEIGHT = 120;
const PADDLE_WIDTH = 72;
const IDLE_DISMISS_MS = 15000;

/**
 * #118 Packet pong on the ECG line: clicking the footer heartbeat detaches a
 * packet dot that bounces around the strip with the cursor as a bottom
 * paddle. Every save speeds it up and ticks a HITS counter; a miss plays the
 * flatline gag. Auto-dismisses after 15s idle. Fine-pointer desktops only.
 */
export function PacketPong() {
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const [playing, setPlaying] = useState(false);
  const [hits, setHits] = useState(0);
  const [flatline, setFlatline] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLSpanElement>(null);
  const paddleRef = useRef<HTMLSpanElement>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const flatTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      stopRef.current?.();
      if (flatTimer.current) clearTimeout(flatTimer.current);
    };
  }, []);

  const start = () => {
    if (playing || reducedMotion || perfLite) return;
    if (window.matchMedia("(hover: none)").matches) return;
    setPlaying(true);
    setHits(0);
    setFlatline(false);

    // the game loop starts inside the click handler — timing stays out of render
    const startAt = performance.now();
    let last = startAt;
    let lastHitAt = startAt;
    const ball = { x: 120, y: 20, vx: 160, vy: 150 };
    let paddleX = 160;
    let raf = 0;

    const onMove = (event: MouseEvent) => {
      const bounds = areaRef.current?.getBoundingClientRect();
      if (!bounds) return;
      paddleX = Math.max(PADDLE_WIDTH / 2, Math.min(bounds.width - PADDLE_WIDTH / 2, event.clientX - bounds.left));
    };

    const stop = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      stopRef.current = null;
      setPlaying(false);
    };
    stopRef.current = stop;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (now - lastHitAt > IDLE_DISMISS_MS) {
        stop();
        return;
      }
      const bounds = areaRef.current?.getBoundingClientRect();
      if (!bounds) return;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.x < 4 || ball.x > bounds.width - 4) {
        ball.vx = -ball.vx;
        ball.x = Math.max(4, Math.min(bounds.width - 4, ball.x));
      }
      if (ball.y < 4) {
        ball.vy = Math.abs(ball.vy);
        ball.y = 4;
      }
      // paddle collision at the bottom edge
      if (ball.y > PONG_HEIGHT - 12 && ball.vy > 0) {
        if (Math.abs(ball.x - paddleX) < PADDLE_WIDTH / 2 + 6) {
          ball.vy = -Math.abs(ball.vy) * 1.07;
          ball.vx *= 1.04;
          lastHitAt = now;
          setHits((count) => count + 1);
        } else if (ball.y > PONG_HEIGHT + 6) {
          // miss → flatline gag, then the heartbeat resumes
          stop();
          setFlatline(true);
          if (flatTimer.current) clearTimeout(flatTimer.current);
          flatTimer.current = setTimeout(() => setFlatline(false), 1800);
          return;
        }
      }
      if (ballRef.current) ballRef.current.style.transform = `translate(${ball.x.toFixed(1)}px, ${ball.y.toFixed(1)}px)`;
      if (paddleRef.current) paddleRef.current.style.transform = `translateX(${(paddleX - PADDLE_WIDTH / 2).toFixed(1)}px)`;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
  };

  return (
    <>
      {/* click target riding the heartbeat hairline */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={start}
        className="absolute inset-x-0 top-0 z-10 h-2.5 cursor-pointer"
      />
      {flatline && (
        <p aria-hidden="true" className="absolute inset-x-0 top-2 z-10 text-center font-mono text-[0.6rem] tracking-[0.3em] text-muted">
          ─────────── flatline ───────────
        </p>
      )}
      {playing && (
        <div
          ref={areaRef}
          aria-hidden="true"
          style={{ height: PONG_HEIGHT }}
          className="absolute inset-x-0 top-0 z-10 overflow-hidden border-b border-accent/30 bg-background/70 backdrop-blur-[2px]"
        >
          <span ref={ballRef} className="absolute left-0 top-0 h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgb(var(--accent-rgb)/0.9)]" />
          <span
            ref={paddleRef}
            style={{ width: PADDLE_WIDTH }}
            className="absolute bottom-1 left-0 h-1 rounded-full bg-accent/80 shadow-[0_0_8px_rgb(var(--accent-rgb)/0.7)]"
          />
          <span className="absolute right-3 top-2 font-mono text-[0.6rem] text-accent">HITS {hits}</span>
        </div>
      )}
    </>
  );
}
