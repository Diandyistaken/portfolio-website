"use client";

import dynamic from "next/dynamic";

// Purely decorative, content-free chrome: skip SSR entirely, load after
// hydration. `ssr: false` requires a Client Component boundary, hence this
// small wrapper instead of dynamic-importing them straight from page.tsx.
const ClickSparks = dynamic(() => import("./ClickSparks").then((mod) => mod.ClickSparks), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor").then((mod) => mod.CustomCursor), { ssr: false });

export function ClientChrome() {
  return (
    <>
      <CustomCursor />
      <ClickSparks />
    </>
  );
}
