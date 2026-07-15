"use client";

import Image from "next/image";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type LightboxImage = {
  src: string;
  alt: string;
};

type LightboxProps = {
  images: LightboxImage[];
  openIndex: number | null;
  onClose: () => void;
};

const EASE = [0.22, 1, 0.36, 1] as const;

type LightboxDialogProps = Omit<LightboxProps, "openIndex"> & {
  initialIndex: number;
};

function LightboxDialog({ images, initialIndex, onClose }: LightboxDialogProps) {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }

      if (images.length > 1 && event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((index) => (index - 1 + images.length) % images.length);
        return;
      }

      if (images.length > 1 && event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % images.length);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (document.activeElement === dialogRef.current) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [images.length]);

  const activeImage = images[activeIndex] ?? images[0];
  const duration = reducedMotion ? 0 : 0.3;

  return (
    activeImage && (
        <m.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgb(5_7_12/0.9)] p-4 backdrop-blur-md sm:p-8"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease: EASE }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeRef.current();
          }}
        >
          <m.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.showcase.lightboxLabel}
            tabIndex={-1}
            className="relative flex h-full w-full items-center justify-center outline-none"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration, ease: EASE }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeRef.current();
            }}
          >
            <button
              type="button"
              aria-label={t.showcase.lightboxClose}
              onClick={() => closeRef.current()}
              className="absolute right-0 top-0 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/45 text-white/80 transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <X aria-hidden="true" size={20} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label={t.showcase.lightboxPrevious}
                  onClick={() => setActiveIndex((index) => (index - 1 + images.length) % images.length)}
                  className="absolute left-0 z-20 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/45 text-white/80 transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <ChevronLeft aria-hidden="true" size={24} />
                </button>
                <button
                  type="button"
                  aria-label={t.showcase.lightboxNext}
                  onClick={() => setActiveIndex((index) => (index + 1) % images.length)}
                  className="absolute right-0 z-20 grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/45 text-white/80 transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <ChevronRight aria-hidden="true" size={24} />
                </button>
              </>
            )}

            <AnimatePresence mode="wait" initial={false}>
              <m.div
                layout
                key={activeImage.src}
                className="relative aspect-[16/10] w-[min(92vw,75rem,calc(82vh*1.6))] overflow-hidden rounded-lg border border-white/15 bg-black/30 shadow-[0_30px_100px_rgb(0_0_0/0.65)]"
                initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration, ease: EASE }}
              >
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  fill
                  sizes="92vw"
                  className="object-contain"
                />
              </m.div>
            </AnimatePresence>
          </m.div>
        </m.div>
    )
  );
}

export function Lightbox({ images, openIndex, onClose }: LightboxProps) {
  const isOpen = openIndex !== null && images.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <LightboxDialog
          key={openIndex}
          images={images}
          initialIndex={openIndex}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}
