"use client";

import { useRef } from "react";
import { useCanvasLoop, CanvasFrame, ACCENT } from "./canvasLoop";

// 22 — small packets flowing in and out along radial lines from a center
// node — a concrete "network traffic" motif instead of an abstract diagram.
export function PacketFlow() {
  const packetsRef = useRef<{ angle: number; t: number; speed: number; inbound: boolean }[] | null>(null);
  const canvasRef = useCanvasLoop((ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) * 0.42;
    if (!packetsRef.current) {
      packetsRef.current = Array.from({ length: 14 }, () => ({
        angle: Math.random() * Math.PI * 2,
        t: Math.random(),
        speed: 0.006 + Math.random() * 0.008,
        inbound: Math.random() > 0.5,
      }));
    }
    ctx.fillStyle = "rgba(5,6,8,1)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = `rgba(${ACCENT},0.85)`;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
    for (const p of packetsRef.current) {
      const r = p.inbound ? maxR * (1 - p.t) : maxR * p.t;
      const x = cx + Math.cos(p.angle) * r;
      const y = cy + Math.sin(p.angle) * r;
      ctx.strokeStyle = `rgba(${ACCENT},0.08)`;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(p.angle) * maxR, cy + Math.sin(p.angle) * maxR);
      ctx.stroke();
      ctx.fillStyle = `rgba(${ACCENT},0.9)`;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
      p.t += p.speed;
      if (p.t > 1) {
        p.t = 0;
        p.angle = Math.random() * Math.PI * 2;
        p.inbound = Math.random() > 0.5;
      }
    }
  });
  return <CanvasFrame canvasRef={canvasRef} />;
}

// 23 — a QR-like dot grid with a scanning line and a periodic "verified"
// flash — a concrete payoff moment rather than a generic scan sweep.
export function QrScan() {
  const gridRef = useRef<boolean[][] | null>(null);
  const canvasRef = useCanvasLoop((ctx, w, h, time) => {
    const size = 12;
    const cell = Math.min(w, h) * 0.6 / size;
    const originX = w / 2 - (size * cell) / 2;
    const originY = h / 2 - (size * cell) / 2;
    if (!gridRef.current) {
      gridRef.current = Array.from({ length: size }, () => Array.from({ length: size }, () => Math.random() > 0.55));
    }
    ctx.fillStyle = "rgba(5,6,8,1)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = `rgba(${ACCENT},0.75)`;
    gridRef.current.forEach((row, y) => row.forEach((on, x) => {
      if (!on) return;
      ctx.fillRect(originX + x * cell, originY + y * cell, cell - 1.5, cell - 1.5);
    }));

    const cycle = (time / 1000) % 3.5;
    if (cycle < 2) {
      const sweepY = originY + (cycle / 2) * size * cell;
      ctx.fillStyle = `rgba(${ACCENT},0.25)`;
      ctx.fillRect(originX, sweepY - 1, size * cell, 3);
    } else {
      ctx.fillStyle = `rgba(${ACCENT},${0.5 + Math.sin((cycle - 2) * 8) * 0.3})`;
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText("DOĞRULANDI", w / 2, originY + size * cell + 22);
    }
  });
  return <CanvasFrame canvasRef={canvasRef} />;
}

// 24 — points spiraling inward continuously (a vortex — the inverse motion
// of the galaxy that already tested well).
export function Vortex() {
  const pointsRef = useRef<{ angle: number; r: number; speed: number }[] | null>(null);
  const canvasRef = useCanvasLoop((ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) * 0.45;
    if (!pointsRef.current) {
      pointsRef.current = Array.from({ length: 160 }, () => ({
        angle: Math.random() * Math.PI * 2,
        r: Math.random() * maxR,
        speed: 0.4 + Math.random() * 0.6,
      }));
    }
    ctx.fillStyle = "rgba(5,6,8,0.3)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = `rgba(${ACCENT},0.6)`;
    for (const p of pointsRef.current) {
      p.r -= p.speed;
      p.angle += 0.012 * (1 + (maxR - p.r) / maxR);
      if (p.r < 2) {
        p.r = maxR;
        p.angle = Math.random() * Math.PI * 2;
      }
      const x = cx + Math.cos(p.angle) * p.r;
      const y = cy + Math.sin(p.angle) * p.r * 0.7;
      ctx.beginPath();
      ctx.arc(x, y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  return <CanvasFrame canvasRef={canvasRef} />;
}

// 25 — nodes on a ring, with occasional connecting pulses between random
// pairs — "systems talking to each other" rather than a static diagram.
export function ConnectionPing() {
  const stateRef = useRef<{
    nodes: { x: number; y: number }[];
    pulses: { a: number; b: number; t: number }[];
  } | null>(null);
  const canvasRef = useCanvasLoop((ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.36;
    if (!stateRef.current) {
      const count = 8;
      const nodes = Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
      });
      stateRef.current = { nodes, pulses: [] };
    }
    const state = stateRef.current;

    ctx.fillStyle = "rgba(5,6,8,1)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = `rgba(${ACCENT},0.7)`;
    for (const node of state.nodes) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (Math.random() < 0.02) {
      const a = Math.floor(Math.random() * state.nodes.length);
      let b = Math.floor(Math.random() * state.nodes.length);
      if (b === a) b = (b + 1) % state.nodes.length;
      state.pulses.push({ a, b, t: 0 });
    }

    state.pulses = state.pulses.filter((pulse) => pulse.t <= 1);
    for (const pulse of state.pulses) {
      const from = state.nodes[pulse.a];
      const to = state.nodes[pulse.b];
      const x = from.x + (to.x - from.x) * pulse.t;
      const y = from.y + (to.y - from.y) * pulse.t;
      ctx.strokeStyle = `rgba(${ACCENT},0.15)`;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.fillStyle = `rgba(${ACCENT},0.9)`;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      pulse.t += 0.02;
    }
  });
  return <CanvasFrame canvasRef={canvasRef} />;
}

// 26 — a grid heatmap-style scan: one cell highlighted at a time, sweeping
// row by row — "satellite/surveillance scan" reads clearly at a glance.
export function SatelliteGridScan() {
  const canvasRef = useCanvasLoop((ctx, w, h, time) => {
    const cols = 10;
    const rows = 7;
    const cellW = w / cols;
    const cellH = h / rows;
    ctx.fillStyle = "rgba(5,6,8,1)";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = `rgba(${ACCENT},0.12)`;
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellW, 0);
      ctx.lineTo(x * cellW, h);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellH);
      ctx.lineTo(w, y * cellH);
      ctx.stroke();
    }
    const index = Math.floor((time / 260) % (cols * rows));
    const cx = index % cols;
    const cy = Math.floor(index / cols) % rows;
    ctx.fillStyle = `rgba(${ACCENT},0.35)`;
    ctx.fillRect(cx * cellW, cy * cellH, cellW, cellH);
  });
  return <CanvasFrame canvasRef={canvasRef} />;
}

// 27 — sparse falling code-bracket symbols — a calmer, more specific
// cousin of digital rain restricted to { } [ ] ( ) < > characters.
export function CascadingBrackets() {
  const symbols = "{ } [ ] ( ) < > ;".split(" ");
  const columnsRef = useRef<{ x: number; y: number; speed: number; char: string }[] | null>(null);
  const canvasRef = useCanvasLoop((ctx, w, h) => {
    if (!columnsRef.current) {
      const count = Math.max(4, Math.floor(w / 60));
      columnsRef.current = Array.from({ length: count }, (_, i) => ({
        x: (i + 0.5) * (w / count),
        y: Math.random() * -h,
        speed: 0.5 + Math.random() * 0.7,
        char: symbols[Math.floor(Math.random() * symbols.length)],
      }));
    }
    ctx.fillStyle = "rgba(5,6,8,0.15)";
    ctx.fillRect(0, 0, w, h);
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    for (const col of columnsRef.current) {
      ctx.fillStyle = `rgba(${ACCENT},0.45)`;
      ctx.fillText(col.char, col.x, col.y);
      col.y += col.speed;
      if (col.y > h + 20) {
        col.y = -20;
        col.char = symbols[Math.floor(Math.random() * symbols.length)];
      }
    }
  });
  return <CanvasFrame canvasRef={canvasRef} />;
}
