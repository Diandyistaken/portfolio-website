"use client";

import { useRef } from "react";
import { useCanvasLoop, CanvasFrame, ACCENT } from "./canvasLoop";

// 9 — meteors streaking across, no shape morphing, just one steady motion.
export function MeteorShowerScene() {
  const streaksRef = useRef<{ x: number; y: number; len: number; speed: number }[] | null>(null);
  const canvasRef = useCanvasLoop((ctx, w, h) => {
    if (!streaksRef.current || streaksRef.current.length === 0) {
      streaksRef.current = Array.from({ length: 7 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h - h,
        len: 30 + Math.random() * 40,
        speed: 3 + Math.random() * 2.5,
      }));
    }
    ctx.fillStyle = "rgba(5,6,8,0.25)";
    ctx.fillRect(0, 0, w, h);
    for (const s of streaksRef.current) {
      const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.len * 0.5, s.y - s.len);
      grad.addColorStop(0, `rgba(${ACCENT},0.9)`);
      grad.addColorStop(1, `rgba(${ACCENT},0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.len * 0.5, s.y - s.len);
      ctx.stroke();
      s.x -= s.speed * 0.5;
      s.y += s.speed;
      if (s.y > h + s.len) {
        s.x = Math.random() * w;
        s.y = -s.len;
      }
    }
  });
  return <CanvasFrame canvasRef={canvasRef} />;
}

// 10 — a static spiral, only the rotation angle changes (cheap: no
// per-particle position recompute, just redraw with a rotated transform).
export function GalaxyStatic() {
  const angleRef = useRef(0);
  const pointsRef = useRef<{ r: number; a: number }[] | null>(null);
  const canvasRef = useCanvasLoop((ctx, w, h) => {
    if (!pointsRef.current) {
      const count = 260;
      const arms = 3;
      pointsRef.current = Array.from({ length: count }, (_, i) => {
        const t = Math.random();
        return { r: t * Math.min(w, h) * 0.42, a: t * Math.PI * 4 + ((i % arms) * Math.PI * 2) / arms };
      });
    }
    ctx.fillStyle = "rgba(5,6,8,1)";
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    angleRef.current += 0.0025;
    ctx.fillStyle = `rgba(${ACCENT},0.6)`;
    for (const p of pointsRef.current) {
      const a = p.a + angleRef.current;
      const x = cx + Math.cos(a) * p.r;
      const y = cy + Math.sin(a) * p.r * 0.62;
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  return <CanvasFrame canvasRef={canvasRef} />;
}

// 11 — layered dots drifting toward the viewer (parallax depth), classic
// "flying through space" — cheap, each dot only has y and scale changing.
export function StarfieldDepth() {
  const starsRef = useRef<{ x: number; y: number; z: number }[] | null>(null);
  const canvasRef = useCanvasLoop((ctx, w, h) => {
    if (!starsRef.current) {
      starsRef.current = Array.from({ length: 140 }, () => ({
        x: (Math.random() - 0.5) * w,
        y: (Math.random() - 0.5) * h,
        z: Math.random() * w,
      }));
    }
    ctx.fillStyle = "rgba(5,6,8,0.4)";
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    for (const star of starsRef.current) {
      star.z -= 2.4;
      if (star.z <= 1) star.z = w;
      const scale = w / star.z;
      const x = cx + star.x * scale;
      const y = cy + star.y * scale;
      if (x < 0 || x > w || y < 0 || y > h) continue;
      const size = Math.max(0.4, (1 - star.z / w) * 2.4);
      ctx.fillStyle = `rgba(${ACCENT},${Math.min(1, (1 - star.z / w) * 1.2)})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  return <CanvasFrame canvasRef={canvasRef} />;
}

// 12 — sparse, single-tone falling characters (a calm cousin of Matrix rain).
export function DigitalRain() {
  const charset = "01アイウエオカキクケコ$#@%".split("");
  const columnsRef = useRef<{ x: number; y: number; speed: number; char: string }[] | null>(null);
  const canvasRef = useCanvasLoop((ctx, w, h) => {
    if (!columnsRef.current) {
      const count = Math.floor(w / 26);
      columnsRef.current = Array.from({ length: count }, (_, i) => ({
        x: i * 26 + 8,
        y: Math.random() * -h,
        speed: 1.2 + Math.random() * 1.6,
        char: charset[Math.floor(Math.random() * charset.length)],
      }));
    }
    ctx.fillStyle = "rgba(5,6,8,0.18)";
    ctx.fillRect(0, 0, w, h);
    ctx.font = "13px monospace";
    for (const col of columnsRef.current) {
      ctx.fillStyle = `rgba(${ACCENT},0.55)`;
      ctx.fillText(col.char, col.x, col.y);
      col.y += col.speed;
      if (Math.random() < 0.02) col.char = charset[Math.floor(Math.random() * charset.length)];
      if (col.y > h + 20) col.y = -20;
    }
  });
  return <CanvasFrame canvasRef={canvasRef} />;
}

// 13 — a continuously scrolling signal/oscilloscope line.
export function Oscilloscope() {
  const historyRef = useRef<number[] | null>(null);
  const canvasRef = useCanvasLoop((ctx, w, h, time) => {
    if (!historyRef.current) historyRef.current = new Array(Math.ceil(w)).fill(h / 2);
    const history = historyRef.current;
    const mid = h / 2;
    const next = mid + Math.sin(time * 0.003) * (h * 0.18) + Math.sin(time * 0.011) * (h * 0.06);
    history.push(next);
    if (history.length > w) history.shift();

    ctx.fillStyle = "rgba(5,6,8,1)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = `rgba(${ACCENT},0.8)`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    history.forEach((y, x) => (x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.stroke();
  });
  return <CanvasFrame canvasRef={canvasRef} />;
}

// 14 — concentric fingerprint-like rings with a vertical scan sweep.
export function FingerprintScan() {
  const canvasRef = useCanvasLoop((ctx, w, h, time) => {
    ctx.fillStyle = "rgba(5,6,8,1)";
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) * 0.4;
    ctx.strokeStyle = `rgba(${ACCENT},0.35)`;
    ctx.lineWidth = 1.4;
    for (let r = 6; r < maxR; r += 7) {
      const wobble = Math.sin(r * 0.4) * 4;
      ctx.beginPath();
      ctx.arc(cx + wobble, cy, r, Math.PI * 0.15, Math.PI * 1.6);
      ctx.stroke();
    }
    const sweepY = ((time * 0.05) % (h + 60)) - 30;
    const grad = ctx.createLinearGradient(0, sweepY - 20, 0, sweepY + 20);
    grad.addColorStop(0, "rgba(94,200,255,0)");
    grad.addColorStop(0.5, "rgba(94,200,255,0.25)");
    grad.addColorStop(1, "rgba(94,200,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, sweepY - 20, w, 40);
  });
  return <CanvasFrame canvasRef={canvasRef} />;
}

// 15 — falling characters periodically snap into ONE lock silhouette (a
// single steady target, not a multi-shape morph — the earlier bug was
// jumping between many shapes every frame with a full-array lerp).
function lockPoints(count: number, w: number, h: number) {
  const points: { x: number; y: number }[] = [];
  const cx = w / 2;
  const cy = h / 2;
  const bodyW = Math.min(w, h) * 0.32;
  const bodyH = bodyW * 0.8;
  for (let i = 0; i < count * 0.7; i++) {
    const edge = Math.floor(Math.random() * 4);
    const t = Math.random();
    let x = cx;
    let y = cy;
    if (edge === 0) { x = cx - bodyW / 2 + bodyW * t; y = cy - bodyH / 2; }
    else if (edge === 1) { x = cx - bodyW / 2 + bodyW * t; y = cy + bodyH / 2; }
    else if (edge === 2) { x = cx - bodyW / 2; y = cy - bodyH / 2 + bodyH * t; }
    else { x = cx + bodyW / 2; y = cy - bodyH / 2 + bodyH * t; }
    points.push({ x, y });
  }
  const shackleR = bodyW * 0.32;
  for (let i = 0; i < count * 0.3; i++) {
    const a = Math.PI + Math.random() * Math.PI;
    points.push({ x: cx + Math.cos(a) * shackleR, y: cy - bodyH / 2 + Math.sin(a) * shackleR });
  }
  return points;
}

export function CodeToLock() {
  const stateRef = useRef<{ p: { x: number; y: number; tx: number; ty: number }[] } | null>(null);
  const canvasRef = useCanvasLoop((ctx, w, h, time) => {
    if (!stateRef.current) {
      const targets = lockPoints(160, w, h);
      stateRef.current = {
        p: targets.map((t) => ({ x: Math.random() * w, y: Math.random() * h, tx: t.x, ty: t.y })),
      };
    }
    const locked = Math.sin(time * 0.0007) > 0.3;
    ctx.fillStyle = "rgba(5,6,8,0.3)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = `rgba(${ACCENT},0.75)`;
    for (const particle of stateRef.current.p) {
      const targetX = locked ? particle.tx : particle.x + Math.sin(time * 0.001 + particle.tx) * 40;
      const targetY = locked ? particle.ty : (particle.y + 60) % h;
      particle.x += (targetX - particle.x) * (locked ? 0.08 : 0.04);
      particle.y += (targetY - particle.y) * (locked ? 0.08 : 0.04);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  return <CanvasFrame canvasRef={canvasRef} />;
}
