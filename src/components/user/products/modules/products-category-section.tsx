"use client";

import { AnimateInView } from "@/components/common/animation/animate-in-view";
import { ProductCard } from "@/components/common/product/ProductCard";
import { cn } from "@/lib/utils";
import type { ApiProduct } from "@/types/product";

type ProductsCategorySectionProps = {
  title: string;
  products: ApiProduct[];
  isPageLoading?: boolean;
  priorityCount?: number;
};

export function ProductsCategorySection({
  title,
  products,
  isPageLoading = false,
  priorityCount = 0,
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
          "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4",
          isPageLoading && "pointer-events-none opacity-60",
        )}
      >
        {products.map((product, index) => (
          <AnimateInView key={product.id} delay={index * 60}>
            <ProductCard
              product={product}
              priority={index < priorityCount}
              href={`/user/products/${product.id}`}
            />
          </AnimateInView>
        ))}
      </div>
    </section>
  );
}
