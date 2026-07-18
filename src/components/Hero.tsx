"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, m, useMotionTemplate, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ChevronDown, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";
import { HeroBackdrop } from "./HeroBackdrop";
import { CvDownload } from "./CvDownload";
import { FollowMenu } from "./FollowMenu";
import { DecryptText } from "./DecryptText";
import { MagneticButton } from "./MagneticButton";
import { BreachCTA, LedRack, UptimeCounter } from "./HeroExtras";
import { HintTag } from "./HintTag";
import { AccessKey } from "./KeyHunt";
import { HeroBadge } from "./HeroBadge";
import { HeroDotGrid } from "./HeroDotGrid";
import { useAdmin } from "./AdminProvider";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { CONTAINER } from "@/lib/layout";
import { goalsMeta } from "@/lib/data";

const subscribeToRootClass = (onStoreChange: () => void) => {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
};

const getPerfLiteSnapshot = () =>
  document.documentElement.classList.contains("perf-lite");

export function Hero() {
  const { t } = useLanguage();
  const { isAdmin } = useAdmin();
  const reduceMotion = useReducedMotion();
  const titleWords = t.personalInfo.title.split(" ");
  const [scanRun, setScanRun] = useState(0);
  const [verified, setVerified] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  // #38 name letter-drop: clicking the h1 detonates the letters (5s cooldown)
  const [dropRun, setDropRun] = useState(0);
  const dropCooldown = useRef(0);
  const dropTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (dropTimer.current) clearTimeout(dropTimer.current);
    };
  }, []);
  const perfLite = useSyncExternalStore(
    subscribeToRootClass,
    getPerfLiteSnapshot,
    () => false,
  );

  // Parallax exit: as the hero scrolls away, text and photo drift apart at
  // different speeds and fade — cheap depth that makes the first scroll feel
  // dimensional.
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const exitOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.15]);
  // #44 depth stack: backdrop recedes + blurs, photo grows toward the viewer,
  // the stats card trails on its own rate, hex debris flies fastest.
  const backdropY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const backdropBlur = useTransform(scrollYProgress, [0, 0.9], [0, 7]);
  const backdropFilter = useMotionTemplate`blur(${backdropBlur}px)`;
  const photoScale = useTransform(scrollYProgress, [0, 0.6], [1, 1.045]);
  const statsExtraY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const hexY = useTransform(scrollYProgress, [0, 1], [0, -190]);
  // #45 de-rez exit: scanline mask gaps widen + slices shear as the hero
  // leaves; scrolling back reassembles (pure scrub, no timers).
  const derezBand = useTransform(scrollYProgress, [0.3, 0.9], [16, 3]);
  const derezMask = useMotionTemplate`repeating-linear-gradient(180deg, #000 0px, #000 ${derezBand}px, transparent ${derezBand}px, transparent 16px)`;
  const derezShift = useTransform(scrollYProgress, [0.35, 0.9], [0, 26]);
  const staticHero = reduceMotion || perfLite;

  // #37 wipe-reveal portrait: double-click toggles a before/after mode where
  // a vertical accent line follows the cursor, wireframe left / photo right.
  const [wipeMode, setWipeMode] = useState(false);
  const splitX = useSpring(50, { stiffness: 260, damping: 24 });
  const wipeRightInset = useTransform(splitX, (value) => 100 - value);
  const wipeClip = useMotionTemplate`inset(0 ${wipeRightInset}% 0 0)`;
  const wipeLinePos = useMotionTemplate`${splitX}%`;
  // (#83 cursor-driven name shadow was removed on user feedback — too much
  // ambient motion in the hero.)

  useEffect(() => {
    if (reduceMotion || perfLite || t.hero.ticker.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setTickerIndex((index) => (index + 1) % t.hero.ticker.length);
    }, 2800);

    return () => window.clearInterval(interval);
  }, [perfLite, reduceMotion, t.hero.ticker]);

  const startScan = () => {
    setScanRun((n) => n + 1);
    setVerified(false);
    setTimeout(() => setVerified(true), 700);
    setTimeout(() => setVerified(false), 2400);
  };

  const detonateName = () => {
    if (staticHero) return;
    const now = performance.now();
    if (now - dropCooldown.current < 5000) return;
    dropCooldown.current = now;
    setDropRun((run) => run + 1);
    if (dropTimer.current) clearTimeout(dropTimer.current);
    dropTimer.current = setTimeout(() => setDropRun(0), 1700);
  };

  const nameChars = Array.from(t.personalInfo.name);

  // #55 photo escape reflex: the portrait leans slightly AWAY from the cursor
  const leanX = useSpring(0, { stiffness: 150, damping: 15 });
  const leanY = useSpring(0, { stiffness: 150, damping: 15 });
  const onPhotoMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (staticHero) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    leanX.set(Math.max(-3, Math.min(3, -dx / 40)));
    leanY.set(Math.max(-3, Math.min(3, -dy / 40)));
    // #37: in wipe mode the cursor's x scrubs the before/after split
    if (wipeMode) {
      splitX.set(Math.max(4, Math.min(96, ((event.clientX - rect.left) / rect.width) * 100)));
    }
  };
  const onPhotoLeave = () => {
    leanX.set(0);
    leanY.set(0);
    splitX.set(50);
  };

  const projectsStat = t.about.stats[1];
  const techStat = t.about.stats[2];
  const learningGoal = t.goals.items[1];
  const learningProgress = goalsMeta[learningGoal.id]?.progress ?? 0;

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative isolate flex min-h-screen min-h-[100svh] items-center overflow-hidden px-6 pt-28 pb-24 sm:px-10 3xl:px-16 3xl:pt-32 3xl:pb-28"
    >
      {/* #44 layer 1: the backdrop grid recedes and blurs on exit */}
      <m.div
        aria-hidden="true"
        style={staticHero ? undefined : { y: backdropY, filter: backdropFilter }}
        className="absolute inset-0"
      >
        <HeroBackdrop />
      </m.div>

      {/* #102 magnetic dot grid the cursor stirs (canvas, hero only) */}
      {!staticHero && <HeroDotGrid />}

      {/* #44 layer 4: floating hex debris, fastest parallax rate */}
      {!staticHero && (
        <m.div aria-hidden="true" style={{ y: hexY }} className="pointer-events-none absolute inset-0 z-[1] hidden lg:block">
          {[
            { top: "18%", left: "44%", glyph: "0x5E" },
            { top: "64%", left: "6%", glyph: "{ }" },
            { top: "30%", left: "88%", glyph: "0xC8" },
            { top: "76%", left: "58%", glyph: "</>" },
            { top: "48%", left: "31%", glyph: "▚" },
          ].map((fragment) => (
            <span
              key={fragment.glyph}
              className="absolute font-mono text-xs text-accent/15"
              style={{ top: fragment.top, left: fragment.left }}
            >
              {fragment.glyph}
            </span>
          ))}
        </m.div>
      )}

      <div className={`${CONTAINER} relative z-10 grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] 3xl:gap-24`}>
        <m.div style={staticHero ? undefined : { y: contentY, opacity: exitOpacity }}>
          <Reveal>
            {/* Status badge doubles as a toy: each click cycles a new
                tongue-in-cheek status line. */}
            <button
              type="button"
              onClick={() => {
                setStatusIndex((index) => (index + 1) % t.hero.statusCycle.length);
                window.dispatchEvent(new Event("app:status-cycled"));
              }}
              className="surface-hover surface tap-pop inline-flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  key={statusIndex}
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="font-mono text-[0.68rem] tracking-[0.08em] text-muted"
                >
                  {statusIndex === 0 ? t.hero.badge : t.hero.statusCycle[statusIndex]}
                </m.span>
              </AnimatePresence>
            </button>
          </Reveal>

          <Reveal delay={0.08}>
            <DecryptText
              text={`> ${isAdmin ? t.admin.greeting : t.hero.greeting}_`}
              className="kicker mt-6 block"
              delay={0.05}
            />
          </Reveal>

          <div className="relative">
          {dropRun === 0 ? (
            <m.h1
              aria-label={t.personalInfo.name}
              onClick={detonateName}
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.14 } } }}
              className={`font-display mt-6 flex flex-wrap gap-x-[0.22em] text-hero font-medium leading-[1.02] tracking-tight text-foreground ${staticHero ? "" : "cursor-pointer"}`}
            >
              {t.personalInfo.name.split(" ").map((word, index) => (
                <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-[0.08em]">
                  <m.span
                    aria-hidden="true"
                    variants={{
                      hidden: { y: "110%", opacity: 0 },
                      visible: { y: "0%", opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                    }}
                    className="inline-block"
                  >
                    {word}
                  </m.span>
                </span>
              ))}
            </m.h1>
          ) : (
            // #38 detonated: per-letter physics drop, reverts to words after ~1.7s
            <h1
              aria-label={t.personalInfo.name}
              onClick={detonateName}
              className="font-display mt-6 flex cursor-pointer flex-wrap text-hero font-medium leading-[1.02] tracking-tight text-foreground"
            >
              {nameChars.map((char, index) =>
                char === " " ? (
                  <span key={index} className="inline-block w-[0.28em]" />
                ) : (
                  <m.span
                    key={`${dropRun}-${index}`}
                    aria-hidden="true"
                    className="inline-block"
                    initial={{ y: 0, rotate: 0 }}
                    animate={{
                      y: [0, 42 + ((index * 37) % 44), 42 + ((index * 37) % 44) - 14, 0],
                      rotate: [0, ((index * 13) % 17) - 8, 0],
                      textShadow: [
                        "0 0 0 rgb(94 200 255 / 0)",
                        "0 0 0 rgb(94 200 255 / 0)",
                        "0 4px 18px rgb(94 200 255 / 0.7)",
                        "0 0 0 rgb(94 200 255 / 0)",
                      ],
                    }}
                    transition={{ duration: 1.5, delay: index * 0.02, ease: [0.34, 1.4, 0.64, 1], times: [0, 0.35, 0.75, 1] }}
                  >
                    {char}
                  </m.span>
                ),
              )}
            </h1>
          )}
          </div>

          <Reveal delay={0.22}>
            <p className="mt-5 max-w-xl text-sm text-muted sm:text-base 3xl:max-w-3xl 3xl:text-xl 4xl:text-2xl">
              {titleWords.map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className={
                    index === titleWords.length - 1
                      ? "bg-gradient-to-r from-foreground to-accent bg-clip-text font-medium text-transparent"
                      : undefined
                  }
                >
                  {word}
                  {index < titleWords.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="mt-2 font-mono text-xs text-muted 3xl:text-sm">
              <p className="flex flex-wrap items-center gap-1.5">
                <MapPin size={13} className="text-accent" />
                <DecryptText
                  text={`${t.personalInfo.location} — 41.0°N 29.0°E`}
                  delay={0.15}
                />
              </p>
              <div
                className="mt-2 flex h-4 items-center overflow-hidden text-[0.65rem] tracking-wide text-accent/80 3xl:text-xs"
                aria-live="polite"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <m.span
                    key={reduceMotion || perfLite ? "static" : tickerIndex}
                    initial={reduceMotion || perfLite ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion || perfLite ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="whitespace-nowrap"
                  >
                    {t.hero.ticker[reduceMotion || perfLite ? 0 : tickerIndex]}
                  </m.span>
                </AnimatePresence>
                <span className="ops-cursor ml-1" aria-hidden="true">█</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.34}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <MagneticButton>
                <BreachCTA label={t.hero.ctaPrimary} targetId="contact" />
              </MagneticButton>
              <MagneticButton>
                <a
                  href="#projects"
                  data-prox
                  data-prox-radius="300"
                  className="prox-aura tap-pop surface-hover relative block rounded-full border border-foreground/12 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent"
                >
                  {t.hero.ctaSecondary}
                </a>
              </MagneticButton>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <CvDownload />
              <FollowMenu />
            </div>
          </Reveal>

          <Reveal delay={0.48}>
            <HintTag text={t.hints.heroToys} className="mt-4" />
          </Reveal>
        </m.div>

        <m.div
          style={
            staticHero
              ? undefined
              : {
                  y: photoY,
                  opacity: exitOpacity,
                  scale: photoScale,
                  x: derezShift,
                  WebkitMaskImage: derezMask,
                  maskImage: derezMask,
                }
          }
          className="relative mx-auto flex w-full max-w-sm flex-col items-center gap-6"
        >
          <div className="relative w-64 sm:w-72 lg:w-full lg:max-w-xs 3xl:max-w-sm">
            <m.div
              initial={reduceMotion ? false : { scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="absolute left-1/2 top-1/2 -z-10 aspect-square w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.18] blur-2xl"
              aria-hidden="true"
            />
            <m.div
              initial={reduceMotion ? false : { y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
              className="relative"
            >
              <m.div
                role="button"
                tabIndex={0}
                aria-label={t.hero.scanLabel}
                onClick={(event) => {
                  // second click of a double-click toggles wipe mode instead
                  if (event.detail > 1) return;
                  startScan();
                }}
                onDoubleClick={() => {
                  if (staticHero) return;
                  setWipeMode((value) => !value);
                }}
                style={staticHero ? undefined : { x: leanX, y: leanY }}
                onMouseMove={onPhotoMove}
                onMouseLeave={onPhotoLeave}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    startScan();
                  }
                }}
                className="surface scanline relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl p-2 outline-none"
              >
                {/* #53: mobile gyro parallax rides this wrapper (CSS vars) */}
                <div className="gyro-lean relative h-full w-full overflow-hidden rounded-xl">
                <div className="ken-burns relative h-full w-full overflow-hidden rounded-xl">
                  <Image
                    src="/profil-fotografi.jpg"
                    alt={t.personalInfo.name}
                    fill
                    priority
                    fetchPriority="high"
                    quality={75}
                    sizes="(min-width: 2400px) 32rem, (min-width: 1920px) 28rem, (min-width: 1024px) 24rem, (min-width: 640px) 18rem, 16rem"
                    className="object-cover object-[center_25%]"
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgb(var(--accent-rgb) / 0.14), transparent 45%)",
                    }}
                  />
                  {/* #37 wipe overlay: duotone/wireframe left of the split line */}
                  {wipeMode && !staticHero && (
                    <>
                      <m.div aria-hidden="true" className="absolute inset-0 z-[2] overflow-hidden" style={{ clipPath: wipeClip }}>
                        <Image
                          src="/profil-fotografi.jpg"
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 24rem, 16rem"
                          className="wipe-duotone object-cover object-[center_25%]"
                        />
                        <div className="wipe-grid absolute inset-0" aria-hidden="true" />
                      </m.div>
                      <m.span
                        aria-hidden="true"
                        className="absolute inset-y-0 z-[3] w-px bg-accent shadow-[0_0_14px_rgb(var(--accent-rgb)/0.9)]"
                        style={{ left: wipeLinePos }}
                      />
                    </>
                  )}
                  {scanRun > 0 && (
                    <div key={scanRun} className="id-scan absolute inset-0" />
                  )}
                  <AnimatePresence>
                    {verified && (
                      <m.div
                        initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                        animate={{ opacity: 1, scale: 1, rotate: -4 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 320, damping: 18 }}
                        className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-accent/70 bg-background/85 px-3.5 py-2 font-mono text-[0.65rem] tracking-[0.2em] text-accent"
                      >
                        <ShieldCheck size={14} />
                        {t.hero.verifiedLabel}
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
                </div>
              </m.div>
              <span className="surface font-mono absolute -bottom-3 -right-3 z-10 rounded-full px-2.5 py-1 text-[0.65rem] tracking-wide text-accent">
                {t.hero.onlineLabel}
              </span>
              {/* #67 hidden key no.2, tucked into the photo card corner */}
              <span className="absolute bottom-2 left-2 z-10">
                <AccessKey id="photo" />
              </span>
              {/* #68 clearance badge swinging on its lanyard */}
              {!staticHero && <HeroBadge />}
            </m.div>
          </div>

          <Reveal delay={0.5} className="w-full">
            {/* #44 layer 3: the stats card trails at its own parallax rate */}
            <m.div style={staticHero ? undefined : { y: statsExtraY }}>
            <div data-prox data-prox-radius="360" className="gyro-lean--deep surface relative overflow-hidden rounded-2xl p-5">
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/10 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12">
                  <Sparkles size={18} className="text-accent" />
                </div>
                <div>
                  <p className="redact-near text-2xl font-semibold text-foreground">{projectsStat.value}{projectsStat.suffix}</p>
                  <p className="text-xs text-muted">{projectsStat.label}</p>
                </div>
              </div>

              <div className="relative mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">{learningGoal.title}</span>
                  <span className="font-mono text-accent">{learningProgress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                  <m.div
                    initial={reduceMotion ? false : { width: 0 }}
                    animate={{ width: `${learningProgress}%` }}
                    transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-accent"
                  />
                </div>
              </div>

              <div className="relative mt-5 flex items-center justify-between border-t border-foreground/10 pt-4">
                <div>
                  <p className="redact-near text-lg font-semibold text-foreground">{techStat.value}{techStat.suffix}</p>
                  <p className="text-[0.68rem] text-muted">{techStat.label}</p>
                </div>
                <div className="h-8 w-px bg-foreground/10" aria-hidden="true" />
                <div className="text-right">
                  <p className="redact-near text-lg font-semibold text-foreground">2</p>
                  <p className="text-[0.68rem] text-muted">{t.nav.experience}</p>
                </div>
              </div>

              <LedRack tips={t.hero.ledTips} />
              <UptimeCounter />
            </div>
            </m.div>
          </Reveal>
        </m.div>
      </div>

      <m.a
        href="#about"
        aria-hidden="true"
        tabIndex={-1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 font-mono text-[0.62rem] tracking-[0.3em] text-muted"
      >
        {t.hero.scrollLabel}
        <m.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={14} className="text-accent" />
        </m.span>
      </m.a>
    </section>
  );
}
