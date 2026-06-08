"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  glassCardClassName,
  glassCardHoverClassName,
  glassMediaFrameClassName,
  glassPriceClassName,
} from "@/lib/glass-styles";
import { getProductCarouselSrcs } from "@/lib/product-image";
import { cn } from "@/lib/utils";
import { parseApiProductPrice, type ApiProduct } from "@/types/product";

const DESCRIPTION_PREVIEW_LENGTH = 18;
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
  /** When set, the whole card links to this route (e.g. checkout page). */
  href?: string;
};

export function ProductCard({ product, priority = false, href }: ProductCardProps) {
  const price = parseApiProductPrice(product.price);
  const description = product.description?.trim() || "DeepSky collection.";
  const isDescriptionTruncated = description.length > DESCRIPTION_PREVIEW_LENGTH;
  const descriptionPreview = isDescriptionTruncated
    ? `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}…`
    : description;

  const cardClassName = cn(
    glassCardClassName,
    glassCardHoverClassName,
    "group block w-full motion-safe:hover:-translate-y-1",
    href && "cursor-pointer",
  );

  const content = (
    <>
      <div className={cn(glassMediaFrameClassName, "relative aspect-[4/5] overflow-hidden")}>
        <ProductCardMedia product={product} priority={priority} />
      </div>

      <div className="mt-3 space-y-1.5 p-2">
        <h3 className="text-sm font-semibold text-black">{product.title}</h3>
        <p className="text-xs leading-relaxed text-black/55">
          {descriptionPreview}
          {isDescriptionTruncated && href && (
            <span className="font-medium text-black/70"> See more</span>
          )}
        </p>
      </div>

      <div className="mt-3 p-2">
        <span className={glassPriceClassName}>PHP {price.toFixed(2)}</span>
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
