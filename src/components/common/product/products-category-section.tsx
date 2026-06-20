"use client";

import Link from "next/link";
import { AnimateInView } from "@/components/common/animation/animate-in-view";
import { ProductCard } from "@/components/common/product/ProductCard";
import { cn } from "@/lib/utils";
import type { ApiProduct } from "@/types/product";

type ProductsCategorySectionProps = {
  title: string;
  products: ApiProduct[];
  totalCount?: number;
  viewAllHref?: string;
  isPageLoading?: boolean;
  priorityCount?: number;
  cardVariant?: "shop" | "landing";
};

export function ProductsCategorySection({
  title,
  products,
  totalCount,
  viewAllHref,
  isPageLoading = false,
  priorityCount = 0,
  cardVariant = "shop",
}: ProductsCategorySectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <AnimateInView>
        <h3 className="font-serif text-xl font-normal text-black sm:text-2xl">
          {title}
        </h3>
      </AnimateInView>

      <div
        className={cn(
          "grid gap-4",
          cardVariant === "landing"
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
          isPageLoading && "pointer-events-none opacity-60",
        )}
      >
        {products.map((product, index) => (
          <AnimateInView key={product.id} className="h-full" delay={index * 60}>
            <ProductCard
              product={product}
              priority={index < priorityCount}
              variant={cardVariant}
              href={`/products/${product.id}`}
            />
          </AnimateInView>
        ))}
      </div>

      {viewAllHref && (totalCount ?? products.length) > products.length ? (
        <AnimateInView>
          <div className="flex justify-center pt-1">
            <Link
              href={viewAllHref}
              className="inline-flex h-10 items-center justify-center rounded-full border border-black/15 bg-black px-5 text-[11px] uppercase tracking-[0.18em] text-white transition hover:border-black hover:bg-white hover:text-black"
            >
              View all ({totalCount ?? products.length})
            </Link>
          </div>
        </AnimateInView>
      ) : null}
    </section>
  );
}
