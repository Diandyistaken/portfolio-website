"use client";

import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { Reveal, RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { educationPhotosMeta } from "@/lib/data";
import { m, useReducedMotion } from "framer-motion";
import { CONTAINER } from "@/lib/layout";
import { useTilt3D } from "@/lib/useTilt3D";
import { SectionBackdrop, usePerfLite } from "./SectionBackdrop";

type EducationPhoto = ReturnType<typeof useLanguage>["t"]["education"]["photos"][number];

function EducationSummary({ school, department, graduationLabel, graduation }: {
  school: string;
  department: string;
  graduationLabel: string;
  graduation: string;
}) {
  const tilt = useTilt3D<HTMLDivElement>();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();

  return (
    <m.div
      {...tilt.handlers}
      style={tilt.motionStyle}
      whileHover={reducedMotion || perfLite ? undefined : { y: -4 }}
      className="surface flex flex-col items-center gap-4 rounded-lg p-7 text-center sm:flex-row sm:text-left 3xl:gap-6 3xl:p-10"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-foreground/12 text-accent [transform:translateZ(18px)]">
        <GraduationCap size={22} />
      </div>
      <div className="[transform:translateZ(12px)]">
        <h3 className="font-display text-lg font-semibold">{school}</h3>
        <p className="text-sm text-muted">{department}</p>
        <p className="font-mono mt-1 text-xs text-accent">
          {graduationLabel}: {graduation}
        </p>
      </div>
    </m.div>
  );
}

function EducationPhotoCard({ photo }: { photo: EducationPhoto }) {
  const tilt = useTilt3D<HTMLDivElement>();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();

  return (
    <m.div
      {...tilt.handlers}
      style={tilt.motionStyle}
      variants={revealItem}
      whileHover={reducedMotion || perfLite ? undefined : { y: -5 }}
      className="surface w-36 rounded-lg p-2 sm:w-44 3xl:w-full 3xl:max-w-56"
    >
      <div className="relative aspect-square overflow-hidden rounded-md [transform:translateZ(14px)]">
        <Image
          src={educationPhotosMeta[photo.id].src}
          alt={photo.alt}
          fill
          quality={90}
          sizes="(min-width: 640px) 14rem, 12rem"
          className="scale-[1.22] translate-x-[-2%] -translate-y-[3%] object-cover grayscale-[0.15]"
        />
      </div>
      <p className="font-mono mt-2.5 pb-1 text-center text-xs text-muted [transform:translateZ(10px)]">
        {photo.caption}
      </p>
    </m.div>
  );
}

export function Education() {
  const { t } = useLanguage();

  return (
    <section id="education" className="relative overflow-hidden px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      <SectionBackdrop variant="orbits" />
      <div className={`relative z-10 ${CONTAINER}`}>
        <div className="mx-auto max-w-3xl 3xl:max-w-5xl 4xl:max-w-6xl">
        <SectionHeading index="05" kicker={t.education.kicker} title={t.education.title} />

        <Reveal delay={0.1} className="mt-10">
          <EducationSummary
            school={t.education.school}
            department={t.education.department}
            graduationLabel={t.education.graduationLabel}
            graduation={t.education.graduation}
          />
        </Reveal>

        <p className="font-mono mt-10 inline-block rounded-md bg-background/60 px-2.5 py-1 text-xs text-muted backdrop-blur-sm">
          {t.education.photosIntro}
        </p>

        <RevealGroup
          stagger={0.1}
          className="mt-4 grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 sm:justify-items-start 3xl:grid-cols-3 3xl:gap-6"
        >
          {t.education.photos.map((photo) => (
            <EducationPhotoCard key={photo.id} photo={photo} />
          ))}
        </RevealGroup>
        </div>
      </div>
    </section>
  );
}
