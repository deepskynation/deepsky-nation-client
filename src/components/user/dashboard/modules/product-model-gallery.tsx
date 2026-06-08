"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react";
import type { ModelGallerySlide } from "@/lib/user-dashboard-products";
import { cn } from "@/lib/utils";

const GALLERY_INTERVAL_MS = 3500;

/** Fills the viewport below the sticky user header — image scales inside with object-contain. */
export const productModelGalleryShellClassName =
  "h-[calc(100dvh-6rem)] md:h-[calc(100dvh-4.5rem)]";

type ProductModelGalleryProps = {
  slides: ModelGallerySlide[];
  className?: string;
};

export function ProductModelGallery({ slides, className }: ProductModelGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slideCount = slides.length;
  const activeSlide = slides[activeIndex];

  const goTo = useCallback(
    (index: number) => {
      if (slideCount === 0) {
        return;
      }
      setActiveIndex((index + slideCount) % slideCount);
    },
    [slideCount],
  );

  useEffect(() => {
    if (slideCount <= 1 || isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount);
    }, GALLERY_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, slideCount]);

  if (!activeSlide) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-model-carousel",
        className ?? productModelGalleryShellClassName,
      )}
    >
      {slides.map((slide, index) => (
        <Link
          key={slide.id}
          href={slide.href}
          className={cn(
            "absolute inset-0 block bg-model-carousel transition-opacity duration-700",
            index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={index !== activeIndex}
        >
          <Image
            src={slide.imageSrc}
            alt={slide.alt}
            fill
            unoptimized
            priority={index === 0}
            sizes="100vw"
            className="object-contain object-center"
          />
        </Link>
      ))}

      {slideCount > 1 ? (
        <>
          <button
            type="button"
            className="absolute top-1/2 left-3 z-10 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/55"
            aria-label="Previous Model"
            onClick={() => goTo(activeIndex - 1)}
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/55"
            aria-label="Next Model"
            onClick={() => goTo(activeIndex + 1)}
          >
            <ChevronRightIcon className="size-5" />
          </button>
          <button
            type="button"
            className="absolute top-4 right-4 z-10 rounded-full bg-black/35 p-2 text-white backdrop-blur-sm transition hover:bg-black/55"
            aria-label={isPaused ? "Play Slideshow" : "Pause Slideshow"}
            onClick={() => setIsPaused((value) => !value)}
          >
            {isPaused ? <PlayIcon className="size-4" /> : <PauseIcon className="size-4" />}
          </button>
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show ${slide.productTitle}`}
                className={cn(
                  "size-2 rounded-full transition",
                  index === activeIndex ? "bg-white" : "bg-white/45 hover:bg-white/70",
                )}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
