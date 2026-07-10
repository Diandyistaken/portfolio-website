"use client";

import { Bug, Gamepad2, Globe, Home, MonitorSmartphone, Smartphone } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { servicesMeta } from "@/lib/data";
import { m } from "framer-motion";

const icons = {
  home: Home,
  globe: Globe,
  bug: Bug,
  gamepad: Gamepad2,
  smartphone: Smartphone,
  monitor: MonitorSmartphone,
} as const;

export function Services() {
  const { t } = useLanguage();

  return (
    <section id="services" className="px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          index="03"
          kicker={t.services.kicker}
          title={t.services.title}
          description={t.services.description}
        />

        <RevealGroup
          stagger={0.06}
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {t.services.items.map((service) => {
            const Icon = icons[servicesMeta[service.id].icon];
            return (
              <m.div key={service.id} variants={revealItem}>
                <TiltCard
                  maxTilt={5}
                  className="surface surface-hover h-full rounded-lg p-6"
                >
                  <Icon size={18} className="text-accent" />
                  <h3 className="font-display mt-4 text-lg font-semibold">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {service.description}
                  </p>
                </TiltCard>
              </m.div>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
