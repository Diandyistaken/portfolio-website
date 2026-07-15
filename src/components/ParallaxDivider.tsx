"use client";

import Image from "next/image";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type ParallaxDividerProps = {
  src: string;
  alt: string;
  heightClass?: string;
  children?: ReactNode;
};

export function ParallaxQuote({ id }: { id: "day" | "sunset" }) {
  const { t } = useLanguage();
  return <>{t.dividers[id]}</>;
}

export function ParallaxDivider({
  src,
  alt,
  heightClass = "h-[42vh] 3xl:h-[52vh]",
  children,
}: ParallaxDividerProps) {
  const targetRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [perfLite, setPerfLite] = useState(false);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setPerfLite(root.classList.contains("perf-lite"));
    update();

    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const staticImage = reducedMotion || perfLite;

  return (
    <section
      ref={targetRef}
      aria-label={alt}
      className={`relative w-full overflow-hidden ${heightClass}`}
    >
      {staticImage ? (
        <div className="absolute inset-0">
          <Image src={src} alt={alt} fill sizes="100vw" quality={90} className="object-cover" />
        </div>
      ) : (
        <m.div className="absolute inset-x-0 -inset-y-[18%]" style={{ y }}>
          <Image src={src} alt={alt} fill sizes="100vw" quality={90} className="object-cover" />
        </m.div>
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgb(5_7_12/0.64)_0%,transparent_24%,transparent_76%,rgb(5_7_12/0.7)_100%)]"
        aria-hidden="true"
      />
      {children && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center sm:px-10">
          <p className="font-display max-w-3xl text-balance text-2xl font-semibold tracking-tight text-white drop-shadow-[0_3px_18px_rgb(0_0_0/0.75)] sm:text-4xl 3xl:max-w-5xl 3xl:text-5xl">
            {children}
          </p>
        </div>
      )}
    </section>
  );
}
