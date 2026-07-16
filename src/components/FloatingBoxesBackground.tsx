"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { accentAt } from "@/lib/scenePhases";

type ShapeKind = "box" | "icosahedron" | "torus" | "sphere";

type ShapeConfig = {
  kind: ShapeKind;
  basePosition: THREE.Vector3;
  size: number;
  trackAccent: boolean;
  wireframe: boolean;
  rotSpeed: [number, number, number];
  driftSpeed: number;
  driftPhase: number;
  driftAmp: number;
};

const NEUTRAL = new THREE.Color("#c9c7cf");
const SHAPE_COUNT = 28;
const LINK_DISTANCE = 3.1;

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 4_294_967_296;
  };
}

function buildShapes(count: number): ShapeConfig[] {
  const random = seededRandom(0x7ee0_1926);
  const kinds: ShapeKind[] = ["box", "icosahedron", "torus", "sphere"];
  return Array.from({ length: count }, (_, i) => ({
    kind: kinds[i % kinds.length],
    basePosition: new THREE.Vector3(
      (random() * 2 - 1) * 7.5,
      (random() * 2 - 1) * 4.2,
      -1 - random() * 5.5,
    ),
    size: 0.35 + random() * 0.85,
    trackAccent: i % 2 === 0,
    wireframe: i % 3 !== 0,
    rotSpeed: [
      (random() - 0.5) * 0.5,
      (random() - 0.5) * 0.5,
      (random() - 0.5) * 0.3,
    ],
    driftSpeed: 0.15 + random() * 0.25,
    driftPhase: random() * Math.PI * 2,
    driftAmp: 0.5 + random() * 0.9,
  }));
}

function geometryFor(kind: ShapeKind, size: number) {
  switch (kind) {
    case "box":
      return new THREE.BoxGeometry(size, size, size);
    case "icosahedron":
      return new THREE.IcosahedronGeometry(size * 0.7, 0);
    case "torus":
      return new THREE.TorusGeometry(size * 0.6, size * 0.18, 8, 20);
    case "sphere":
      return new THREE.SphereGeometry(size * 0.55, 12, 10);
  }
}

function Shapes({ progressRef }: { progressRef: React.RefObject<number> }) {
  const shapes = useMemo(() => buildShapes(SHAPE_COUNT), []);
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const materials = useMemo(
    () =>
      shapes.map(
        (s) =>
          new THREE.MeshBasicMaterial({
            color: s.trackAccent ? "#ffffff" : NEUTRAL,
            transparent: true,
            opacity: s.wireframe ? 0.55 : 0.28,
            wireframe: s.wireframe,
          }),
      ),
    [shapes],
  );
  const geometries = useMemo(
    () => shapes.map((s) => geometryFor(s.kind, s.size)),
    [shapes],
  );

  const linesRef = useRef<THREE.LineSegments>(null);
  const lineGeometry = useMemo(() => new THREE.BufferGeometry(), []);
  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({ transparent: true, opacity: 0.16, color: "#ffffff" }),
    [],
  );
  const linePositions = useMemo(
    () => new Float32Array(SHAPE_COUNT * SHAPE_COUNT * 6),
    [],
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const progress = progressRef.current;
    const [ar, ag, ab] = accentAt(progress);
    const accentColor = new THREE.Color(ar / 255, ag / 255, ab / 255);

    const positions: THREE.Vector3[] = [];

    shapes.forEach((shape, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      mesh.rotation.x += 0.01 * (1 + shape.rotSpeed[0]);
      mesh.rotation.y += 0.01 * (1 + shape.rotSpeed[1]);
      mesh.rotation.z += 0.005 * (1 + shape.rotSpeed[2]);

      const dx = Math.sin(time * shape.driftSpeed + shape.driftPhase) * shape.driftAmp;
      const dy = Math.cos(time * shape.driftSpeed * 0.8 + shape.driftPhase) * shape.driftAmp * 0.7;
      mesh.position.set(
        shape.basePosition.x + dx,
        shape.basePosition.y + dy,
        shape.basePosition.z,
      );
      positions.push(mesh.position);

      const material = materials[i];
      if (shape.trackAccent) {
        material.color.copy(accentColor);
      }
    });

    // Rebuild connection lines between nearby shapes (cheap at this count).
    let vertexCount = 0;
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dist = positions[i].distanceTo(positions[j]);
        if (dist < LINK_DISTANCE) {
          const o = vertexCount * 3;
          linePositions[o] = positions[i].x;
          linePositions[o + 1] = positions[i].y;
          linePositions[o + 2] = positions[i].z;
          linePositions[o + 3] = positions[j].x;
          linePositions[o + 4] = positions[j].y;
          linePositions[o + 5] = positions[j].z;
          vertexCount += 2;
        }
      }
    }
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions.subarray(0, vertexCount * 3), 3),
    );
    lineGeometry.setDrawRange(0, vertexCount);
    lineMaterial.color.copy(accentColor);
  });

  return (
    <>
      {shapes.map((shape, i) => (
        <mesh
          key={i}
          ref={(node) => {
            meshRefs.current[i] = node;
          }}
          position={shape.basePosition}
          geometry={geometries[i]}
          material={materials[i]}
        />
      ))}
      <lineSegments ref={linesRef} geometry={lineGeometry} material={lineMaterial} />
    </>
  );
}

/**
 * Ambient, non-interactive 3D backdrop: a dense field of drifting geometric
 * shapes (boxes, icosahedra, torii, spheres) connected by faint signal
 * lines, colored by the same scroll-driven accent sweep as the rest of the
 * page. Generated, not stock.
 */
export function FloatingBoxesBackground() {
  const progressRef = useScrollProgress();

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <Shapes progressRef={progressRef} />
      </Canvas>
    </div>
  );
}
