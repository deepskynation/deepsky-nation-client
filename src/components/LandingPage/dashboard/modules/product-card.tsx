"use client";

import { useEffect, useMemo, useState } from "react";
import { LucideShoppingCart } from "lucide-react";
import { AuthRequiredDialog } from "@/components/LandingPage/dashboard/modules/auth-required-dialog";
import {
  glassCardClassName,
  glassCardHoverClassName,
  glassIconButtonClassName,
  glassMediaFrameClassName,
  glassPriceClassName,
} from "@/lib/glass-styles";
import { getProductCarouselSrcs } from "@/lib/product-image";
import { cn } from "@/lib/utils";
import { parseApiProductPrice, type ApiProduct } from "@/types/product";

const CAROUSEL_INTERVAL_MS = 2000;

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
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const price = parseApiProductPrice(product.price);
  const description = product.description?.trim() || "Deepsky collection.";

  const openAuthDialog = () => setAuthDialogOpen(true);

  return (
    <>
      <article
        className={cn(
          glassCardClassName,
          glassCardHoverClassName,
          "group w-full motion-safe:hover:-translate-y-1",
        )}
      >
        <div className={cn(glassMediaFrameClassName, "relative aspect-[4/5] overflow-hidden")}>
          <ProductCardMedia product={product} priority={priority} />
        </div>

        <div className="mt-3 space-y-1.5 p-2">
          <h3 className="text-sm font-semibold text-black">{product.title}</h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-black/55">{description}</p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 p-2">
          <button
            type="button"
            onClick={openAuthDialog}
            className={cn(glassPriceClassName, "cursor-pointer")}
          >
            PHP {price.toFixed(2)}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAuthDialog}
              aria-label={`Add ${product.title} to cart`}
              className={cn(glassIconButtonClassName, "size-8 cursor-pointer")}
            >
              <LucideShoppingCart className="size-3.5" />
            </button>
          </div>
        </div>
      </article>

      <AuthRequiredDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
}
