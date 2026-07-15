"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { isPerfLite, onPerfLite, useScrollVideo } from "../scrub/ScrollVideoProvider";
import { SceneContents } from "./SceneContents";

/**
 * ResizeObserver stand-in for R3F's measure hook: some embedded webviews
 * never deliver native RO callbacks, which would leave the canvas at its
 * 300×150 default forever. Wraps native RO when present and additionally
 * reports on window resize + once right after observe.
 */
class RobustResizeObserver implements ResizeObserver {
  private readonly callback: ResizeObserverCallback;
  private readonly native: ResizeObserver | null;
  private readonly targets = new Set<Element>();
  private readonly onWindowResize = () => this.notify();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    this.native =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(callback) : null;
  }

  observe(target: Element) {
    this.targets.add(target);
    this.native?.observe(target);
    if (this.targets.size === 1) {
      window.addEventListener("resize", this.onWindowResize);
    }
    setTimeout(() => this.notify(), 0);
  }

  unobserve(target: Element) {
    this.targets.delete(target);
    this.native?.unobserve(target);
    if (this.targets.size === 0) {
      window.removeEventListener("resize", this.onWindowResize);
    }
  }

  disconnect() {
    this.targets.clear();
    this.native?.disconnect();
    window.removeEventListener("resize", this.onWindowResize);
  }

  private notify() {
    if (this.targets.size === 0) return;
    // react-use-measure re-measures via getBoundingClientRect, so entry
    // contents only need the target reference.
    const entries = [...this.targets].map(
      (target) => ({ target } as unknown as ResizeObserverEntry)
    );
    this.callback(entries, this);
  }
}

export default function ScrollScene() {
  const [perfLite, setPerfLite] = useState(isPerfLite);
  const [ultrawide, setUltrawide] = useState(false);
  // R3F renders Canvas children in a separate reconciler tree, so the
  // ScrollVideoProvider context is NOT reachable inside <Canvas>. Subscribe
  // out here and hand a mutable ref across the bridge instead.
  const { subscribe } = useScrollVideo();
  const progressRef = useRef(0);

  useEffect(() => onPerfLite(() => setPerfLite(true)), []);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 2561px)");
    const updateUltrawide = () => setUltrawide(media.matches);
    updateUltrawide();
    media.addEventListener("change", updateUltrawide);
    return () => media.removeEventListener("change", updateUltrawide);
  }, []);
  useEffect(
    () =>
      subscribe((progress) => {
        progressRef.current = progress;
      }),
    [subscribe]
  );

  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        dpr={perfLite ? 1 : [1, ultrawide ? 1.25 : 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ fov: 60, position: [0, 0, 14] }}
        resize={{ polyfill: RobustResizeObserver as unknown as typeof ResizeObserver }}
      >
        <SceneContents particleCount={perfLite ? 8_000 : 24_000} progressRef={progressRef} />
      </Canvas>
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/35" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 52%, rgb(0 0 0 / 0.25) 100%)",
        }}
      />
    </div>
  );
}
