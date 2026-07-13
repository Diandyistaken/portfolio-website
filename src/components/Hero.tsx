"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, MapPin, ShieldCheck } from "lucide-react";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";
import { HeroTerminal } from "./HeroTerminal";
import { CvDownload } from "./CvDownload";
import { FollowMenu } from "./FollowMenu";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function Hero() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const nameWords = t.personalInfo.name.split(" ");
  const titleWords = t.personalInfo.title.split(" ");
  // increments per click so the scan CSS animation can re-trigger via key
  const [scanRun, setScanRun] = useState(0);
  const [verified, setVerified] = useState(false);

  const startScan = () => {
    setScanRun((n) => n + 1);
    setVerified(false);
    setTimeout(() => setVerified(true), 700);
    setTimeout(() => setVerified(false), 2400);
  };

  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center px-6 pt-28 pb-24"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Reveal>
            <HeroTerminal />
          </Reveal>

          <Reveal delay={0.05}>
            <span className="kicker mt-6 block">&gt; {t.hero.greeting}_</span>
          </Reveal>

          <m.h1
            aria-label={t.personalInfo.name}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
            className="font-display glow-text mt-4 flex flex-wrap gap-x-[0.22em] text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          >
            {nameWords.map((word, index) => (
              <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-[0.08em]">
                <m.span
                  aria-hidden="true"
                  variants={{
                    hidden: { y: "110%", filter: "blur(12px)" },
                    visible: { y: "0%", filter: "blur(0px)", transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  className="inline-block"
                >
                  {word}
                </m.span>
              </span>
            ))}
          </m.h1>

          <Reveal delay={0.15}>
            <p className="mt-5 max-w-xl text-sm text-muted sm:text-base">
              {titleWords.map((word, index) => (
                <span key={`${word}-${index}`} className={index === titleWords.length - 1 ? "bg-gradient-to-r from-accent to-cyan-400 bg-clip-text font-medium text-transparent" : undefined}>
                  {word}{index < titleWords.length - 1 ? " " : ""}
                </span>
              ))}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-muted">
              <MapPin size={13} className="text-accent" />
              {t.personalInfo.location} — 41.0°N 29.0°E
            </p>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="tap-pop group flex items-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-[opacity,box-shadow] hover:opacity-90 hover:shadow-[0_0_32px_rgb(var(--accent-rgb)/0.35)]"
              >
                {t.hero.ctaPrimary}
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <CvDownload />
              <FollowMenu />
            </div>
          </Reveal>
        </div>

        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-64 sm:w-80 lg:w-full lg:max-w-sm"
        >
          <TiltCard className="hud-corners">
            <div
              role="button"
              tabIndex={0}
              aria-label="ID scan"
              onClick={startScan}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  startScan();
                }
              }}
              className="surface scanline relative aspect-[4/5] cursor-pointer overflow-hidden rounded-lg p-2 outline-none"
            >
              <div className="relative h-full w-full overflow-hidden rounded-md">
                <Image
                  src="/profil-fotografi.jpg"
                  alt={t.personalInfo.name}
                  fill
                  priority
                  quality={90}
                  sizes="(min-width: 1024px) 24rem, 20rem"
                  className="object-cover object-[center_25%]"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgb(var(--accent-rgb) / 0.16), transparent 45%)",
                  }}
                />
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
                      className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-md border border-accent/70 bg-[#05070c]/85 px-3.5 py-2 font-mono text-[0.65rem] tracking-[0.2em] text-accent"
                    >
                      <ShieldCheck size={14} />
                      ID VERIFIED
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </TiltCard>
          <span className="surface font-mono absolute -bottom-3 -right-3 z-10 rounded-md px-2.5 py-1 text-[0.65rem] tracking-wide text-accent">
            IST // ONLINE
          </span>
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
        SCROLL
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
