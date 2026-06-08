"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "lucide-react";
import {
  LANDING_MODEL_SLIDES,
  MODEL_CAROUSEL_IMAGE_QUALITY,
  MODEL_CAROUSEL_IMAGE_SIZES,
  MODEL_CAROUSEL_INTERVAL_MS,
} from "@/lib/landing-models";
import { cn } from "@/lib/utils";

export type ModelCarouselVariant = "card" | "banner";

/** Banner strip height — taller = more visible image area. */
const BANNER_HEIGHT_CLASS = "h-[500px] sm:h-[500px] md:h-[800px]";

/** `cover` = edge-to-edge (no side bars). `contain` = full photo with empty bands. */
const BANNER_OBJECT_FIT: "contain" | "cover" = "cover";

/** Crop anchor when using `cover`: `center` | `top` | `bottom` */
const BANNER_OBJECT_POSITION = "center" as const;

const BANNER_OBJECT_POSITION_CLASS = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
} as const;

type ModelCarouselProps = {
  className?: string;
  /** card = hero column; banner = full-width strip (OFFHIGH-style) */
  variant?: ModelCarouselVariant;
};

function ModelSlideFrame({
  name,
  imageSources,
  alt,
  priority,
  variant,
}: {
  name: string;
  imageSources: string[];
  alt: string;
  priority?: boolean;
  variant: ModelCarouselVariant;
}) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const isBanner = variant === "banner";
  const activeSrc = imageSources[sourceIndex] ?? imageSources[0];

  const handleImageError = () => {
    if (sourceIndex < imageSources.length - 1) {
      setSourceIndex((index) => index + 1);
      return;
    }
    setFailed(true);
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        isBanner ? "h-full w-full bg-model-carousel" : "aspect-[4/5] bg-model-carousel",
      )}
    >
      {!failed ? (
        <Image
          key={activeSrc}
          src={activeSrc}
          alt={alt}
          fill
          unoptimized
          priority={priority}
          quality={MODEL_CAROUSEL_IMAGE_QUALITY}
          sizes={isBanner ? MODEL_CAROUSEL_IMAGE_SIZES : "(max-width: 420px) 100vw, 420px"}
          className={cn(
            isBanner
              ? cn(
                  BANNER_OBJECT_FIT === "cover" ? "object-cover" : "object-contain",
                  BANNER_OBJECT_POSITION_CLASS[BANNER_OBJECT_POSITION],
                )
              : "object-cover object-top",
          )}
          onError={handleImageError}
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-model-carousel-muted via-model-carousel to-model-carousel-deep px-6 text-center",
          )}
        >
          <span className="text-[10px] font-medium tracking-[0.35em] text-white/50 uppercase">
            DeepSky
          </span>
          <span className={cn("font-serif text-white/95", isBanner ? "text-4xl" : "text-3xl")}>
            {name}
          </span>
          {!isBanner && (
            <p className="max-w-[12rem] text-xs leading-relaxed text-white/45">
              Add{" "}
              <span className="font-mono text-white/60">{imageSources[imageSources.length - 1]}</span>
            </p>
          )}
        </div>
      )}
      {!isBanner && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-5 pb-5 pt-16">
          <p className="text-[10px] tracking-[0.28em] text-white/70 uppercase">{name}</p>
        </div>
      )}
    </div>
  );
}

export function ModelCarousel({ className, variant = "card" }: ModelCarouselProps) {
  const isBanner = variant === "banner";
  const slideCount = LANDING_MODEL_SLIDES.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % slideCount) + slideCount) % slideCount);
    },
    [slideCount],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (isPaused || prefersReducedMotion || slideCount <= 1) {
      return;
    }

    const timer = window.setInterval(goNext, MODEL_CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused, prefersReducedMotion, slideCount]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        goPrev();
      }
      if (event.key === "ArrowRight") {
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  const arrowClass = cn(
    "absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black/55 focus-visible:ring-2 focus-visible:ring-white/80",
    isBanner
      ? "size-10 opacity-80 hover:opacity-100 sm:size-11"
      : "size-9 opacity-0 group-hover/carousel:opacity-100 focus-visible:opacity-100 sm:size-10",
  );

  return (
    <div
      className={cn(
        "group/carousel relative",
        isBanner ? "w-full" : "w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px]",
        className,
      )}
      role="region"
      aria-roledescription="carousel"
      aria-label="Model Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div
        className={cn(
          "overflow-hidden bg-model-carousel",
          isBanner
            ? cn("w-full rounded-none", BANNER_HEIGHT_CLASS)
            : "rounded-2xl border border-black/10 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] ring-1 ring-white/60",
        )}
      >
        <div
          className={cn(
            "flex h-full will-change-transform",
            prefersReducedMotion
              ? ""
              : "transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]",
          )}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {LANDING_MODEL_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className="h-full min-w-full shrink-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slideCount}`}
              aria-hidden={index !== activeIndex}
            >
              <ModelSlideFrame
                name={slide.name}
                imageSources={slide.imageSources}
                alt={slide.alt}
                priority={index === 0}
                variant={variant}
              />
            </div>
          ))}
        </div>
      </div>

      {slideCount > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className={cn(arrowClass, isBanner ? "left-4 sm:left-6" : "left-2 sm:left-3")}
            aria-label="Previous Model"
          >
            <ChevronLeftIcon className="size-5" />
          </button>

          <button
            type="button"
            onClick={goNext}
            className={cn(arrowClass, isBanner ? "right-4 sm:right-6" : "right-2 sm:right-3")}
            aria-label="Next Model"
          >
            <ChevronRightIcon className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsPaused((paused) => !paused)}
            className={cn(
              "absolute z-10 flex items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/50",
              isBanner ? "top-4 right-4 size-9 sm:top-6 sm:right-6" : "bottom-3 right-3 size-8",
            )}
            aria-label={isPaused ? "Resume Slideshow" : "Pause Slideshow"}
          >
            {isPaused ? (
              <PlayIcon className="size-3.5" />
            ) : (
              <PauseIcon className="size-3.5" />
            )}
          </button>
        </>
      )}

      <div
        className={cn(
          "flex items-center justify-center gap-2",
          isBanner
            ? "absolute inset-x-0 bottom-4 z-10 sm:bottom-6"
            : "mt-4",
        )}
      >
        {LANDING_MODEL_SLIDES.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(index)}
              className={cn(
                "rounded-full transition-all duration-300",
                isActive
                  ? isBanner
                    ? "size-2.5 bg-white ring-2 ring-white/30"
                    : "h-2 w-7 bg-black"
                  : isBanner
                    ? "size-2 bg-white/45 hover:bg-white/70"
                    : "size-2 bg-black/25 hover:bg-black/45",
              )}
              aria-label={`Go to ${slide.name}`}
              aria-current={isActive ? "true" : undefined}
            />
          );
        })}
      </div>

      {!isBanner && (
        <p className="mt-2 text-center text-[10px] tracking-[0.22em] text-black/40 uppercase">
          {LANDING_MODEL_SLIDES[activeIndex]?.name}
        </p>
      )}
    </div>
  );
}
