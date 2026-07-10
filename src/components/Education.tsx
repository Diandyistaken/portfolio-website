"use client";

import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { Reveal, RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { educationPhotosMeta } from "@/lib/data";
import { m } from "framer-motion";

export function Education() {
  const { t } = useLanguage();

  return (
    <section id="education" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <SectionHeading index="05" kicker={t.education.kicker} title={t.education.title} />

        <Reveal delay={0.1} className="mt-10">
          <div className="surface flex flex-col items-center gap-4 rounded-lg p-7 text-center sm:flex-row sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-foreground/12 text-accent">
              <GraduationCap size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold">
                {t.education.school}
              </h3>
              <p className="text-sm text-muted">{t.education.department}</p>
              <p className="font-mono mt-1 text-xs text-accent">
                {t.education.graduationLabel}: {t.education.graduation}
              </p>
            </div>
          </div>
        </Reveal>

        <RevealGroup
          stagger={0.1}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:justify-start"
        >
          {t.education.photos.map((photo) => (
            <m.div key={photo.id} variants={revealItem} className="surface w-48 rounded-lg p-2 sm:w-56">
              <div className="relative aspect-square overflow-hidden rounded-md">
                <Image
                  src={educationPhotosMeta[photo.id].src}
                  alt={photo.alt}
                  fill
                  quality={90}
                  sizes="(min-width: 640px) 14rem, 12rem"
                  className="scale-[1.22] translate-x-[-2%] -translate-y-[3%] object-cover grayscale-[0.15]"
                />
              </div>
              <p className="font-mono mt-2.5 pb-1 text-center text-xs text-muted">
                {photo.caption}
              </p>
            </m.div>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
