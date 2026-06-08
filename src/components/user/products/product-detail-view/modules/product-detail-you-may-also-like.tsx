"use client";

import { useEffect, useMemo } from "react";
import { Loader2Icon } from "lucide-react";
import { AnimateInView } from "@/components/LandingPage/dashboard/modules/animate-in-view";
import { ProductCard } from "@/components/common/product/ProductCard";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  pickRelatedProducts,
  relatedProductsQuery,
} from "@/lib/user-dashboard-products";
import {
  fetchReleasedProducts,
  selectShopProducts,
  selectShopProductsListError,
  selectShopProductsListStatus,
} from "@/store/slices/productSlice";

type ProductDetailYouMayAlsoLikeProps = {
  currentProductId: string;
  categoryId?: string | null;
  categoryName?: string | null;
};

export function ProductDetailYouMayAlsoLike({
  currentProductId,
  categoryId,
  categoryName,
}: ProductDetailYouMayAlsoLikeProps) {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectShopProducts);
  const listStatus = useAppSelector(selectShopProductsListStatus);
  const listError = useAppSelector(selectShopProductsListError);

  useEffect(() => {
    if (!categoryId) {
      return;
    }

    void dispatch(fetchReleasedProducts(relatedProductsQuery(categoryId)));
  }, [categoryId, dispatch]);

  const relatedProducts = useMemo(
    () => pickRelatedProducts(products, currentProductId, categoryId),
    [categoryId, currentProductId, products],
  );

  if (!categoryId) {
    return null;
  }

  const isLoading = listStatus === "loading" && relatedProducts.length === 0;

  if (listStatus === "succeeded" && relatedProducts.length === 0) {
    return null;
  }

  const sectionSubtitle = categoryName
    ? `More in ${categoryName}`
    : "More from this category";

  return (
    <section className="mt-10 border-t border-black/8 pt-10">
      <AnimateInView>
        <div className="mb-6 space-y-1">
          <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">
            Shop
          </p>
          <h2 className="font-serif text-xl font-normal text-black sm:text-2xl">
            You may also like
          </h2>
          <p className="text-sm text-black/55">{sectionSubtitle}</p>
        </div>
      </AnimateInView>

      {listError && listStatus === "failed" ? (
        <p className="text-sm text-red-600" role="alert">
          {listError}
        </p>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-[180px] items-center justify-center gap-2 text-sm text-black/50">
          <Loader2Icon className="size-5 animate-spin" aria-hidden />
          Loading recommendations…
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          {relatedProducts.map((product, index) => (
            <AnimateInView key={product.id} delay={index * 60}>
              <ProductCard
                product={product}
                priority={index < 2}
                href={`/user/products/${product.id}`}
              />
            </AnimateInView>
          ))}
        </div>
      )}
    </section>
  );
}
