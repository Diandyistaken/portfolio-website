"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { isPerfLite } from "@/lib/perfLite";

const TRIGGERS = ["hack", "kahve"];
const RAIN_MS = 2600;
const GLYPHS = "アイウエオ01<>/$#{}[]=+*";

/**
 * Hidden toy for the curious: typing "hack" (or "kahve") anywhere outside an
 * input rains accent-colored glyphs over the page for a couple of seconds and
 * tips off the robot buddy. Also drops a small greeting in the dev console —
 * recruiters who open devtools deserve a hello.
 */
export function EasterEgg() {
  const [raining, setRaining] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    console.log(
      "%c> merhaba, meraklı geliştirici_ %c\n  bu site el yapımı: Next.js + Tailwind + Framer Motion.\n  ipucu: sayfada 'hack' yazmayı dene ;)",
      "color:#5ec8ff;font-family:monospace;font-size:13px",
      "color:#8993a3;font-family:monospace;font-size:11px",
    );
  }, []);

  useEffect(() => {
    let buffer = "";
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      if (event.key.length !== 1) return;
      buffer = (buffer + event.key.toLocaleLowerCase("tr")).slice(-8);
      if (TRIGGERS.some((word) => buffer.endsWith(word))) {
        buffer = "";
        window.dispatchEvent(new Event("app:hack-egg"));
        if (!reducedMotion && !isPerfLite()) setRaining(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reducedMotion]);

  useEffect(() => {
    if (!raining) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const columnWidth = 18;
    const columns = Math.ceil(canvas.width / columnWidth);
    const drops = Array.from({ length: columns }, () => Math.random() * -40);

    let raf = 0;
    const draw = () => {
      context.fillStyle = "rgb(5 6 8 / 0.22)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#5ec8ff";
      context.font = "14px monospace";
      for (let i = 0; i < columns; i++) {
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        context.fillText(glyph, i * columnWidth, drops[i] * 18);
        if (drops[i] * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 1;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const stop = setTimeout(() => setRaining(false), RAIN_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(stop);
    };
  }, [raining]);

  if (!raining) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] opacity-80 transition-opacity"
    />
  );
}
