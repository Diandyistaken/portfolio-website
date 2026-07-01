"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { KineticText } from "./KineticText";
import { personalInfo } from "@/lib/data";

const HeroParticles = dynamic(() => import("./HeroParticles"), {
  ssr: false,
});

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center overflow-hidden px-6 pt-28 pb-16"
    >
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25 blur-[120px]" />
        <div className="absolute right-0 bottom-0 h-[24rem] w-[24rem] rounded-full bg-accent-2/20 blur-[110px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <HeroParticles />
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-sm font-medium tracking-[0.2em] text-muted uppercase"
          >
            Merhaba, ben
          </motion.p>

          <KineticText
            text={personalInfo.name}
            className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-5 max-w-xl text-sm text-muted sm:text-base"
          >
            {personalInfo.title}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.05 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background shadow-[0_0_0_0_rgba(109,91,255,0)] transition-shadow duration-300 hover:shadow-[0_0_28px_2px_rgb(var(--surface-border)/0.25)]"
            >
              İletişime Geç
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </motion.a>

            <motion.button
              type="button"
              disabled
              whileHover={{ scale: 1.03 }}
              className="glass flex cursor-not-allowed items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-muted opacity-70"
              title="CV yakında eklenecek"
            >
              <Download size={16} />
              CV İndir
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto aspect-square w-56 sm:w-72 lg:w-full lg:max-w-sm"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-accent/40 to-accent-2/30 blur-2xl" />
          <div className="glass-strong relative aspect-square overflow-hidden rounded-[2rem] p-2">
            <div className="relative h-full w-full overflow-hidden rounded-[1.5rem]">
              <Image
                src="/profil-fotografi.png"
                alt={personalInfo.name}
                fill
                priority
                sizes="(min-width: 1024px) 24rem, 18rem"
                className="object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
