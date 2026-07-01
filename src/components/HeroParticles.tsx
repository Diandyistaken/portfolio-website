"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import type { Points as ThreePoints } from "three";
import { useTheme } from "./ThemeProvider";

function generateSpherePoints(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius * Math.cbrt(Math.random());
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

function ParticleField() {
  const ref = useRef<ThreePoints>(null);
  const { theme } = useTheme();
  const positions = useMemo(() => generateSpherePoints(1100, 4.2), []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.045;
    ref.current.rotation.x += delta * 0.012;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color={theme === "dark" ? "#8b7bff" : "#6d5bff"}
        size={0.028}
        sizeAttenuation
        depthWrite={false}
        opacity={theme === "dark" ? 0.85 : 0.55}
      />
    </Points>
  );
}

export default function HeroParticles() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      className="!absolute inset-0"
    >
      <ParticleField />
    </Canvas>
  );
}
