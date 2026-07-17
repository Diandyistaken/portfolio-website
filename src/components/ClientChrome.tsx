"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { detectLowEndDevice, enablePerfLite } from "@/lib/perfLite";

// Purely decorative, content-free chrome: skip SSR entirely, load after
// hydration. `ssr: false` requires a Client Component boundary, hence this
// small wrapper instead of dynamic-importing them straight from page.tsx.
const ClickSparks = dynamic(() => import("./ClickSparks").then((mod) => mod.ClickSparks), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor").then((mod) => mod.CustomCursor), { ssr: false });
const AmbientField = dynamic(() => import("./AmbientField").then((mod) => mod.AmbientField), { ssr: false });
const RobotBuddy = dynamic(() => import("./RobotBuddy").then((mod) => mod.RobotBuddy), { ssr: false });
const EasterEgg = dynamic(() => import("./EasterEgg").then((mod) => mod.EasterEgg), { ssr: false });
const ProximityField = dynamic(() => import("./ProximityField").then((mod) => mod.ProximityField), { ssr: false });
const SectionRail = dynamic(() => import("./SectionRail").then((mod) => mod.SectionRail), { ssr: false });
const Achievements = dynamic(() => import("./Achievements").then((mod) => mod.Achievements), { ssr: false });
const OverdriveHud = dynamic(() => import("./OverdriveHud").then((mod) => mod.OverdriveHud), { ssr: false });
const ClearanceHud = dynamic(() => import("./ClearanceHud").then((mod) => mod.ClearanceHud), { ssr: false });

export function ClientChrome() {
  useEffect(() => {
    if (detectLowEndDevice()) enablePerfLite();
  }, []);

  return (
    <>
      <AmbientField />
      <CustomCursor />
      <ClickSparks />
      <RobotBuddy />
      <EasterEgg />
      <ProximityField />
      <SectionRail />
      <Achievements />
      <OverdriveHud />
      <ClearanceHud />
    </>
  );
}
