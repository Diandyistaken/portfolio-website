"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { accentAt, phaseAt } from "@/lib/scenePhases";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uPixelRatio;
  uniform float uScroll;
  uniform float uPulseStart;
  attribute vec3 aTarget0;
  attribute vec3 aTarget1;
  attribute vec3 aTarget2;
  attribute vec3 aTarget3;
  attribute vec3 aNoiseDir;
  attribute float aSize;
  attribute float aSeed;
  attribute float aAlpha;
  varying float vAlpha;
  varying float vPulse;

  vec3 targetAt(float phase) {
    if (phase < 0.5) return aTarget0;
    if (phase < 1.5) return aTarget1;
    if (phase < 2.5) return aTarget2;
    return aTarget3;
  }

  void main() {
    float phaseStart = floor(uPhase);
    vec3 pos = mix(targetAt(phaseStart), targetAt(min(3.0, phaseStart + 1.0)), fract(uPhase));
    float storm = 1.0 - min(1.0, abs(uPhase - 1.0));
    float amplitude = 0.08 + 0.42 * storm;
    float speed = 0.55 + aSeed * 0.8;
    pos += aNoiseDir * amplitude * sin(uTime * speed + aSeed * 18.0 + uScroll * 2.0);
    float elapsed = uTime - uPulseStart;
    float pulse = 0.0;
    if (elapsed > 0.0 && elapsed < 1.4) {
      pulse = sin(clamp(elapsed * 2.2 - length(pos) * 0.18, 0.0, 3.14159265))
        * 0.9 * (1.0 - elapsed / 1.4);
      pos += normalize(pos + vec3(0.0001)) * pulse;
    }
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * uPixelRatio * (25.3 / max(1.0, -mvPosition.z));
    vAlpha = aAlpha;
    vPulse = pulse;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  varying float vPulse;

  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.08, distanceToCenter) * vAlpha;
    if (alpha < 0.01) discard;
    vec3 color = mix(uColor, vec3(1.0), clamp(vPulse, 0.0, 1.0) * 0.35);
    gl_FragColor = vec4(color, alpha);
  }
`;

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 4_294_967_296;
  };
}

function setVector(buffer: Float32Array, index: number, x: number, y: number, z: number) {
  const offset = index * 3;
  buffer[offset] = x;
  buffer[offset + 1] = y;
  buffer[offset + 2] = z;
}

function buildParticleGeometry(count: number) {
  const random = seededRandom(0x5ec0_2026);
  const target0 = new Float32Array(count * 3);
  const target1 = new Float32Array(count * 3);
  const target2 = new Float32Array(count * 3);
  const target3 = new Float32Array(count * 3);
  const noiseDir = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const alphas = new Float32Array(count);
  const lattice = new THREE.IcosahedronGeometry(6, 2);
  const latticePositions = lattice.getAttribute("position");
  const triangleCount = latticePositions.count / 3;

  for (let i = 0; i < count; i++) {
    const triangle = Math.floor(random() * triangleCount) * 3;
    const edge = Math.floor(random() * 3);
    const a = triangle + edge;
    const b = triangle + ((edge + 1) % 3);
    const edgeT = random();
    const thickness = (random() - 0.5) * 0.12;
    const lx = THREE.MathUtils.lerp(latticePositions.getX(a), latticePositions.getX(b), edgeT);
    const ly = THREE.MathUtils.lerp(latticePositions.getY(a), latticePositions.getY(b), edgeT);
    const lz = THREE.MathUtils.lerp(latticePositions.getZ(a), latticePositions.getZ(b), edgeT);
    const length = Math.hypot(lx, ly, lz) || 1;
    setVector(target0, i, lx + (lx / length) * thickness, ly + (ly / length) * thickness, lz + (lz / length) * thickness);

    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const radius = 2 + 7 * Math.pow(random(), 0.55);
    const curlX = Math.sin(phi * 4 + theta * 3) * 1.4;
    const curlY = Math.cos(theta * 5 - phi * 2) * 1.2;
    const curlZ = Math.sin(theta * 2 - phi * 5) * 1.4;
    setVector(
      target1,
      i,
      radius * Math.sin(phi) * Math.cos(theta) + curlX,
      radius * Math.cos(phi) + curlY,
      radius * Math.sin(phi) * Math.sin(theta) + curlZ,
    );

    const isDomeCap = i % 10 === 0;
    const ring = i % 4;
    const ringRadius = 2.1 + ring * 1.45;
    const perimeter = random() * 6;
    const side = Math.floor(perimeter);
    const sideT = perimeter - side;
    const angleA = (side * Math.PI) / 3;
    const angleB = ((side + 1) * Math.PI) / 3;
    const capRadius = Math.sqrt(random()) * 1.8;
    const capAngle = random() * Math.PI * 2;
    const hx = isDomeCap
      ? Math.cos(capAngle) * capRadius
      : THREE.MathUtils.lerp(Math.cos(angleA), Math.cos(angleB), sideT) * ringRadius;
    const hy = isDomeCap
      ? Math.sin(capAngle) * capRadius
      : THREE.MathUtils.lerp(Math.sin(angleA), Math.sin(angleB), sideT) * ringRadius;
    const dome = 1.7 * (1 - Math.min(1, Math.hypot(hx, hy) / 7.2));
    setVector(target2, i, hx, hy * 0.92, dome + (random() - 0.5) * 0.18);

    const gx = (random() * 2 - 1) * 14.5;
    const gz = (random() * 2 - 1) * 6.5;
    const gy = -2 + Math.sin(gx * 0.58 + gz * 0.32) * 0.5 + (random() - 0.5) * 0.12;
    setVector(target3, i, gx, gy, gz);

    const nz = random() * 2 - 1;
    const na = random() * Math.PI * 2;
    const nr = Math.sqrt(1 - nz * nz);
    setVector(noiseDir, i, nr * Math.cos(na), nr * Math.sin(na), nz);
    sizes[i] = 1.6 + random() * 2.8;
    seeds[i] = random();
    alphas[i] = 0.5 + random() * 0.5;
  }
  lattice.dispose();

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(target0, 3));
  geometry.setAttribute("aTarget0", new THREE.BufferAttribute(target0, 3));
  geometry.setAttribute("aTarget1", new THREE.BufferAttribute(target1, 3));
  geometry.setAttribute("aTarget2", new THREE.BufferAttribute(target2, 3));
  geometry.setAttribute("aTarget3", new THREE.BufferAttribute(target3, 3));
  geometry.setAttribute("aNoiseDir", new THREE.BufferAttribute(noiseDir, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
  return geometry;
}

function buildDust() {
  const random = seededRandom(0xd057_0200);
  const positions = new Float32Array(200 * 3);
  for (let i = 0; i < 200; i++) {
    setVector(positions, i, (random() * 2 - 1) * 24, (random() * 2 - 1) * 12, -18 - random() * 8);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geometry;
}

function Dust({ progressRef }: { progressRef: React.RefObject<number> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const geometry = useMemo(() => buildDust(), []);
  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: 0xa9bdd8,
        size: 0.12,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    [],
  );

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.position.x = state.pointer.x * 0.35;
    pointsRef.current.position.y = state.pointer.y * 0.2 + progressRef.current * 0.4;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

const DISC_CONFIG = [
  { position: [-8, 3, 0] as const, size: 16, opacity: 0.07, speed: 0.035 },
  { position: [6, -2, -1] as const, size: 20, opacity: 0.05, speed: 0.028 },
  { position: [1, 5, -2] as const, size: 14, opacity: 0.09, speed: 0.023 },
] as const;

function Atmosphere({ progressRef }: { progressRef: React.RefObject<number> }) {
  const discCount = useThree((state) =>
    state.size.width > 2560 ? 2 : DISC_CONFIG.length,
  );
  const spritesRef = useRef<(THREE.Sprite | null)[]>([]);
  const materials = useMemo(
    () =>
      DISC_CONFIG.map(
        ({ opacity }) =>
          new THREE.SpriteMaterial({
            transparent: true,
            opacity,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
          }),
      ),
    [],
  );

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) return;
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.38)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    materials.forEach((material) => {
      material.map = texture;
      material.needsUpdate = true;
    });
    return () => texture.dispose();
  }, [materials]);

  useEffect(
    () => () => {
      materials.forEach((material) => material.dispose());
    },
    [materials],
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const [r, g, b] = accentAt(progressRef.current);
    materials.forEach((material) => {
      material.color.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    });
    DISC_CONFIG.slice(0, discCount).forEach((config, index) => {
      const sprite = spritesRef.current[index];
      if (!sprite) return;
      sprite.position.x = config.position[0] + Math.sin(time * config.speed + index * 2.1) * 0.8;
      sprite.position.y = config.position[1] + Math.cos(time * config.speed * 0.8 + index) * 0.55;
    });
  });

  return (
    <group position-z={-12}>
      {DISC_CONFIG.slice(0, discCount).map((config, index) => (
        <sprite
          key={index}
          ref={(node) => {
            spritesRef.current[index] = node;
          }}
          material={materials[index]}
          position={config.position}
          scale={[config.size, config.size, 1]}
          renderOrder={-1}
        />
      ))}
    </group>
  );
}

export function SceneContents({
  particleCount,
  progressRef,
}: {
  particleCount: number;
  progressRef: React.RefObject<number>;
}) {
  const { clock, gl } = useThree();
  const pointerTarget = useRef(new THREE.Vector2());
  const reducedMotion = useRef(false);
  const usePointer = useRef(false);
  const geometry = useMemo(() => buildParticleGeometry(particleCount), [particleCount]);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const particleGroupRef = useRef<THREE.Group>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPhase: { value: 0 },
      uColor: { value: new THREE.Color() },
      uPixelRatio: { value: 1 },
      uScroll: { value: 0 },
      uPulseStart: { value: -10 },
    }),
    [],
  );

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    usePointer.current = !reducedMotion.current && navigator.maxTouchPoints === 0 && !window.matchMedia("(pointer: coarse)").matches;
    const onPointerMove = (event: PointerEvent) => {
      pointerTarget.current.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    };
    const onPulse = () => {
      uniforms.uPulseStart.value = clock.elapsedTime;
    };
    if (usePointer.current) window.addEventListener("pointermove", onPointerMove, { passive: true });
    if (!reducedMotion.current) window.addEventListener("scene:pulse", onPulse);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scene:pulse", onPulse);
    };
  }, [clock, uniforms]);

  useEffect(() => () => {
    geometry.dispose();
  }, [geometry]);

  useFrame((state, delta) => {
    const material = materialRef.current;
    if (!material) return;
    const progress = progressRef.current;
    const phase = phaseAt(progress);
    const [r, g, b] = accentAt(progress);
    material.uniforms.uPhase.value = Math.min(3, phase.index + phase.t);
    material.uniforms.uColor.value.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    material.uniforms.uScroll.value = progress;
    if (!reducedMotion.current) material.uniforms.uTime.value = state.clock.elapsedTime;

    const smoothing = 1 - Math.exp(-4 * Math.min(delta, 0.1));
    const px = usePointer.current ? pointerTarget.current.x * 0.6 : 0;
    const py = usePointer.current ? pointerTarget.current.y * 0.35 : 0;
    if (particleGroupRef.current) {
      const groupX = state.size.width / state.size.height > 2 ? 2.2 : 0;
      particleGroupRef.current.position.x = THREE.MathUtils.lerp(
        particleGroupRef.current.position.x,
        groupX,
        smoothing,
      );
    }
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, px, smoothing);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, py + progress * 0.3, smoothing);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 14 - progress * 6, smoothing);
    state.camera.lookAt(0, progress * 0.15, 0);
  });

  return (
    <>
      <color attach="background" args={["#0a1526"]} />
      <fog attach="fog" args={["#0a1526", 16, 38]} />
      <Atmosphere progressRef={progressRef} />
      <group ref={particleGroupRef}>
        <points geometry={geometry} frustumCulled={false}>
          <shaderMaterial
            ref={materialRef}
            uniforms={uniforms}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
      <Dust progressRef={progressRef} />
    </>
  );
}
