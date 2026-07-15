"use client";

import dynamic from "next/dynamic";
import { useRef, useSyncExternalStore } from "react";
import { isPerfLite } from "./scrub/ScrollVideoProvider";
import { VideoScrubCanvas } from "./scrub/VideoScrubCanvas";

const ScrollScene = dynamic(() => import("./three/ScrollScene"), {
  ssr: false,
  loading: () => <StaticBackground />,
});

type NetworkInformation = { saveData?: boolean };

function StaticBackground() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/scrub/000.webp"
      className="fixed inset-0 -z-10 h-full w-full object-cover"
      alt=""
      aria-hidden="true"
    />
  );
}

function detectUse3D() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2");
  const connection = (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection;
  const use3D =
    context !== null &&
    !isPerfLite() &&
    connection?.saveData !== true &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    Math.min(window.innerWidth, window.innerHeight) > 480;
  context?.getExtension("WEBGL_lose_context")?.loseContext();
  return use3D;
}

const emptySubscribe = () => () => {};

export function BackgroundLayer() {
  // Decided once per mount (not module-cached): a visitor who first loads in
  // a small window and later maximizes gets 3D again on the next visit/reload.
  const decision = useRef<boolean | null>(null);
  const use3D = useSyncExternalStore(
    emptySubscribe,
    () => (decision.current ??= detectUse3D()),
    () => null
  );

  if (use3D === null) return <StaticBackground />;
  return use3D ? <ScrollScene /> : <VideoScrubCanvas />;
}
