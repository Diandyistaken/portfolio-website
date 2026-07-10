"use client";

import { useEffect, useRef } from "react";
import { useScrollVideo, isPerfLite, onPerfLite } from "./ScrollVideoProvider";

/**
 * Fullscreen fixed canvas that scrubs the background video as an image
 * sequence (Apple-style).
 *
 * Performance model, tuned for low-end devices:
 *  - two frame sets: 1024×576 for desktop, 640×360 for phones / Save-Data /
 *    perf-lite devices (¼ the decode cost, half the bytes)
 *  - frames load coarse → fine in three tiers; finer tiers wait for idle
 *    time (or the first scroll) so they never compete with LCP
 *  - within a tier, the frame closest to the current scroll position always
 *    loads next, so whatever the user looks at sharpens first
 *  - canvas resolution adapts: DPR is capped per device class and drops
 *    further if the runtime FPS monitor flags the device as struggling
 */

const FRAME_COUNT = 180;
const FRAME_W = 1024;
const FRAME_H = 576;

type FrameSet = { dir: string; w: number; h: number };
const FULL: FrameSet = { dir: "/scrub", w: FRAME_W, h: FRAME_H };
const SMALL: FrameSet = { dir: "/scrub/sm", w: 640, h: 360 };

type NetInfo = { saveData?: boolean };

const saveDataOn = () =>
  (navigator as Navigator & { connection?: NetInfo }).connection?.saveData === true;

export function VideoScrubCanvas() {
  const { subscribe } = useScrollVideo();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    const saveData = saveDataOn();
    const smallScreen = Math.min(window.innerWidth, window.innerHeight) <= 480;
    const set: FrameSet = saveData || smallScreen || isPerfLite() ? SMALL : FULL;
    const frameSrc = (i: number) => `${set.dir}/${String(i).padStart(3, "0")}.webp`;

    const frames: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
    let targetFrame = 0;
    let drawnFrame = -1;
    let disposed = false;

    const nearestLoaded = (idx: number) => {
      if (frames[idx]) return idx;
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (idx - d >= 0 && frames[idx - d]) return idx - d;
        if (idx + d < FRAME_COUNT && frames[idx + d]) return idx + d;
      }
      return -1;
    };

    const draw = (force = false) => {
      const idx = nearestLoaded(targetFrame);
      if (idx < 0 || (idx === drawnFrame && !force)) return;
      drawnFrame = idx;
      const img = frames[idx]!;
      const cw = canvas.width;
      const ch = canvas.height;
      // cover-fit crop
      const scale = Math.max(cw / set.w, ch / set.h);
      const dw = set.w * scale;
      const dh = set.h * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    const dprCap = () =>
      isPerfLite() ? 1 : Math.min(window.devicePixelRatio || 1, smallScreen ? 1.5 : 1.75);

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const resize = () => {
      const dpr = dprCap();
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      draw(true);
    };
    // mobile URL bars fire resize storms while scrolling; settle first
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    };

    // ---- tiered, proximity-prioritized loader -------------------------
    const tierOf = (i: number) => (i % 12 === 0 ? 0 : i % 3 === 0 ? 1 : 2);
    // Save-Data: stop after tier 1 (60 frames) — scrub still works at
    // one-third granularity for a fraction of the transfer.
    const maxTier = saveData ? 1 : 2;
    const pending = new Set<number>();
    for (let i = 0; i < FRAME_COUNT; i++) if (tierOf(i) <= maxTier) pending.add(i);

    let unlockedTier = 0;
    let active = 0;
    const MAX_CONCURRENT = isPerfLite() ? 4 : 6;

    const pickNext = () => {
      let best = -1;
      let bestTier = 99;
      let bestDist = Infinity;
      for (const i of pending) {
        const t = tierOf(i);
        if (t > unlockedTier) continue;
        const d = Math.abs(i - targetFrame);
        if (t < bestTier || (t === bestTier && d < bestDist)) {
          best = i;
          bestTier = t;
          bestDist = d;
        }
      }
      return best;
    };

    const idle = (fn: () => void, timeout: number) => {
      if ("requestIdleCallback" in window) {
        (window as Window & typeof globalThis).requestIdleCallback(fn, { timeout });
      } else {
        setTimeout(fn, timeout);
      }
    };

    const pump = () => {
      while (!disposed && active < MAX_CONCURRENT) {
        const i = pickNext();
        if (i < 0) {
          // current tier drained: unlock the next one during idle time
          if (unlockedTier < maxTier && active === 0) {
            const next = unlockedTier + 1;
            idle(() => {
              if (disposed || unlockedTier >= next) return;
              unlockedTier = next;
              pump();
            }, 1200);
          }
          return;
        }
        pending.delete(i);
        const img = new Image();
        img.decoding = "async";
        active++;
        img.onload = () => {
          active--;
          frames[i] = img;
          if (Math.abs(i - targetFrame) <= Math.abs(drawnFrame - targetFrame)) {
            draw(true);
          }
          pump();
        };
        img.onerror = () => {
          active--;
          pump();
        };
        img.src = frameSrc(i);
      }
    };

    // scrolling signals scrub intent: unlock finer tiers right away
    const unlockOnScroll = () => {
      if (unlockedTier < maxTier) {
        unlockedTier = maxTier;
        pump();
      }
      window.removeEventListener("scroll", unlockOnScroll);
    };
    window.addEventListener("scroll", unlockOnScroll, { passive: true });

    const offPerfLite = onPerfLite(resize);

    resize();
    pump();
    window.addEventListener("resize", onResize);
    const unsubscribe = subscribe((p) => {
      targetFrame = Math.round(p * (FRAME_COUNT - 1));
      draw();
    });

    return () => {
      disposed = true;
      clearTimeout(resizeTimer);
      unsubscribe();
      offPerfLite();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", unlockOnScroll);
    };
  }, [subscribe]);

  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      {/* instant paint while the first frames stream in (preloaded in layout) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/scrub/000.webp"
        alt=""
        width={FRAME_W}
        height={FRAME_H}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* readability scrim: darkened edges + slight global dim */}
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgb(0 0 0 / 0.55) 100%)",
        }}
      />
    </div>
  );
}
