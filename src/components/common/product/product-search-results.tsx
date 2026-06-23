"use client";

import Link from "next/link";
import { AnimateInView } from "@/components/common/animation/animate-in-view";
import {
  glassCardClassName,
  glassCardHoverClassName,
  glassMediaFrameClassName,
} from "@/lib/glass-styles";
import { getProductThumbnailSrc } from "@/lib/product-image";
import { cn } from "@/lib/utils";
import type { ApiProduct } from "@/types/product";

type ProductSearchResultsProps = {
  products: ApiProduct[];
  searchQuery: string;
  cardVariant?: "shop" | "landing";
};

export function ProductSearchResults({
  products,
  searchQuery,
  cardVariant = "shop",
}: ProductSearchResultsProps) {
  return (
    <section className="space-y-5">
      <AnimateInView>
        <h3 className="font-serif text-xl font-normal text-black sm:text-2xl">
          Results for &ldquo;{searchQuery}&rdquo;
        </h3>
      </AnimateInView>

      <div
        className={cn(
          "grid gap-4",
          cardVariant === "landing"
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
        )}
      >
        {products.map((product, index) => {
          const thumbnailSrc = getProductThumbnailSrc(product);

          return (
            <AnimateInView key={product.id} className="h-full" delay={index * 60}>
              <Link
                href={`/products/${product.id}`}
                className={cn(
                  glassCardClassName,
                  glassCardHoverClassName,
                  "group flex h-full w-full flex-col motion-safe:hover:-translate-y-1",
                )}
                aria-label={`View ${product.title}`}
              >
                <div
                  className={cn(
                    glassMediaFrameClassName,
                    "relative aspect-[4/5] shrink-0 overflow-hidden",
                  )}
                >
                  {thumbnailSrc ? (
                    <img
                      src={thumbnailSrc}
                      alt={product.title}
                      loading={index < 3 ? "eager" : "lazy"}
                      fetchPriority={index < 3 ? "high" : "auto"}
                      className="block size-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-white/20 text-2xl font-semibold text-black/30">
                      {product.title.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-1 flex-col px-1 pb-2 sm:px-2">
                  <h4 className="text-[11px] font-normal leading-snug text-black/90 line-clamp-2 uppercase tracking-wide sm:text-xs">
                    {product.title}
                  </h4>
                </div>
              </Link>
            </AnimateInView>
          );
        })}
      </div>
    </section>
  );
}
