"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { Reveal, RevealGroup, revealItem } from "./Reveal";
import { SectionBackground } from "./SectionBackground";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { educationPhotosMeta } from "@/lib/data";

export function Education() {
  const { t } = useLanguage();

  return (
    <section id="education" className="relative overflow-hidden px-6 py-28 sm:py-32">
      <SectionBackground variant="warm" />
      <div className="mx-auto max-w-2xl">
        <SectionHeading kicker={t.education.kicker} title={t.education.title} />

        <Reveal delay={0.1} className="mt-10">
          <div className="glass flex flex-col items-center gap-4 rounded-3xl p-8 text-center sm:flex-row sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-accent">
              <GraduationCap size={26} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold">
                {t.education.school}
              </h3>
              <p className="text-sm text-muted">{t.education.department}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-accent">
                {t.education.graduationLabel}: {t.education.graduation}
              </p>
            </div>
          </div>
        </Reveal>

        <RevealGroup
          stagger={0.18}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-10"
        >
          {t.education.photos.map((photo, i) => (
            <motion.div key={photo.id} variants={revealItem}>
              <motion.div
                initial={{ rotate: i % 2 === 0 ? -3 : 3 }}
                whileHover={{ rotate: 0, y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="glass-strong w-52 rounded-2xl p-3 shadow-xl shadow-black/10 transition-shadow duration-300 hover:shadow-2xl sm:w-60"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl">
                  <Image
                    src={educationPhotosMeta[photo.id].src}
                    alt={photo.alt}
                    fill
                    quality={90}
                    sizes="(min-width: 640px) 15rem, 13rem"
                    className="scale-[1.22] translate-x-[-2%] -translate-y-[3%] object-cover"
                  />
                </div>
                <p className="mt-3 pb-1 text-center font-display text-sm text-muted">
                  {photo.caption}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
