"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { KineticText } from "./KineticText";
import { SectionBackground } from "./SectionBackground";
import { AmbientGlow } from "./AmbientGlow";
import { CvDownload } from "./CvDownload";
import { FollowMenu } from "./FollowMenu";
import { ambientAssets } from "@/lib/data";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden px-6 pt-28 pb-16"
    >
      <SectionBackground variant="hero" />
      <AmbientGlow
        src={ambientAssets.day.src}
        glow={ambientAssets.day.glow}
        eager
        className="hidden right-[-3.5rem] top-8 lg:block lg:h-32 lg:w-52"
      />

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-sm font-medium tracking-[0.2em] text-muted uppercase"
          >
            {t.hero.greeting}
          </motion.p>

          <KineticText
            text={t.personalInfo.name}
            className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-5 max-w-xl text-sm text-muted sm:text-base"
          >
            {t.personalInfo.title}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-2 flex items-center gap-1.5 text-xs text-muted"
          >
            <MapPin size={13} className="text-accent" />
            {t.personalInfo.location}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background shadow-[0_0_0_0_rgba(109,91,255,0)] transition-shadow duration-300 hover:shadow-[0_0_28px_2px_rgb(var(--surface-border)/0.25)]"
            >
              {t.hero.ctaPrimary}
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.25 }}
            className="mt-4 flex flex-wrap items-center gap-3"
          >
            <CvDownload />
            <FollowMenu />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto aspect-[4/5] w-64 sm:w-80 lg:w-full lg:max-w-sm"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-accent/40 to-accent-2/30 blur-2xl" />
          <div className="glass-strong relative aspect-[4/5] overflow-hidden rounded-[2rem] p-2">
            <div className="relative h-full w-full overflow-hidden rounded-[1.5rem]">
              <Image
                src="/profil-fotografi.jpg"
                alt={t.personalInfo.name}
                fill
                priority
                quality={95}
                sizes="(min-width: 1024px) 24rem, 20rem"
                className="object-cover object-[center_25%]"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
