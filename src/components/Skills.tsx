"use client";

import { motion } from "framer-motion";
import { Gamepad2, Network, Shield } from "lucide-react";
import { RevealGroup, revealItem } from "./Reveal";
import { SectionBackground } from "./SectionBackground";
import { SectionHeading } from "./SectionHeading";
import { skillCategories } from "@/lib/data";

const icons = {
  "Siber Güvenlik ve Ağ": Shield,
  "Oyun Geliştirme": Gamepad2,
  "Kurumsal Yazılım ve Entegrasyon": Network,
} as const;

export function Skills() {
  return (
    <section id="skills" className="relative overflow-hidden px-6 py-28 sm:py-32">
      <SectionBackground variant="lines" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="Yetenekler"
          title="Üç disiplin, tek analitik bakış"
          description="Siber güvenlikten oyun geliştirmeye, kurumsal entegrasyondan otomasyona kadar geniş bir teknik yelpaze."
        />

        <RevealGroup
          stagger={0.12}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {skillCategories.map((category) => {
            const Icon = icons[category.title as keyof typeof icons];
            return (
              <motion.div
                key={category.title}
                variants={revealItem}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`glass rounded-3xl p-7 transition-shadow duration-300 hover:shadow-2xl hover:shadow-accent/10 ${
                  category.size === "lg" ? "sm:col-span-2" : ""
                }`}
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                  <Icon size={20} />
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {category.title}
                </h3>

                <ul className="mt-4 space-y-3">
                  {category.items.map((item) => (
                    <li key={item.label}>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {item.description}
                      </p>
                    </li>
                  ))}
                </ul>

                {category.tools && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {category.tools.map((tool) => (
                      <span
                        key={tool}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
