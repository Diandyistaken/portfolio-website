"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { Reveal } from "./Reveal";
import { CvDownload } from "./CvDownload";
import { FollowMenu } from "./FollowMenu";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center px-6 pt-28 pb-16"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Reveal>
            <span className="kicker">{t.hero.greeting}</span>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="font-display mt-4 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              {t.personalInfo.name}
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-5 max-w-xl text-sm text-muted sm:text-base">
              {t.personalInfo.title}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
              <MapPin size={13} className="text-accent" />
              {t.personalInfo.location}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="group flex items-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85"
              >
                {t.hero.ctaPrimary}
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <CvDownload />
              <FollowMenu />
            </div>
          </Reveal>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mx-auto aspect-[4/5] w-64 sm:w-80 lg:w-full lg:max-w-sm"
        >
          <div className="surface relative aspect-[4/5] overflow-hidden rounded-lg p-2">
            <div className="relative h-full w-full overflow-hidden rounded-md">
              <Image
                src="/profil-fotografi.jpg"
                alt={t.personalInfo.name}
                fill
                priority
                quality={95}
                sizes="(min-width: 1024px) 24rem, 20rem"
                className="object-cover object-[center_25%] grayscale-[0.15]"
              />
            </div>
          </div>
          <span className="font-mono absolute -bottom-3 -right-3 rounded-md border border-foreground/15 bg-background px-2.5 py-1 text-[0.65rem] tracking-wide text-muted">
            Istanbul, TR
          </span>
        </motion.div>
      </div>
    </section>
  );
}
