"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

/**
 * Drives the whole scroll-scrub experience:
 *  - maps document scroll to video progress (0..1) through per-section anchors,
 *    so the video phase on screen always matches the section being read
 *  - interpolates the accent palette through the video's own color story
 *    (green "secured" → red team → blue team → golden Bosphorus) and writes
 *    it to CSS variables consumed by the whole design system
 *  - exposes a subscribe() API so canvas/HUD can follow progress without
 *    triggering React re-renders on every scroll frame
 */

type Listener = (progress: number) => void;

type ScrollVideoContextValue = {
  subscribe: (fn: Listener) => () => void;
  getProgress: () => number;
};

const ScrollVideoContext = createContext<ScrollVideoContextValue | null>(null);

export function useScrollVideo() {
  const ctx = useContext(ScrollVideoContext);
  if (!ctx) throw new Error("useScrollVideo must be used within ScrollVideoProvider");
  return ctx;
}

/**
 * perf-lite mode: on weak devices the html element gets a `perf-lite` class
 * (CSS drops backdrop blurs / glows) and the canvas lowers its resolution.
 * Enabled statically for low-core/low-memory/Save-Data devices and
 * dynamically if the runtime FPS monitor sees the main thread struggling.
 */
const PERF_LITE_EVENT = "scrub:perf-lite";

export function isPerfLite() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("perf-lite")
  );
}

export function enablePerfLite() {
  if (isPerfLite()) return;
  document.documentElement.classList.add("perf-lite");
  window.dispatchEvent(new Event(PERF_LITE_EVENT));
}

export function onPerfLite(fn: () => void) {
  window.addEventListener(PERF_LITE_EVENT, fn);
  return () => window.removeEventListener(PERF_LITE_EVENT, fn);
}

type DeviceHints = {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

function detectLowEndDevice() {
  const nav = navigator as Navigator & DeviceHints;
  return (
    (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4) ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
    nav.connection?.saveData === true
  );
}

// Video timeline checkpoints (progress 0..1 of the 15s clip) tied to section ids.
// Between anchors the video scrubs linearly, so each content zone lands on its
// matching visual phase: green intro, red-team, blue-team, sunset outro.
const SECTION_ANCHORS: { id: string; p: number }[] = [
  { id: "about", p: 0.1 },
  { id: "skills", p: 0.235 },
  { id: "experience", p: 0.48 },
  { id: "projects", p: 0.62 },
  { id: "contact", p: 0.93 },
];

// Accent color keyframes sampled from the video's dominant palette.
const COLOR_STOPS: { p: number; h: number; s: number; l: number }[] = [
  { p: 0.0, h: 145, s: 70, l: 62 }, // neon green — SYSTEM SECURED
  { p: 0.1, h: 145, s: 70, l: 62 },
  { p: 0.235, h: 351, s: 87, l: 61 }, // red — RED TEAM SIMULATION
  { p: 0.37, h: 351, s: 87, l: 61 },
  { p: 0.48, h: 203, s: 79, l: 64 }, // blue — BLUE TEAM DEFENSE
  { p: 0.86, h: 203, s: 79, l: 64 },
  { p: 0.91, h: 120, s: 16, l: 70 }, // hazy silver — sky handover, avoids a green flash
  { p: 0.96, h: 38, s: 84, l: 68 }, // gold — Bosphorus sunset
  { p: 1.0, h: 38, s: 84, l: 68 },
];

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return ln - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Hue interpolation along the shortest arc so green→red passes through
// warning yellows/oranges instead of muddy desaturated midpoints.
function lerpHue(a: number, b: number, t: number) {
  const d = ((b - a + 540) % 360) - 180;
  return (a + d * t + 360) % 360;
}

function accentAt(p: number): [number, number, number] {
  const stops = COLOR_STOPS;
  if (p <= stops[0].p) return hslToRgb(stops[0].h, stops[0].s, stops[0].l);
  for (let i = 1; i < stops.length; i++) {
    if (p <= stops[i].p) {
      const a = stops[i - 1];
      const b = stops[i];
      const t = (p - a.p) / (b.p - a.p || 1);
      return hslToRgb(lerpHue(a.h, b.h, t), lerp(a.s, b.s, t), lerp(a.l, b.l, t));
    }
  }
  const last = stops[stops.length - 1];
  return hslToRgb(last.h, last.s, last.l);
}

export function ScrollVideoProvider({ children }: { children: ReactNode }) {
  const listenersRef = useRef<Set<Listener>>(new Set());
  const progressRef = useRef(0);

  const api = useMemo<ScrollVideoContextValue>(
    () => ({
      subscribe(fn: Listener) {
        listenersRef.current.add(fn);
        fn(progressRef.current);
        return () => listenersRef.current.delete(fn);
      },
      getProgress: () => progressRef.current,
    }),
    []
  );

  useEffect(() => {
    // scroll positions mapped to video progress; rebuilt on layout changes
    let scrollMap: { s: number; p: number }[] = [
      { s: 0, p: 0 },
      { s: 1, p: 1 },
    ];

    const measure = () => {
      const vh = window.innerHeight;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - vh
      );
      const pts: { s: number; p: number }[] = [{ s: 0, p: 0 }];
      for (const anchor of SECTION_ANCHORS) {
        const el = document.getElementById(anchor.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // skip anchors that haven't been laid out yet (mid-hydration)
        if (rect.height === 0) continue;
        // section counts as "reached" when its top clears ~45% of the viewport
        const s = rect.top + window.scrollY - vh * 0.45;
        if (s <= pts[pts.length - 1].s) continue;
        pts.push({ s, p: anchor.p });
      }
      pts.push({ s: Math.max(maxScroll, pts[pts.length - 1].s + 1), p: 1 });
      scrollMap = pts;
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as Record<string, unknown>).__scrubMap = pts;
      }
    };

    const progressForScroll = (y: number) => {
      const pts = scrollMap;
      if (y <= pts[0].s) return pts[0].p;
      for (let i = 1; i < pts.length; i++) {
        if (y <= pts[i].s) {
          const a = pts[i - 1];
          const b = pts[i];
          return lerp(a.p, b.p, (y - a.s) / (b.s - a.s));
        }
      }
      return pts[pts.length - 1].p;
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (detectLowEndDevice()) enablePerfLite();

    // runtime FPS monitor: if >25% of the first ~240 visible frames run
    // long (>45ms), the device can't keep up — degrade gracefully once
    let fpsSamples = 0;
    let longFrames = 0;

    const root = document.documentElement;
    let smoothed = progressForScroll(window.scrollY);
    let raf = 0;
    let lastApplied = -1;

    const apply = (p: number) => {
      progressRef.current = p;
      const [r, g, b] = accentAt(p);
      root.style.setProperty("--accent", `rgb(${r} ${g} ${b})`);
      root.style.setProperty("--accent-rgb", `${r} ${g} ${b}`);
      listenersRef.current.forEach((fn) => fn(p));
    };

    let frame = 0;
    let lastTime = performance.now();
    const tick = (now: number) => {
      // periodic self-healing re-measure: layout can shift after fonts,
      // images or language switches without firing a resize
      if (frame++ % 30 === 0) measure();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      if (!document.hidden && fpsSamples < 240) {
        fpsSamples++;
        if (dt > 0.045) longFrames++;
        if (fpsSamples === 240 && longFrames / fpsSamples > 0.25) {
          enablePerfLite();
        }
      }
      const target = progressForScroll(window.scrollY);
      // time-based inertial smoothing: cinematic, but frame-rate independent
      const k = reducedMotion ? 1 : 1 - Math.exp(-9 * dt);
      smoothed = smoothed + (target - smoothed) * k;
      if (Math.abs(target - smoothed) < 0.0004) smoothed = target;
      if (smoothed !== lastApplied) {
        lastApplied = smoothed;
        apply(smoothed);
      }
      raf = requestAnimationFrame(tick);
    };

    measure();
    apply(smoothed);
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <ScrollVideoContext.Provider value={api}>
      {children}
    </ScrollVideoContext.Provider>
  );
}
