"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { usePerfLite } from "./SectionBackdrop";
import { RobotChat } from "./RobotChat";
import { RobotArt, type RobotExpression, type RobotMouth } from "./RobotArt";
import { useRobotRoam, anchorFor, pickWaypoint, BODY_W } from "./useRobotRoam";
import { RobotEmotes, type EmoteAction } from "./RobotEmotes";

const TRUST_KEY = "mm-trust-v1";
const DISMISS_KEY = "mm-robot-dismissed-v1";

// pupils morph into a section glyph — the robot visibly reads along
const MOOD_GLYPH: Record<"classified" | "about" | "goals", string> = {
  classified: "+",
  about: ">",
  goals: "▲",
};

/**
 * #108 (+#65, merged into ONE drone): a tiny one-eyed drone hovers beside the
 * robot on an idle CSS bob, lags scroll on a soft spring, can be grabbed and
 * tossed (it boomerangs back on the drag spring), and barrel-rolls when
 * clicked. The section-scan flavor of #65 was absorbed into this single unit.
 */
function Drone() {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const lag = useSpring(useTransform(velocity, [-3000, 3000], [14, -14], { clamp: true }), {
    stiffness: 90,
    damping: 9,
  });
  const [rollKey, setRollKey] = useState(0);
  const draggedRef = useRef(false);

  return (
    <m.div
      aria-hidden="true"
      drag
      dragSnapToOrigin
      dragElastic={0.3}
      dragConstraints={{ left: -120, right: 60, top: -140, bottom: 40 }}
      dragTransition={{ bounceStiffness: 240, bounceDamping: 9 }}
      whileDrag={{ scale: 1.2 }}
      onDragEnd={() => {
        draggedRef.current = true;
        setTimeout(() => {
          draggedRef.current = false;
        }, 150);
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (draggedRef.current) return;
        setRollKey((key) => key + 1);
      }}
      style={{ y: lag }}
      className="drone-bob absolute -left-14 top-0 cursor-grab touch-none active:cursor-grabbing"
    >
      <m.div
        key={rollKey}
        animate={rollKey > 0 ? { rotate: [0, 360] } : undefined}
        transition={{ duration: 0.55, ease: "easeInOut" }}
        className="flex flex-col items-center"
      >
        {/* rotors */}
        <span className="flex gap-1.5">
          <span className="drone-rotor h-[2px] w-3 rounded-full bg-accent/60" />
          <span className="drone-rotor h-[2px] w-3 rounded-full bg-accent/60" />
        </span>
        {/* body + eye */}
        <span className="mt-[1px] flex h-3.5 w-5 items-center justify-center rounded-md border border-accent/50 bg-[rgb(var(--surface)/0.95)]">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_rgb(var(--accent-rgb)/0.9)]" />
        </span>
      </m.div>
    </m.div>
  );
}

/** Cursor within this many px of the mascot's centre = "you are reaching for
 *  me": it stops and waits to be clicked instead of dodging. */
const REACH_PX = 150;
/** Shared vertical gate for both "reaching" and "sidestep" — see onMove. */
const LANE_Y = 0.72;
/** A sidestep is a single polite hop, not a continuous shove. */
const DODGE_PX = 64;
const DODGE_COOLDOWN_MS = 900;

const PATROL_AFTER_MS = 7000;
const SENTRY_AFTER_MS = 14000;
const SLEEP_AFTER_MS = 26000;
const BUBBLE_MS = 3400;
const MAX_TILT = 17;

/**
 * Corner robot companion, v2: pops in with a wave and a greeting so nobody
 * misses it, tracks the cursor with big expressive eyes (3D head tilt +
 * pupils + a soft ground shadow that slides with the tilt), leans against
 * fast scrolling, patrols with its eyes when you idle, dozes off if you
 * leave, and chats when clicked. Fine-pointer desktops only.
 */
export function RobotBuddy() {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();
  const rootRef = useRef<HTMLDivElement>(null);

  const [enabled, setEnabled] = useState(false);
  // Dismissal sticks across reloads — a visitor who closed the mascot once
  // should not have to close it again on every page view.
  // Read straight into the initial state: this component is mounted with
  // `dynamic(..., { ssr: false })`, so there is no server render to mismatch,
  // and doing it here avoids the mascot flashing in before an effect hides it.
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      // storage blocked — mascot simply stays visible
      return false;
    }
  });
  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  };
  const [sleeping, setSleeping] = useState(false);
  const [patrol, setPatrol] = useState(false);
  const [sentry, setSentry] = useState(false);
  const sentryOnRef = useRef(false);
  const [waving, setWaving] = useState(false);
  const [squint, setSquint] = useState(false);
  const squintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [bubble, setBubble] = useState<string | null>(null);
  const [alerted, setAlerted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  // Section moods: pupils morph per section (crosshair in classified, ">"
  // at the terminal, arrow at goals) — the robot visibly reads along.
  const [sectionMood, setSectionMood] = useState<"default" | "classified" | "about" | "goals">("default");
  // Eyes widen when the cursor gets close — makes the tracking unmissable.
  const [near, setNear] = useState(false);
  const [hovered, setHovered] = useState(false);
  const nearRef = useRef(false);

  // Mascot roaming: the robot lives in a zero-height lane pinned to the bottom
  // of the viewport and walks along it. All motion is driven by motion values
  // inside the hook, so wandering never triggers a React render.
  const roamActive = enabled && !dismissed && !reducedMotion && !perfLite;
  const roam = useRobotRoam(roamActive);
  // The body is never mirrored with scaleX (that would invert rotateY and
  // pupilX), but `facing` still drives --robot-dir so the run trail streams
  // out behind the robot instead of always to the same side.
  const { x, bobY, lean, mode, modeRef, facing, setMode } = roam;
  const lastDodge = useRef(0);
  /** While `performance.now()` is below this, deliberate commands win over the
   *  cursor-proximity guards. */
  const commandUntil = useRef(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [trick, setTrick] = useState(0);
  const sectionRef = useRef<string>("");
  const sectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flinchedRef = useRef(false);

  // Head rotation + pupil offset follow the cursor through springs; the
  // shadow slides opposite the head tilt for a cheap depth cue.
  const rotateX = useSpring(0, { stiffness: 120, damping: 14 });
  const rotateY = useSpring(0, { stiffness: 120, damping: 14 });
  const pupilX = useSpring(0, { stiffness: 170, damping: 15 });
  const pupilY = useSpring(0, { stiffness: 170, damping: 15 });
  const shadowX = useTransform(rotateY, [-MAX_TILT, MAX_TILT], [7, -7]);

  // #9 pokeable head: drag the head around on a stiff spring; on release it
  // snaps back with overshoot while the eyes lag a beat behind on a softer
  // spring (jelly). A hard flick triggers a dizzy wobble + squint-blink.
  const headDX = useSpring(0, { stiffness: 380, damping: 15 });
  const headDY = useSpring(0, { stiffness: 380, damping: 15 });
  const eyeLagX = useSpring(headDX, { stiffness: 130, damping: 10 });
  const eyeLagY = useSpring(headDY, { stiffness: 130, damping: 10 });
  // Values feed SVG user units now (~0.875 css px each), so the overshoot is
  // rescaled: at the old 0.6 a poke threw the pupil ±18 units and it clipped
  // straight out of the eye lens.
  const jellyX = useTransform([headDX, eyeLagX], (values: number[]) => (values[1] - values[0]) * 0.22);
  const jellyY = useTransform([headDY, eyeLagY], (values: number[]) => (values[1] - values[0]) * 0.22);
  const pupilRenderX = useTransform([pupilX, jellyX], (values: number[]) => values[0] + values[1]);
  const pupilRenderY = useTransform([pupilY, jellyY], (values: number[]) => values[0] + values[1]);
  const pokeState = useRef({ active: false, moved: false, startX: 0, startY: 0 });
  const [dizzy, setDizzy] = useState(false);
  const dizzyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Fine pointer + hover only — there is no cursor to follow on touch.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const wide = window.matchMedia("(min-width: 1024px)");
    const update = () => setEnabled(fine.matches && wide.matches);
    update();
    fine.addEventListener("change", update);
    wide.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      wide.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled || dismissed) return;
    const moodMap: Record<string, "classified" | "about" | "goals"> = {
      classified: "classified",
      about: "about",
      goals: "goals",
    };
    const sections = document.querySelectorAll<HTMLElement>("main section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).id;
          setSectionMood(moodMap[id] ?? "default");

          // Walk over to the new section and pause to "read" it. Debounced so
          // scrolling past ten sections doesn't fire ten walks.
          if (id === sectionRef.current) continue;
          sectionRef.current = id;
          if (!roamActive) continue;
          if (sectionTimer.current) clearTimeout(sectionTimer.current);
          sectionTimer.current = setTimeout(() => {
            const current = modeRef.current;
            if (current === "chatting" || current === "sleeping" || current === "parked") return;
            setMode("observe", anchorFor(id));
          }, 600);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [enabled, dismissed, roamActive, modeRef, setMode]);

  useEffect(() => {
    if (!enabled || dismissed || reducedMotion || perfLite) return;

    let raf = 0;
    let patrolTimer: ReturnType<typeof setTimeout> | null = null;
    let sentryTimer: ReturnType<typeof setTimeout> | null = null;
    let sleepTimer: ReturnType<typeof setTimeout> | null = null;
    let lastScrollY = window.scrollY;
    let scrollResetTimer: ReturnType<typeof setTimeout> | null = null;

    const armIdleTimers = () => {
      if (patrolTimer) clearTimeout(patrolTimer);
      if (sentryTimer) clearTimeout(sentryTimer);
      if (sleepTimer) clearTimeout(sleepTimer);
      patrolTimer = setTimeout(() => setPatrol(true), PATROL_AFTER_MS);
      sentryTimer = setTimeout(() => {
        sentryOnRef.current = true;
        setSentry(true);
      }, SENTRY_AFTER_MS);
      sleepTimer = setTimeout(() => {
        setPatrol(false);
        setSentry(false);
        sentryOnRef.current = false;
        setSleeping(true);
      }, SLEEP_AFTER_MS);
    };

    const onMove = (event: MouseEvent) => {
      setSleeping(false);
      setPatrol(false);
      // #20 sentry: if the robot was scanning, "detect" the returning cursor
      if (sentryOnRef.current) {
        sentryOnRef.current = false;
        setSentry(false);
        if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
        setBubble(t.robot.sentryMessage);
        bubbleTimer.current = setTimeout(() => setBubble(null), 1800);
      } else {
        setSentry(false);
      }
      armIdleTimers();
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const root = rootRef.current;
        if (!root) return;
        const bounds = root.getBoundingClientRect();
        const cx = bounds.left + bounds.width / 2;
        const cy = bounds.top + bounds.height / 2;
        const dx = (event.clientX - cx) / window.innerWidth;
        const dy = (event.clientY - cy) / window.innerHeight;
        rotateY.set(Math.max(-MAX_TILT, Math.min(MAX_TILT, dx * MAX_TILT * 2.6)));
        rotateX.set(Math.max(-MAX_TILT, Math.min(MAX_TILT, -dy * MAX_TILT * 2.6)));

        // Target-lock: tracking gain rises as the cursor closes in — lazy
        // glance from afar, wide-eyed stare up close, startled "!" at <70px.
        // #103: a trusted robot tracks wider and from further away.
        const distance = Math.hypot(event.clientX - cx, event.clientY - cy);
        const nearRadius = trustRef.current >= 8 ? 340 : 280;
        const gain = distance < nearRadius ? (trustRef.current >= 8 ? 1.9 : 1.6) : 1;
        // lens is 8x10 user units with a r=3.9 pupil — clamp so it kisses the
        // rim instead of being clipped away
        pupilX.set(Math.max(-4.2, Math.min(4.2, dx * 14 * gain)));
        pupilY.set(Math.max(-4.8, Math.min(4.8, dy * 11 * gain)));

        const isNear = distance < nearRadius;
        if (isNear !== nearRef.current) {
          nearRef.current = isNear;
          setNear(isNear);
          if (!isNear) flinchedRef.current = false;
        }

        // Roaming: come stand beside the cursor when it drops into the lane —
        // but never under it, and go click-through if the visitor is actually
        // reaching for something the robot is standing on.
        // Reaching for the mascot must always win. Both branches share ONE
        // vertical threshold on purpose: when they differed there was a band
        // where the cursor was already over the robot and it still slid away,
        // which made it impossible to click.
        const robotCenter = x.get() + BODY_W / 2;
        const inLane = event.clientY > window.innerHeight * LANE_Y;
        const reaching = inLane && Math.abs(event.clientX - robotCenter) < REACH_PX;

        // An explicit command (menu action) outranks both guards for a beat —
        // otherwise "come here" is instantly cancelled by the proximity park,
        // because clicking the menu item moves the cursor next to the robot.
        const commanded = performance.now() < commandUntil.current;

        if (reaching && !commanded) {
          const current = modeRef.current;
          if (current !== "chatting" && current !== "parked") {
            setMode("parked", x.get()); // hold position: it is being aimed at
          }
        } else if (inLane && !commanded) {
          const current = modeRef.current;
          const now = performance.now();
          // One-shot sidestep with a cooldown. Re-issuing the target every
          // frame turned a polite "excuse me" into a continuous shove.
          if (
            now - lastDodge.current > DODGE_COOLDOWN_MS &&
            (current === "idle" || current === "stroll" || current === "observe" || current === "parked")
          ) {
            lastDodge.current = now;
            const side = event.clientX > robotCenter ? -DODGE_PX : DODGE_PX;
            setMode("follow", x.get() + side);
          }
        }
        if (distance < 70 && !flinchedRef.current) {
          flinchedRef.current = true;
          if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
          setBubble("!");
          bubbleTimer.current = setTimeout(() => setBubble(null), 900);
        }
      });
    };

    // Lean against fast scrolling, then spring back upright. #17: on a hard
    // scroll the robot also squints its eyes into wind-lines for a beat.
    const onScroll = () => {
      const delta = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      if (Math.abs(delta) < 24) return;
      rotateX.set(Math.max(-12, Math.min(12, delta * 0.12)));
      if (scrollResetTimer) clearTimeout(scrollResetTimer);
      scrollResetTimer = setTimeout(() => rotateX.set(0), 180);
      if (Math.abs(delta) > 60) {
        setSquint(true);
        if (squintTimer.current) clearTimeout(squintTimer.current);
        squintTimer.current = setTimeout(() => setSquint(false), 260);
      }
    };

    armIdleTimers();
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (patrolTimer) clearTimeout(patrolTimer);
      if (sentryTimer) clearTimeout(sentryTimer);
      if (sleepTimer) clearTimeout(sleepTimer);
      if (scrollResetTimer) clearTimeout(scrollResetTimer);
    };
  }, [enabled, dismissed, reducedMotion, perfLite, rotateX, rotateY, pupilX, pupilY, t]);

  // Entry greeting: wave + intro bubble shortly after the robot pops in, so
  // visitors discover both the robot and its cursor-tracking eyes.
  useEffect(() => {
    if (!enabled || dismissed || reducedMotion || perfLite) return;
    const timer = setTimeout(() => {
      setWaving(true);
      setBubble(t.robot.introMessage);
      waveTimer.current = setTimeout(() => setWaving(false), 2300);
      bubbleTimer.current = setTimeout(() => setBubble(null), BUBBLE_MS + 800);
    }, 2400);
    return () => clearTimeout(timer);
  }, [enabled, dismissed, reducedMotion, perfLite, t]);

  // #103 trust meter: a hidden affinity score (petting + achievements) that
  // quietly upgrades behavior — wider tracking gain past 8, an occasional
  // ice-blue heart blink past 18. Never shown as a number.
  const trustRef = useRef(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        trustRef.current = Number(localStorage.getItem(TRUST_KEY) ?? 0) || 0;
      } catch {
        // ignore
      }
    });
    const bump = (amount: number) => () => {
      trustRef.current = Math.min(30, trustRef.current + amount);
      try {
        localStorage.setItem(TRUST_KEY, String(trustRef.current));
      } catch {
        // ignore
      }
    };
    const onPet = bump(1);
    const onAchievement = bump(2);
    window.addEventListener("app:robot-click", onPet);
    window.addEventListener("app:achievement-unlocked", onAchievement);
    // heart blink: rare, only at high trust, only while awake
    const heart = setInterval(() => {
      if (trustRef.current < 18) return;
      if (bubbleTimer.current) return; // don't stomp an active bubble
      setBubble("♥");
      bubbleTimer.current = setTimeout(() => {
        setBubble(null);
        bubbleTimer.current = null;
      }, 900);
    }, 24000);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("app:robot-click", onPet);
      window.removeEventListener("app:achievement-unlocked", onAchievement);
      clearInterval(heart);
    };
  }, []);

  // Cross-toy reactions: treat catches (#63), sentry high-five (#119), vault
  // celebration (#67), recruiter salute (#106). Terminal-artifact one-liners.
  useEffect(() => {
    const say = (line: string, wave = false) => {
      setSleeping(false);
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      setBubble(line);
      bubbleTimer.current = setTimeout(() => setBubble(null), 2600);
      if (wave) {
        if (waveTimer.current) clearTimeout(waveTimer.current);
        setWaving(true);
        waveTimer.current = setTimeout(() => setWaving(false), 2300);
      }
    };
    const onTreat = () => say("nom. 64 bytes.");
    const onSentryWin = () => say("3/3 — high-five. ✋", true);
    const onVault = () => say("all 5 keys?! respect._", true);
    const onRecruiter = () => say("recruiter detected. presenting credentials_", true);
    window.addEventListener("app:treat-catch", onTreat);
    window.addEventListener("app:sentry-win", onSentryWin);
    window.addEventListener("app:vault-open", onVault);
    window.addEventListener("app:recruiter-mode", onRecruiter);
    return () => {
      window.removeEventListener("app:treat-catch", onTreat);
      window.removeEventListener("app:sentry-win", onSentryWin);
      window.removeEventListener("app:vault-open", onVault);
      window.removeEventListener("app:recruiter-mode", onRecruiter);
    };
  }, []);

  // Site-wide easter egg hook: EasterEgg dispatches this when "hack" is
  // typed. Bubble logic is inlined so the effect only closes over `t`.
  useEffect(() => {
    const onHack = () => {
      setSleeping(false);
      setAlerted(true);
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      setBubble(t.robot.hackMessage);
      bubbleTimer.current = setTimeout(() => setBubble(null), BUBBLE_MS);
      setTimeout(() => setAlerted(false), 2600);
    };
    const onHoneypot = () => {
      setSleeping(false);
      setAlerted(true);
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      setBubble(t.robot.honeypotMessage);
      bubbleTimer.current = setTimeout(() => setBubble(null), BUBBLE_MS);
      setTimeout(() => setAlerted(false), 2600);
    };
    window.addEventListener("app:hack-egg", onHack);
    window.addEventListener("app:honeypot", onHoneypot);
    return () => {
      window.removeEventListener("app:hack-egg", onHack);
      window.removeEventListener("app:honeypot", onHoneypot);
    };
  }, [t]);

  useEffect(() => {
    return () => {
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      if (waveTimer.current) clearTimeout(waveTimer.current);
      if (squintTimer.current) clearTimeout(squintTimer.current);
      if (dizzyTimer.current) clearTimeout(dizzyTimer.current);
    };
  }, []);

  // #9 poke handlers: pointer-drag the head, physics handles the rest.
  const onPokeDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (reducedMotion || perfLite) return;
    if (window.matchMedia("(hover: none)").matches) return;
    pokeState.current = { active: true, moved: false, startX: event.clientX, startY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPokeMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = pokeState.current;
    if (!state.active) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (Math.hypot(dx, dy) > 7) state.moved = true;
    if (!state.moved) return;
    event.preventDefault();
    headDX.set(Math.max(-30, Math.min(30, dx * 0.8)));
    headDY.set(Math.max(-24, Math.min(24, dy * 0.8)));
  };
  const onPokeUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const state = pokeState.current;
    if (!state.active) return;
    state.active = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }
    const speed = Math.hypot(headDX.getVelocity(), headDY.getVelocity());
    headDX.set(0);
    headDY.set(0);
    if (state.moved && speed > 900) {
      setDizzy(true);
      setSquint(true);
      if (dizzyTimer.current) clearTimeout(dizzyTimer.current);
      dizzyTimer.current = setTimeout(() => {
        setDizzy(false);
        setSquint(false);
      }, 950);
    }
  };

  // Wander: chain waypoints on a jittered timer so the idle robot drifts along
  // the lane instead of standing in one corner forever.
  useEffect(() => {
    if (!roamActive) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        () => {
          const current = modeRef.current;
          if (current === "idle" || current === "stroll") {
            setMode("stroll", pickWaypoint(chatOpen));
          }
          schedule();
        },
        4200 + Math.random() * 4800,
      );
    };
    schedule();
    return () => clearTimeout(timer);
  }, [roamActive, chatOpen, modeRef, setMode]);

  // Fast scrolling: the robot runs to catch up with the section you landed on.
  useEffect(() => {
    if (!roamActive) return;
    let last = window.scrollY;
    let lastTime = performance.now();
    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(16, now - lastTime);
      const speed = (Math.abs(window.scrollY - last) / dt) * 1000;
      last = window.scrollY;
      lastTime = now;
      const current = modeRef.current;
      if (current === "chatting" || current === "parked") return;
      if (speed > 900) {
        setMode("chase", anchorFor(sectionRef.current));
        if (chaseTimer.current) clearTimeout(chaseTimer.current);
        chaseTimer.current = setTimeout(() => {
          if (modeRef.current === "chase") setMode("stroll", pickWaypoint(chatOpen));
        }, 420);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (chaseTimer.current) clearTimeout(chaseTimer.current);
    };
  }, [roamActive, chatOpen, modeRef, setMode]);

  // Opening the chat parks the robot beside its panel instead of leaving it
  // wandering off behind the dialog.
  useEffect(() => {
    if (!roamActive) return;
    if (chatOpen) setMode("chatting", window.innerWidth - BODY_W - 28);
    else setMode("stroll", pickWaypoint(false));
  }, [chatOpen, roamActive, setMode]);

  useEffect(() => {
    return () => {
      if (sectionTimer.current) clearTimeout(sectionTimer.current);
    };
  }, []);

  // #19 wave goodbye: when the footer scrolls into view, the robot waves once.
  useEffect(() => {
    if (!enabled || dismissed || reducedMotion || perfLite) return;
    const footer = document.querySelector("footer");
    if (!footer) return;
    let done = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (done || !entries[0]?.isIntersecting) return;
        done = true;
        setWaving(true);
        if (waveTimer.current) clearTimeout(waveTimer.current);
        waveTimer.current = setTimeout(() => setWaving(false), 2300);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, [enabled, dismissed, reducedMotion, perfLite]);

  const handleClick = () => {
    // a drag that moved the head is a poke, not a click — don't open chat
    if (pokeState.current.moved) {
      pokeState.current.moved = false;
      return;
    }
    window.dispatchEvent(new Event("app:robot-click"));
    if (sleeping) {
      setSleeping(false);
      return;
    }
    if (waveTimer.current) clearTimeout(waveTimer.current);
    setWaving(true);
    waveTimer.current = setTimeout(() => setWaving(false), 2300);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setBubble(null);
    // big form: clicking toggles the full-body chat companion
    setChatOpen((value) => !value);
  };


  // --robot-dir drives which side the run trail streams from. MotionStyle has
  // no CSS-variable slot in this framer version, so it is written directly.
  useEffect(() => {
    rootRef.current?.style.setProperty("--robot-dir", String(facing));
  }, [facing]);

  /** Every trick the mascot can do, reachable from the visible menu. */
  const runEmote = (action: EmoteAction) => {
    setMenuOpen(false);
    // hold the proximity guards off long enough for the command to play out
    commandUntil.current = performance.now() + 2600;
    switch (action) {
      case "chat":
        setChatOpen(true);
        break;
      case "wave":
        setSleeping(false);
        if (waveTimer.current) clearTimeout(waveTimer.current);
        setWaving(true);
        waveTimer.current = setTimeout(() => setWaving(false), 2300);
        break;
      case "come": {
        // walk to the middle of the lane, in front of the reader
        setSleeping(false);
        const middle = window.innerWidth / 2 - BODY_W / 2;
        setMode("chase", middle);
        break;
      }
      case "trick":
        setSleeping(false);
        setTrick((n) => n + 1);
        break;
      case "sleep":
        setSleeping(true);
        setMode("sleeping", x.get());
        break;
    }
  };

  // Face state, most specific first. `bubble === "♥"` is the high-trust heart
  // blink — the eyes answer it instead of just showing a bubble.
  const expression: RobotExpression = sleeping
    ? "sleep"
    : bubble === "♥"
      ? "love"
      : squint || dizzy
        ? "squint"
        : waving || chatOpen
          ? "happy"
          : near
            ? "wide"
            : "normal";

  // The mouth is deliberately decoupled from the eyes: cursor proximity should
  // widen the eyes without freezing the mouth into a permanent surprised "o".
  const mouth: RobotMouth = sleeping
    ? "sleep"
    : alerted
      ? "oh"
      : waving || chatOpen || hovered || expression === "love"
        ? "happy"
        : squint || dizzy
          ? "flat"
          : "normal";

  if (!enabled || dismissed || reducedMotion || perfLite) return null;

  return (
    <>
    <RobotChat open={chatOpen} onClose={() => setChatOpen(false)} />
    {/* Patrol lane: h-0 so it adds nothing to layout, pointer-events-none so
        it never swallows a click — only [data-robot-hit] nodes are clickable. */}
    <div className="robot-lane pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden h-0 lg:block">
    <m.div
      ref={rootRef}
      data-roam-mode={mode}
      style={{ x, y: bobY, rotate: lean, perspective: 400 }}
      className={`group/robot robot-roamer absolute bottom-6 left-0 ${
        mode === "chase" ? "robot-trail" : ""
      }`}
    >
      {/* #108 the companion drone */}
      <Drone />
      {sentry && !sleeping && (
        <m.span
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, rotate: 360 }}
          exit={{ opacity: 0 }}
          transition={{ rotate: { duration: 3, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.4 } }}
          className="pointer-events-none absolute -left-8 -top-8 -z-10 h-32 w-32 rounded-full"
          style={{ background: "conic-gradient(from 0deg, rgb(var(--accent-rgb) / 0.18), transparent 45deg)" }}
        />
      )}
      <AnimatePresence>
        {bubble && (
          <m.div
            key={bubble}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="surface absolute bottom-full right-0 mb-3 w-max max-w-[15rem] rounded-lg rounded-br-sm px-3.5 py-2 font-mono text-[0.68rem] leading-relaxed text-foreground/90"
          >
            {bubble}
          </m.div>
        )}
      </AnimatePresence>

      {sleeping && (
        <span
          aria-hidden="true"
          className="absolute -top-4 right-1 font-mono text-xs text-muted"
          title={t.robot.sleepingMessage}
        >
          z<span className="text-[0.6rem]">z</span>
          <span className="text-[0.5rem]">z</span>
        </span>
      )}

      <m.button
        type="button"
        onClick={handleClick}
        onPointerDown={onPokeDown}
        onPointerMove={onPokeMove}
        onPointerUp={onPokeUp}
        onPointerCancel={onPokeUp}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={t.robot.label}
        data-robot-hit
        initial={{ opacity: 0, y: 46, scale: 0.6 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 17, delay: 1.4 }}
        style={{ touchAction: "none" }}
        // cursor-pointer, not grab: "grab" advertises dragging, which is not
        // what a click does here — visitors read it as "this isn't a button".
        className="relative block cursor-pointer rounded-2xl outline-none ring-0 transition-[box-shadow] hover:ring-2 hover:ring-accent/40 focus-visible:ring-2 focus-visible:ring-accent/70"
      >
        {/* 3D tilt stays on the html wrapper: 3D transforms on SVG <g> are not
            reliable across browsers. Everything inside the svg is 2D. */}
        <m.div
          key={trick}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          animate={
            trick > 0
              ? { rotate: [0, -360], y: [0, -34, 0], scaleY: [1, 0.86, 1.08, 1] }
              : alerted
                ? { x: [0, -3, 3, -3, 3, 0] }
                : dizzy
                  ? { rotate: [0, -10, 8, -6, 4, 0] }
                  : undefined
          }
          transition={
            trick > 0
              ? { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
              : alerted
                ? { duration: 0.45 }
                : dizzy
                  ? { duration: 0.9 }
                  : undefined
          }
          className="relative"
        >
          <RobotArt
            expression={expression}
            mouth={mouth}
            glyph={sectionMood === "default" ? null : MOOD_GLYPH[sectionMood]}
            alerted={alerted}
            waving={waving}
            patrol={patrol && !sleeping}
            signal={alerted || sentry}
            headX={headDX}
            headY={headDY}
            pupilX={pupilRenderX}
            pupilY={pupilRenderY}
          />
        </m.div>

        {/* ground shadow: outer span takes the framer tilt-slide, inner span
            owns the CSS breathe — one transform source per node. */}
        <m.span
          aria-hidden="true"
          style={{ x: shadowX }}
          className="pointer-events-none absolute -bottom-1 left-1/2 -ml-10 block h-2.5 w-20"
        >
          <span className="rbt-ground block h-full w-full rounded-full" />
        </m.span>
      </m.button>

      {/* Visible command list — the honest answer to "how do I interact with
          this?". Also the keyboard/AT path to every trick. */}
      <RobotEmotes open={menuOpen} onAction={runEmote} />

      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={t.robot.menuLabel}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        data-robot-hit
        className="absolute -left-2 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full border border-accent/40 bg-background font-mono text-[0.6rem] leading-none text-accent transition-colors hover:bg-accent/15 group-hover/robot:flex group-focus-within/robot:flex"
      >
        •••
      </button>

      <button
        type="button"
        onClick={dismiss}
        aria-label={t.robot.dismissLabel}
        data-robot-hit
        className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full border border-foreground/20 bg-background text-muted transition-colors hover:text-foreground group-hover/robot:flex group-focus-within/robot:flex"
      >
        <X size={10} />
      </button>
    </m.div>
    </div>
    </>
  );
}
