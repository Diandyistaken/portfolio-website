"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; life: number; speed: number };

// Three overlapping sine waves stand in for a curl-noise field: cheap, no
// dependency, still produces smooth, swirling flow lines instead of a rigid
// grid. Same trick generative-art canvases have used forever.
function fieldAngle(x: number, y: number, t: number) {
  return (
    (Math.sin(x * 0.0021 + t * 0.35) +
      Math.sin(y * 0.0026 - t * 0.28) +
      Math.sin((x + y) * 0.0014 + t * 0.18)) *
    Math.PI
  );
}

/**
 * Whole-page ambient layer: a generative flow field of drifting particles
 * that leave soft fading streaks, not a geometric node-and-line diagram.
 * One shared canvas behind every section, plain 2D context, no WebGL —
 * the hero's own centerpiece (see HeroSequence.tsx) is a separate layer.
 */
export function AmbientField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || document.documentElement.classList.contains("perf-lite")) return;

    const rootStyle = getComputedStyle(document.documentElement);
    const bg = (rootStyle.getPropertyValue("--background-rgb").trim() || "5 6 8").split(/\s+/).join(",");
    const accent = (rootStyle.getPropertyValue("--accent-rgb").trim() || "94 200 255").split(/\s+/).join(",");

    const isSmall = window.innerWidth < 768;
    const count = isSmall ? 90 : 190;
    const dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1 : 1.5);

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let disposed = false;

    const spawn = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      life: 260 + Math.random() * 320,
      speed: 0.35 + Math.random() * 0.55,
    });

    const seed = () => {
      particles = Array.from({ length: count }, spawn);
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = `rgb(${bg})`;
      context.fillRect(0, 0, width, height);
      if (particles.length === 0) seed();
    };

    const step = (time: number) => {
      if (disposed) return;

      // Fade the previous frame instead of clearing it — leaves soft
      // streak trails behind each particle, the whole point of this look.
      context.fillStyle = `rgba(${bg}, 0.055)`;
      context.fillRect(0, 0, width, height);
      context.lineCap = "round";
      context.strokeStyle = `rgba(${accent}, 0.16)`;
      context.lineWidth = 1;

      for (const particle of particles) {
        const angle = fieldAngle(particle.x, particle.y, time * 0.00012);
        const nx = particle.x + Math.cos(angle) * particle.speed;
        const ny = particle.y + Math.sin(angle) * particle.speed;

        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(nx, ny);
        context.stroke();

        particle.x = nx;
        particle.y = ny;
        particle.life -= 1;

        const outOfBounds = nx < -20 || nx > width + 20 || ny < -20 || ny > height + 20;
        if (particle.life <= 0 || outOfBounds) Object.assign(particle, spawn());
      }

      raf = requestAnimationFrame(step);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !disposed) raf = requestAnimationFrame(step);
    };

    resize();
    raf = requestAnimationFrame(step);

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20" />;
}
