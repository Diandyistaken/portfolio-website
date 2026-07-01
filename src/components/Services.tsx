"use client";

import { motion } from "framer-motion";
import { Bug, Gamepad2, Globe, Home, MonitorSmartphone, Smartphone } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionBackground } from "./SectionBackground";
import { SectionHeading } from "./SectionHeading";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { servicesMeta } from "@/lib/data";

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
    <section id="services" className="relative overflow-hidden px-6 py-28 sm:py-32">
      <SectionBackground variant="orbit" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker={t.services.kicker}
          title={t.services.title}
          description={t.services.description}
        />

        <RevealGroup
          stagger={0.1}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {t.services.items.map((service) => {
            const Icon = icons[servicesMeta[service.id].icon];
            return (
              <motion.div
                key={service.id}
                variants={revealItem}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="glass rounded-3xl p-7 transition-shadow duration-300 hover:shadow-2xl hover:shadow-accent/10"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                  <Icon size={20} />
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
