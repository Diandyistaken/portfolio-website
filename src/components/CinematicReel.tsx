"use client";

import { useEffect, useRef, useState } from "react";
import { isPerfLite, onPerfLite } from "./scrub/ScrollVideoProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { phaseAt } from "@/lib/scenePhases";

const FRAME_COUNT = 180;
const FRAME_WIDTH = 1536;
const FRAME_HEIGHT = 864;

type NetworkInformation = { saveData?: boolean };

const captionColors = [
  "text-emerald-300",
  "text-rose-300",
  "text-sky-300",
  "text-amber-300",
] as const;

function hasSaveData() {
  return (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection?.saveData === true;
}

export function ReelPanel() {
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const phase = phaseAt(progress).index;

  useEffect(() => {
    const panel = panelRef.current;
    const canvas = canvasRef.current;
    if (!panel || !canvas) return;
    const context = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });
    if (!context) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const saveData = hasSaveData();
    const frames: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
    const coarse = new Set<number>();
    const fine = new Set<number>();
    for (let index = 0; index < FRAME_COUNT; index++) {
      (index % 3 === 0 ? coarse : fine).add(index);
    }

    let staticMode = reducedMotion || isPerfLite();
    let started = staticMode;
    let fineUnlocked = false;
    let idleScheduled = false;
    let disposed = false;
    let activeLoads = 0;
    let targetFrame = 0;
    let drawnFrame = -1;
    let updateRaf = 0;
    const fallbackTimers = new Set<ReturnType<typeof setTimeout>>();

    const nearestLoaded = (index: number) => {
      if (frames[index]) return index;
      for (let distance = 1; distance < FRAME_COUNT; distance++) {
        if (index - distance >= 0 && frames[index - distance]) {
          return index - distance;
        }
        if (index + distance < FRAME_COUNT && frames[index + distance]) {
          return index + distance;
        }
      }
      return -1;
    };

    const draw = (force = false) => {
      const index = nearestLoaded(targetFrame);
      if (index < 0 || (!force && index === drawnFrame)) return;
      const image = frames[index];
      if (!image) return;
      drawnFrame = index;
      const scale = Math.min(
        canvas.width / FRAME_WIDTH,
        canvas.height / FRAME_HEIGHT,
      );
      const width = FRAME_WIDTH * scale;
      const height = FRAME_HEIGHT * scale;
      context.fillStyle = "#07111f";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        (canvas.width - width) / 2,
        (canvas.height - height) / 2,
        width,
        height,
      );
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = staticMode ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(bounds.width * dpr));
      canvas.height = Math.max(1, Math.round(bounds.height * dpr));
      draw(true);
    };

    const pickNearest = (pending: Set<number>) => {
      let best = -1;
      let bestDistance = Infinity;
      for (const index of pending) {
        const distance = Math.abs(index - targetFrame);
        if (distance < bestDistance) {
          best = index;
          bestDistance = distance;
        }
      }
      return best;
    };

    const runIdle = (callback: () => void) => {
      const idleWindow = window as Window & {
        requestIdleCallback?: (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions,
        ) => number;
      };
      if (idleWindow.requestIdleCallback) {
        idleWindow.requestIdleCallback(callback, { timeout: 1400 });
        return;
      }
      const timer = setTimeout(() => {
        fallbackTimers.delete(timer);
        callback();
      }, 500);
      fallbackTimers.add(timer);
    };

    const pump = () => {
      if (!started || disposed) return;
      while (activeLoads < 6) {
        const pending = coarse.size > 0 ? coarse : fineUnlocked ? fine : null;
        if (!pending || pending.size === 0) {
          if (
            !staticMode &&
            !saveData &&
            coarse.size === 0 &&
            activeLoads === 0 &&
            !fineUnlocked &&
            !idleScheduled
          ) {
            idleScheduled = true;
            runIdle(() => {
              if (disposed || staticMode) return;
              fineUnlocked = true;
              pump();
            });
          }
          return;
        }

        const index = pickNearest(pending);
        if (index < 0) return;
        pending.delete(index);
        const image = new Image();
        image.decoding = "async";
        activeLoads++;
        image.onload = () => {
          activeLoads--;
          if (disposed) return;
          frames[index] = image;
          if (
            drawnFrame < 0 ||
            Math.abs(index - targetFrame) <= Math.abs(drawnFrame - targetFrame)
          ) {
            draw(true);
          }
          pump();
        };
        image.onerror = () => {
          activeLoads--;
          pump();
        };
        image.src = `/scrub/${String(index).padStart(3, "0")}.webp`;
      }
    };

    const updateProgress = () => {
      updateRaf = 0;
      if (staticMode) return;
      const bounds = panel.getBoundingClientRect();
      const center = bounds.top + bounds.height / 2;
      const nextProgress = Math.min(
        1,
        Math.max(0, (window.innerHeight - center) / window.innerHeight),
      );
      targetFrame = Math.round(nextProgress * (FRAME_COUNT - 1));
      setProgress(nextProgress);
      draw();
      pump();
    };

    const scheduleUpdate = () => {
      if (!updateRaf) updateRaf = requestAnimationFrame(updateProgress);
    };

    const enterStaticMode = (updateCaption: boolean) => {
      staticMode = true;
      fineUnlocked = false;
      fine.clear();
      coarse.clear();
      targetFrame = 0;
      drawnFrame = -1;
      if (updateCaption) setProgress(0);
      if (frames[0]) {
        resize();
        return;
      }
      coarse.add(0);
      started = true;
      pump();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started) return;
        started = true;
        pump();
        observer.disconnect();
      },
      { rootMargin: "150% 0px" },
    );

    resize();
    if (staticMode) enterStaticMode(false);
    else observer.observe(panel);
    scheduleUpdate();

    const onResize = () => {
      resize();
      scheduleUpdate();
    };
    const offPerfLite = onPerfLite(() => enterStaticMode(true));
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(updateRaf);
      fallbackTimers.forEach((timer) => clearTimeout(timer));
      offPerfLite();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={panelRef} id="reel" className="w-full">
      <div className="hud-corners surface relative aspect-video overflow-hidden rounded-lg border border-white/12 shadow-[0_24px_80px_rgb(0_0_0/0.28)]">
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          aria-label={t.about.reelLead}
        />
      </div>

      <div className="mt-4 h-px overflow-hidden bg-white/10" aria-hidden="true">
        <div
          className="h-full origin-left bg-accent shadow-[0_0_12px_rgb(var(--accent-rgb)/0.7)]"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      <p
        className={`mt-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] ${captionColors[phase]}`}
        aria-live="polite"
      >
        {t.reel.captions[phase]}
      </p>
      <p className="mt-4 max-w-4xl text-sm leading-relaxed text-muted sm:text-base">
        {t.reel.description}
      </p>
    </div>
  );
}
