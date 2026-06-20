"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  glassCardClassName,
  glassCardHoverClassName,
  glassMediaFrameClassName,
} from "@/lib/glass-styles";
import { getProductCarouselSrcs } from "@/lib/product-image";
import { cn } from "@/lib/utils";
import { parseApiProductPrice, type ApiProduct } from "@/types/product";

const CAROUSEL_INTERVAL_MS = 1000;

type ProductCardMediaProps = {
  product: ApiProduct;
  priority?: boolean;
};

function ProductCardMedia({ product, priority = false }: ProductCardMediaProps) {
  const slides = useMemo(() => getProductCarouselSrcs(product), [product]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const hasCarousel = slides.length > 1;

  useEffect(() => {
    if (!isHovered || !hasCarousel) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [hasCarousel, isHovered, slides.length]);

  const handleMouseEnter = () => {
    if (hasCarousel) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setActiveIndex(0);
  };

  if (slides.length === 0) {
    return (
      <div className="flex size-full items-center justify-center bg-white/20 text-2xl font-semibold text-black/30">
        {product.title.slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className="relative size-full motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {slides.map((src, index) => (
        <img
          key={`${product.id}-${index}`}
          src={src}
          alt={product.title}
          fetchPriority={priority && index === 0 ? "high" : "auto"}
          loading={priority && index === 0 ? "eager" : "lazy"}
          className={cn(
            "absolute inset-0 block size-full object-cover transition-opacity duration-500",
            index === activeIndex ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      {hasCarousel && isHovered ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1"
          aria-hidden
        >
          {slides.map((_, index) => (
            <span
              key={index}
              className={cn(
                "size-1 rounded-full transition-colors",
                index === activeIndex ? "bg-white" : "bg-white/45",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

type ProductCardProps = {
  product: ApiProduct;
  priority?: boolean;
  /** When set, the whole card links to this route (e.g. product detail). */
  href?: string;
  /** `landing` shows a longer description preview for homepage grids. */
  variant?: "shop" | "landing";
};

export function ProductCard({
  product,
  priority = false,
  href,
  variant = "shop",
}: ProductCardProps) {
  const price = parseApiProductPrice(product.price);

  const productCardTextClassName =
    "text-xs font-normal leading-snug text-black/90 sm:text-sm";

  const cardClassName = cn(
    glassCardClassName,
    glassCardHoverClassName,
    "group flex h-full w-full flex-col motion-safe:hover:-translate-y-1",
    href && "cursor-pointer",
  );

  const content = (
    <>
      <div
        className={cn(
          glassMediaFrameClassName,
          "relative aspect-[4/5] shrink-0 overflow-hidden",
        )}
      >
        <ProductCardMedia product={product} priority={priority} />
      </div>

      <div className="mt-3 flex flex-1 flex-col px-1 pb-2 sm:px-2">
        <h4
          className={cn(
            productCardTextClassName,
            "text-[11px] sm:text-xs line-clamp-2 uppercase tracking-wide",
          )}
        >
          {product.title}
        </h4>
        <p className={cn(productCardTextClassName, "mt-1.5 tabular-nums")}>
          <span className="text-[1.2em] leading-none">₱</span>
          {price.toFixed(2)} PHP
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClassName} aria-label={`View ${product.title}`}>
        {content}
      </Link>
    );
  }

  return <article className={cardClassName}>{content}</article>;
}
