"use client";

import { useEffect, useRef } from "react";

const SPACING = 46;
const REPEL_RADIUS = 150;

type Dot = { ox: number; oy: number; x: number; y: number; vx: number; vy: number };

/**
 * #102 Magnetic grid distortion field: a faint canvas dot-grid behind the
 * hero where dots within ~150px of the cursor repel outward and brighten to
 * accent, spring-snapping back as it leaves — a fluid the visitor stirs.
 * Renders only while the hero is on screen; parent gates reduced/perf-lite.
 */
export function HeroDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let dots: Dot[] = [];
    let raf = 0;
    let running = false;
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      dots = [];
      for (let y = SPACING; y < canvas.height; y += SPACING) {
        for (let x = SPACING; x < canvas.width; x += SPACING) {
          dots.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
        }
      }
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      context.clearRect(0, 0, canvas.width, canvas.height);
      const bounds = canvas.getBoundingClientRect();
      const mx = mouse.x - bounds.left;
      const my = mouse.y - bounds.top;
      for (const dot of dots) {
        const dx = dot.x - mx;
        const dy = dot.y - my;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < REPEL_RADIUS) {
          const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * 1.4;
          dot.vx += (dx / dist) * force;
          dot.vy += (dy / dist) * force;
        }
        // spring back to the lattice point
        dot.vx += (dot.ox - dot.x) * 0.06;
        dot.vy += (dot.oy - dot.y) * 0.06;
        dot.vx *= 0.86;
        dot.vy *= 0.86;
        dot.x += dot.vx;
        dot.y += dot.vy;
        const excitement = Math.min(1, Math.hypot(dot.x - dot.ox, dot.y - dot.oy) / 16);
        context.fillStyle = `rgb(94 200 255 / ${(0.07 + excitement * 0.5).toFixed(3)})`;
        context.fillRect(dot.x - 1, dot.y - 1, 2, 2);
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    build();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) start();
        else stop();
      },
      { threshold: 0.05 },
    );
    observer.observe(canvas);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", build);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", build);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden lg:block"
    />
  );
}
