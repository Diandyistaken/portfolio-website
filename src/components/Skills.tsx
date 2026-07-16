"use client";

import { Gamepad2, Layers, Network, Shield } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { skillsMeta } from "@/lib/data";
import { m, useReducedMotion } from "framer-motion";
import { CONTAINER } from "@/lib/layout";
import { useTilt3D } from "@/lib/useTilt3D";
import { usePerfLite } from "./SectionBackdrop";

const icons = {
  cyber: Shield,
  gamedev: Gamepad2,
  corporate: Network,
  other: Layers,
} as const;

type SkillCategory = ReturnType<typeof useLanguage>["t"]["skills"]["categories"][number];

function SkillCard({ category }: { category: SkillCategory }) {
  const Icon = icons[category.id as keyof typeof icons];
  const meta = skillsMeta[category.id];
  const tilt = useTilt3D<HTMLDivElement>();
  const reducedMotion = useReducedMotion();
  const perfLite = usePerfLite();

  return (
    <m.div
      {...tilt.handlers}
      style={tilt.motionStyle}
      variants={revealItem}
      whileHover={reducedMotion || perfLite ? undefined : "hover"}
      className={`surface surface-hover rounded-lg p-6 ${
        meta.size === "lg" ? "sm:col-span-2" : ""
      }`}
    >
      <m.div data-prox data-prox-radius="320" variants={{ hover: { z: 26, scale: 1.06 } }} className="prox-icon mb-5 flex h-10 w-10 items-center justify-center rounded-md border border-foreground/12 text-accent [transform:translateZ(10px)]">
        <Icon size={18} />
      </m.div>
      <m.h3 variants={{ hover: { z: 20 } }} className="font-display text-lg font-semibold [transform:translateZ(8px)]">
        {category.title}
      </m.h3>

      <ul className="mt-4 space-y-3 [transform:translateZ(5px)]">
        {category.items.map((item) => (
          <li key={item.label}>
            <p className="text-sm font-medium">{item.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {item.description}
            </p>
          </li>
        ))}
      </ul>

      {meta.tools && (
        <div className="mt-5 flex flex-wrap gap-2 [transform:translateZ(12px)]">
          {meta.tools.map((tool, index) => (
            <m.span
              key={tool}
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.3, delay: index * 0.045 },
                },
              }}
              data-prox
              className="prox-chip font-mono rounded-sm border border-foreground/12 px-2.5 py-1 text-[0.7rem] text-muted"
            >
              {tool}
            </m.span>
          ))}
        </div>
      )}
    </m.div>
  );
}

export function Skills() {
  const { t } = useLanguage();

  return (
    <section id="skills" className="relative overflow-hidden px-6 py-24 sm:px-10 sm:py-28 3xl:px-16">
      <div className={`relative z-10 ${CONTAINER}`}>
        <SectionHeading
        index="02"
          kicker={t.skills.kicker}
          title={t.skills.title}
          description={t.skills.description}
        />

        <RevealGroup
          stagger={0.08}
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 3xl:gap-6"
        >
          {t.skills.categories.map((category) => (
            <SkillCard key={category.id} category={category} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
