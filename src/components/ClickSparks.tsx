"use client";

import { useEffect, useRef } from "react";

/**
 * Accent-colored particle burst on every click/tap. Cost model: the rAF loop
 * only runs while particles are alive (~600ms per burst) and stops itself,
 * so idle cost is zero. Skipped entirely for reduced-motion users; perf-lite
 * devices get half the particles.
 */

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
};

export function ClickSparks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let sparks: Spark[] = [];
    let raf = 0;
    let running = false;
    let color = "79 224 141";
    let lastTime = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparks = sparks.filter((s) => s.life > 0);
      if (sparks.length === 0) {
        running = false;
        return;
      }
      for (const s of sparks) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 520 * dt; // gravity
        s.vx *= 0.985;
        s.life -= dt;
        const alpha = Math.max(s.life / 0.6, 0);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${color} / ${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const burst = (e: PointerEvent) => {
      // ignore synthetic events and secondary buttons
      if (e.button !== 0) return;
      const lite = document.documentElement.classList.contains("perf-lite");
      const count = lite ? 5 : 11;
      color =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--accent-rgb")
          .trim() || color;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 90 + Math.random() * 240;
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 60,
          life: 0.38 + Math.random() * 0.25,
          size: 1.6 + Math.random() * 2,
        });
      }
      if (!running) {
        running = true;
        lastTime = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("pointerdown", burst, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", burst);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70]"
    />
  );
}
