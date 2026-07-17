"use client";

import Image from "next/image";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HintTag } from "./HintTag";

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
// #36: flicks faster than this sail the image off-screen
const THROW_SPEED = 780;

type LightboxDialogProps = Omit<LightboxProps, "openIndex"> & {
  initialIndex: number;
};

function LightboxDialog({ images, initialIndex, onClose }: LightboxDialogProps) {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  // #35 forensic zoom: cursor-anchored 2.5x with a fake sector-analysis HUD
  const [zoomed, setZoomed] = useState(false);
  const zoomedRef = useRef(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const zoomRaf = useRef(0);
  // #36 throw-to-dismiss: state-driven fling (close or advance on landing)
  const [fine, setFine] = useState(false);
  const [flying, setFlying] = useState<{ x: number; y: number; rot: number; next: "close" | 1 | -1 } | null>(null);
  const draggedRef = useRef(false);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const raf = requestAnimationFrame(() =>
      setFine(!window.matchMedia("(hover: none)").matches),
    );
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    return () => {
      if (zoomRaf.current) cancelAnimationFrame(zoomRaf.current);
    };
  }, []);

  // #97 evidence board: tell the gallery this image has been analyzed
  useEffect(() => {
    const src = images[activeIndex]?.src;
    if (src) window.dispatchEvent(new CustomEvent("app:evidence-viewed", { detail: src }));
  }, [activeIndex, images]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        // zoomed → Esc springs back to 1x first, second Esc closes
        if (zoomedRef.current) {
          zoomedRef.current = false;
          setZoomed(false);
          return;
        }
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
  const canPlay = fine && !reducedMotion;

  const toggleZoom = () => {
    if (!canPlay || draggedRef.current) return;
    zoomedRef.current = !zoomedRef.current;
    setZoomed(zoomedRef.current);
  };

  const onImageMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canPlay) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));
    if (zoomRaf.current) return;
    zoomRaf.current = requestAnimationFrame(() => {
      zoomRaf.current = 0;
      setOrigin({ x, y });
    });
  };

  const onDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { velocity: { x: number; y: number } },
  ) => {
    // suppress the click that follows a drag so it doesn't toggle zoom
    draggedRef.current = true;
    setTimeout(() => {
      draggedRef.current = false;
    }, 120);
    const speed = Math.hypot(info.velocity.x, info.velocity.y);
    if (speed < THROW_SPEED) return; // slow drags rubber-band back (dragSnapToOrigin)
    const sideways = Math.abs(info.velocity.x) > Math.abs(info.velocity.y);
    setFlying({
      x: info.velocity.x * 0.45,
      y: info.velocity.y * 0.45,
      rot: Math.max(-24, Math.min(24, info.velocity.x * 0.02)),
      // thrown sideways → advance in throw direction; otherwise close
      next: sideways && images.length > 1 ? (info.velocity.x < 0 ? 1 : -1) : "close",
    });
  };

  const onFlightDone = () => {
    if (!flying) return;
    if (flying.next === "close") {
      closeRef.current();
      return;
    }
    const step = flying.next;
    setFlying(null);
    setActiveIndex((index) => (index + step + images.length) % images.length);
  };

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
                drag={canPlay && !zoomed}
                dragSnapToOrigin
                dragElastic={0.5}
                dragMomentum={false}
                onDragEnd={canPlay ? onDragEnd : undefined}
                whileDrag={{ scale: 0.94 }}
                onClick={toggleZoom}
                onMouseMove={onImageMove}
                className={`relative aspect-[16/10] w-[min(92vw,75rem,calc(82vh*1.6))] overflow-hidden rounded-lg border border-white/15 bg-black/30 shadow-[0_30px_100px_rgb(0_0_0/0.65)] ${
                  canPlay ? (zoomed ? "cursor-zoom-out" : "cursor-zoom-in") : ""
                }`}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
                animate={
                  flying
                    ? { opacity: 0, x: flying.x, y: flying.y, rotate: flying.rot }
                    : { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }
                }
                onAnimationComplete={flying ? onFlightDone : undefined}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={flying ? { duration: 0.35, ease: "easeOut" } : { duration, ease: EASE }}
              >
                <m.div
                  className="h-full w-full"
                  animate={{ scale: zoomed ? 2.5 : 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 26 }}
                  style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
                >
                  <Image
                    src={activeImage.src}
                    alt={activeImage.alt}
                    fill
                    sizes="92vw"
                    draggable={false}
                    className="pointer-events-none object-contain"
                  />
                </m.div>
                {/* #86 chromatic open: one-beat RGB-split resolving sharp,
                    plus corner brackets flying in to frame the evidence */}
                {!reducedMotion && (
                  <>
                    <m.div
                      aria-hidden="true"
                      initial={{ opacity: 0.35, x: 7 }}
                      animate={{ opacity: 0, x: 0 }}
                      transition={{ duration: 0.32, ease: "easeOut" }}
                      className="pointer-events-none absolute inset-0 mix-blend-screen [filter:sepia(1)_hue-rotate(165deg)_saturate(4)_brightness(1.15)]"
                    >
                      <Image src={activeImage.src} alt="" fill sizes="92vw" className="object-contain" />
                    </m.div>
                    <m.div
                      aria-hidden="true"
                      initial={{ opacity: 0.3, x: -7 }}
                      animate={{ opacity: 0, x: 0 }}
                      transition={{ duration: 0.32, ease: "easeOut" }}
                      className="pointer-events-none absolute inset-0 mix-blend-screen brightness-150 grayscale"
                    >
                      <Image src={activeImage.src} alt="" fill sizes="92vw" className="object-contain" />
                    </m.div>
                    {[
                      { key: "tl", pos: "left-1 top-1", border: "border-l-2 border-t-2", ix: -70, iy: -70 },
                      { key: "tr", pos: "right-1 top-1", border: "border-r-2 border-t-2", ix: 70, iy: -70 },
                      { key: "bl", pos: "left-1 bottom-1", border: "border-l-2 border-b-2", ix: -70, iy: 70 },
                      { key: "br", pos: "right-1 bottom-1", border: "border-r-2 border-b-2", ix: 70, iy: 70 },
                    ].map((corner) => (
                      <m.span
                        key={corner.key}
                        aria-hidden="true"
                        initial={{ x: corner.ix, y: corner.iy, opacity: 0 }}
                        animate={{ x: 0, y: 0, opacity: 0.85 }}
                        transition={{ duration: 0.4, ease: EASE, delay: 0.08 }}
                        className={`pointer-events-none absolute z-10 h-6 w-6 ${corner.pos} ${corner.border} border-accent/80`}
                      />
                    ))}
                  </>
                )}
                {/* #35 HUD: fake sector coordinates while analyzing */}
                {canPlay && zoomed && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-3 z-10 rounded border border-accent/40 bg-black/60 px-2 py-1 font-mono text-[0.62rem] tracking-[0.14em] text-accent"
                  >
                    ANALYZING SECTOR [{String(Math.round(origin.x * 12.8)).padStart(4, "0")},
                    {String(Math.round(origin.y * 8)).padStart(3, "0")}] · 2.5x
                  </span>
                )}
              </m.div>
            </AnimatePresence>
            {canPlay && (
              <span className="pointer-events-none absolute bottom-2 left-1/2 z-20 -translate-x-1/2">
                <HintTag text={t.hints.lightboxTips} />
              </span>
            )}
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
