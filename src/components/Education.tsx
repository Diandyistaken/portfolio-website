"use client";

import { GraduationCap } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { m, useReducedMotion } from "framer-motion";
import { CONTAINER } from "@/lib/layout";
import { useTilt3D } from "@/lib/useTilt3D";
import { SectionBackdrop, usePerfLite } from "./SectionBackdrop";

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
        </div>
      </div>
    </section>
  );
}
