"use client";

import { useId } from "react";
import { m, useTransform, type MotionValue } from "framer-motion";

export type RobotExpression = "normal" | "wide" | "squint" | "sleep" | "happy" | "love";
export type RobotMouth = "normal" | "happy" | "flat" | "oh" | "sleep";

/**
 * Chibi companion. 120x152 viewBox, rendered at 105x133 css px.
 *
 * Landmarks (user units):
 *   antenna bulb (60,12) | head 18..102 x 26..90 | visor 27..93 x 36..78
 *   eyes (46,56) (74,56) | mouth pivot (60,70)   | torso 38..82 x 102..132
 *   core (60,115)        | hands (28,118) (92,118) | feet (49,139) (70,139)
 *
 * Rig rules -- breaking any of these silently kills the animation:
 *  1. A node carries EITHER a CSS keyframe transform OR a framer transform,
 *     never both: CSS animations outrank inline style, so the keyframe eats
 *     the motion value. `.rbt-patrol .rbt-pupil` is the one deliberate
 *     exception -- the idle scan is supposed to win over cursor tracking.
 *  2. Anything CSS rotates/scales is authored in absolute viewBox coords and
 *     gets `transform-box: view-box` + an explicit px transform-origin
 *     (globals.css). Never put a `transform` attribute on such a node.
 *  3. Only <m.g> carries motion transforms. On <path>/<text> framer's x/y
 *     collides with the geometry attributes.
 */

// Every eye path is `M` + 4x`C` + `Z` = 26 numbers with identical punctuation,
// which is what lets framer-motion morph one expression into the next. Keep
// that signature when adding a face or the morph degrades to a hard snap.
const EYE_PATHS: Record<RobotExpression, string> = {
  normal: "M0,-10 C6,-10 8,-5.5 8,0 C8,5.5 6,10 0,10 C-6,10 -8,5.5 -8,0 C-8,-5.5 -6,-10 0,-10 Z",
  wide:   "M0,-11.5 C7,-11.5 9.5,-6.3 9.5,0 C9.5,6.3 7,11.5 0,11.5 C-7,11.5 -9.5,6.3 -9.5,0 C-9.5,-6.3 -7,-11.5 0,-11.5 Z",
  squint: "M0,-2.6 C6.4,-2.6 8.6,-1.4 8.6,0 C8.6,1.4 6.4,2.6 0,2.6 C-6.4,2.6 -8.6,1.4 -8.6,0 C-8.6,-1.4 -6.4,-2.6 0,-2.6 Z",
  sleep:  "M0,-1.2 C6.4,-1.2 8.6,-0.6 8.6,0 C8.6,1.6 6.4,3.4 0,3.4 C-6.4,3.4 -8.6,1.6 -8.6,0 C-8.6,-0.6 -6.4,-1.2 0,-1.2 Z",
  happy:  "M0,-5.5 C6.4,-5.5 8.6,-1.1 8.6,3.5 C8.6,2.1 6.4,0.9 0,0.1 C-6.4,0.9 -8.6,2.1 -8.6,3.5 C-8.6,-1.1 -6.4,-5.5 0,-5.5 Z",
  love:   "M0,-6 C3,-11 10,-9.5 10,-4 C10,1.5 3,5.5 0,10 C-3,5.5 -10,1.5 -10,-4 C-10,-9.5 -3,-11 0,-6 Z",
};

// Same idea, open stroke: `M` + 2x`C` = 14 numbers.
const MOUTH_PATHS: Record<RobotMouth, string> = {
  normal: "M-8,0 C-4.4,1.4 -1.6,2 0,2 C1.6,2 4.4,1.4 8,0",
  happy:  "M-8,-1.8 C-4.6,3.6 -2,5.2 0,5.2 C2,5.2 4.6,3.6 8,-1.8",
  flat:   "M-7,0.6 C-3.8,0 -1.4,-0.2 0,-0.2 C1.4,-0.2 3.8,0 7,0.6",
  oh:     "M-5,-1 C-7.6,3.2 -3,6.6 0,6.6 C3,6.6 7.6,3.2 5,-1",
  sleep:  "M-4.5,0 C-2.4,0.6 -1,0.8 0,0.8 C1,0.8 2.4,0.6 4.5,0",
};

const MORPH = { duration: 0.24, ease: [0.16, 1, 0.3, 1] as const };
const SOLID_EYES: RobotExpression[] = ["sleep", "happy", "love"];

type Props = {
  expression: RobotExpression;
  mouth: RobotMouth;
  glyph: string | null;
  alerted: boolean;
  waving: boolean;
  patrol: boolean;
  signal: boolean;
  headX: MotionValue<number>;
  headY: MotionValue<number>;
  pupilX: MotionValue<number>;
  pupilY: MotionValue<number>;
};

export function RobotArt({
  expression,
  mouth,
  glyph,
  alerted,
  waving,
  patrol,
  signal,
  headX,
  headY,
  pupilX,
  pupilY,
}: Props) {
  // React 19 useId emits guillemets; strip everything that is not safe inside
  // a url(#...) fragment reference.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  // The torso trails the head on a poke and the two link dots interpolate
  // between them -- that is what sells the floating-parts rig.
  const bodyX = useTransform(headX, (v) => v * 0.28);
  const bodyY = useTransform(headY, (v) => v * 0.28);
  const linkAX = useTransform(headX, (v) => v * 0.62);
  const linkAY = useTransform(headY, (v) => v * 0.62);
  const linkBX = useTransform(headX, (v) => v * 0.42);
  const linkBY = useTransform(headY, (v) => v * 0.42);

  const awake = expression !== "sleep";
  const eyeD = EYE_PATHS[expression];
  const mouthD = MOUTH_PATHS[mouth];
  const showPupils = !SOLID_EYES.includes(expression);

  return (
    <svg
      viewBox="0 0 120 152"
      width={105}
      height={133}
      aria-hidden="true"
      focusable="false"
      className={`rbt block ${patrol ? "rbt-patrol" : ""}`}
      data-awake={awake ? "true" : "false"}
      data-alert={alerted ? "true" : "false"}
      data-signal={signal ? "true" : "false"}
      data-eyes={SOLID_EYES.includes(expression) ? "solid" : "lens"}
      data-blush={expression === "happy" || expression === "love" || expression === "wide" ? "true" : "false"}
    >
      <defs>
        <linearGradient id={`${uid}-shell`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" style={{ stopColor: "rgb(var(--surface))", stopOpacity: 1 }} />
          <stop offset="0.58" style={{ stopColor: "rgb(var(--surface))", stopOpacity: 0.97 }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--background-rgb))", stopOpacity: 1 }} />
        </linearGradient>
        <radialGradient id={`${uid}-visor`} cx="0.5" cy="0.36" r="0.78">
          <stop offset="0" style={{ stopColor: "rgb(var(--accent-rgb))", stopOpacity: 0.17 }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--background-rgb))", stopOpacity: 0.97 }} />
        </radialGradient>
        <linearGradient id={`${uid}-rim`} x1="0" y1="1" x2="0.9" y2="0">
          <stop offset="0" style={{ stopColor: "rgb(var(--accent-rgb))", stopOpacity: 0 }} />
          <stop offset="0.45" style={{ stopColor: "rgb(var(--accent-rgb))", stopOpacity: 0.55 }} />
          <stop offset="1" style={{ stopColor: "rgb(var(--foreground-rgb))", stopOpacity: 0.85 }} />
        </linearGradient>
        {/* One clipPath serves both eyes: clipPathUnits defaults to
            userSpaceOnUse, which resolves in the *referencing* element's user
            space -- i.e. inside each translate(46|74 56) group. */}
        <clipPath id={`${uid}-eye`}>
          <m.path initial={false} animate={{ d: eyeD }} transition={MORPH} />
        </clipPath>
        <clipPath id={`${uid}-visorclip`}>
          <rect x="27" y="36" width="66" height="42" rx="19" />
        </clipPath>
      </defs>

      {/* ── feet: planted, the rest of the robot floats above them ───────── */}
      <g className="rbt-foot rbt-foot--l">
        <rect className="rbt-limb" x="41.5" y="134" width="15" height="10" rx="5" />
      </g>
      <g className="rbt-foot rbt-foot--r">
        <rect className="rbt-limb" x="63.5" y="134" width="15" height="10" rx="5" />
      </g>

      {/* ── anti-grav link between head and torso ────────────────────────── */}
      <m.g style={{ x: linkAX, y: linkAY }}>
        <circle className="rbt-link" cx="60" cy="94" r="1.9" />
      </m.g>
      <m.g style={{ x: linkBX, y: linkBY }}>
        <circle className="rbt-link" cx="60" cy="98" r="1.4" opacity="0.75" />
      </m.g>

      {/* ── torso ────────────────────────────────────────────────────────── */}
      <m.g style={{ x: bodyX, y: bodyY }}>
        <g className="rbt-float-b">
          <path
            className="rbt-shell"
            fill={`url(#${uid}-shell)`}
            d="M50,102 H70 A12,12 0 0 1 82,114 V120 A12,12 0 0 1 70,132 H50 A12,12 0 0 1 38,120 V114 A12,12 0 0 1 50,102 Z"
          />
          <path className="rbt-rim" stroke={`url(#${uid}-rim)`} d="M38,118 V114 A12,12 0 0 1 50,102 H70" />
          <circle className="rbt-core-ring" cx="60" cy="115" r="9" />
          <circle className="rbt-core" cx="60" cy="115" r="6" />
          <path className="rbt-seam" d="M45,126 H75" />
        </g>
      </m.g>

      {/* ── hands: free-floating mittens, right one waves ────────────────── */}
      <g className="rbt-hand rbt-hand--l">
        <ellipse className="rbt-limb" cx="28" cy="118" rx="7" ry="6.4" />
        <circle className="rbt-limb-led" cx="28" cy="118" r="1.5" />
      </g>
      <g className={`rbt-hand rbt-hand--r ${waving ? "rbt-wave" : ""}`}>
        <ellipse className="rbt-limb" cx="92" cy="118" rx="7" ry="6.4" />
        <circle className="rbt-limb-led" cx="92" cy="118" r="1.5" />
      </g>

      {/* ── head assembly ────────────────────────────────────────────────── */}
      <m.g style={{ x: headX, y: headY }}>
        <g className="rbt-float">
          {/* ears (behind the shell) */}
          <g className="rbt-ear rbt-ear--l">
            <rect className="rbt-ear-shell" x="9.5" y="48" width="9.5" height="20" rx="4.75" />
            <circle className="rbt-ear-led" cx="14.2" cy="58" r="1.7" />
          </g>
          <g className="rbt-ear rbt-ear--r">
            <rect className="rbt-ear-shell" x="101" y="48" width="9.5" height="20" rx="4.75" />
            <circle className="rbt-ear-led" cx="105.8" cy="58" r="1.7" />
          </g>

          {/* antenna + signal rings */}
          <path className="rbt-wire" d="M60,27 C60,22 60,19 60,16" />
          <g className="rbt-signal">
            <path d="M53,10 Q60,2.5 67,10" />
            <path d="M49,12 Q60,-0.5 71,12" />
          </g>
          <circle className="rbt-bulb" cx="60" cy="12" r="3.6" />

          {/* shell */}
          <path
            className="rbt-shell"
            fill={`url(#${uid}-shell)`}
            d="M46,26 H74 A28,28 0 0 1 102,54 V68 A22,22 0 0 1 80,90 H40 A22,22 0 0 1 18,68 V54 A28,28 0 0 1 46,26 Z"
          />
          <path className="rbt-rim" stroke={`url(#${uid}-rim)`} d="M18,60 V54 A28,28 0 0 1 46,26 H74" />

          {/* visor */}
          <rect className="rbt-visor" x="27" y="36" width="66" height="42" rx="19" fill={`url(#${uid}-visor)`} />
          <g clipPath={`url(#${uid}-visorclip)`}>
            <rect className="rbt-scan" x="27" y="36" width="66" height="3.5" />
          </g>

          {/* cheeks */}
          <ellipse className="rbt-blush" cx="34" cy="68" rx="6" ry="3.4" />
          <ellipse className="rbt-blush" cx="86" cy="68" rx="6" ry="3.4" />

          {/* eyes: outer <g> owns the CSS blink, inner <g> only positions */}
          {([["l", 46], ["r", 74]] as const).map(([side, cx]) => (
            <g key={side} className={`rbt-eye rbt-eye--${side}`}>
              <g transform={`translate(${cx} 56)`}>
                <m.path className="rbt-lens" initial={false} animate={{ d: eyeD }} transition={MORPH} />
                {showPupils && (
                  <g clipPath={`url(#${uid}-eye)`}>
                    <m.g className="rbt-pupil" style={{ x: pupilX, y: pupilY }}>
                      {glyph ? (
                        <text
                          className="rbt-glyph font-mono"
                          x="0"
                          y="0"
                          fontSize="10"
                          textAnchor="middle"
                          dominantBaseline="central"
                        >
                          {glyph}
                        </text>
                      ) : (
                        <>
                          <circle className="rbt-pupil-core" r="3.9" />
                          <circle className="rbt-pupil-shine" cx="-1.5" cy="-1.9" r="1.15" />
                          <circle className="rbt-pupil-shine" cx="1.9" cy="1.7" r="0.6" opacity="0.6" />
                        </>
                      )}
                    </m.g>
                  </g>
                )}
              </g>
            </g>
          ))}

          {/* mouth */}
          <g transform="translate(60 70)">
            <m.path className="rbt-mouth" initial={false} animate={{ d: mouthD }} transition={MORPH} />
          </g>
        </g>
      </m.g>
    </svg>
  );
}
