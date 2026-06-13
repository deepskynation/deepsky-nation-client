"use client";

import { useEffect } from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { toImagePreviewSrc } from "@/lib/read-image-base64";
import { cn } from "@/lib/utils";
import {
  clearProductDetail,
  fetchAdminProduct,
  selectAdminProductDetail,
  selectAdminProductDetailError,
  selectAdminProductDetailStatus,
} from "@/store/slices/productSlice";
import type { ApiProduct, ApiProductImage, ProductImageRole } from "@/types/product";
import {
  alertErrorClassName,
  sectionClassName,
  sectionTitleClassName,
} from "@/lib/panel-styles";
import { parseApiProductPrice } from "@/types/product";

const ROLE_SECTIONS: { role: ProductImageRole; title: string }[] = [
  { role: "placeholder", title: "Placeholder 1" },
  { role: "model", title: "Placeholder 2" },
  { role: "sizing", title: "Size Chart" },
  { role: "gallery", title: "Gallery" },
];

type ProductDetailsDialogProps = {
  product: ApiProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatPrice(price: string): string {
  return parseApiProductPrice(price).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function imagesByRole(images: ApiProductImage[], role: ProductImageRole) {
  return images.filter((image) => image.role === role);
}

function formatProductDetails(
  details: ApiProduct["details"],
): string[] {
  if (!details) {
    return [];
  }
  if (Array.isArray(details)) {
    return details
      .filter((line): line is string => typeof line === "string")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return Object.entries(details).map(([key, value]) => `${key}: ${String(value)}`);
}

function ImageGrid({ images, emptyLabel }: { images: ApiProductImage[]; emptyLabel: string }) {
  if (images.length === 0) {
    return <p className="text-xs text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {images.map((image) => (
        <li
          key={image.id}
          className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50"
        >
          <img
            src={toImagePreviewSrc(image.image_base64)}
            alt=""
            className="aspect-square size-full object-cover"
          />
        </li>
      ))}
    </ul>
  );
}

export function ProductDetailsDialog({
  product,
  open,
  onOpenChange,
}: ProductDetailsDialogProps) {
  const dispatch = useAppDispatch();
  const detail = useAppSelector(selectAdminProductDetail);
  const detailStatus = useAppSelector(selectAdminProductDetailStatus);
  const detailError = useAppSelector(selectAdminProductDetailError);

  const display = detail?.id === product.id ? detail : null;
  const specLines = display ? formatProductDetails(display.details) : [];
  const isLoading = detailStatus === "loading" && !display;

  useEffect(() => {
    if (!open) {
      dispatch(clearProductDetail());
      return;
    }
    void dispatch(fetchAdminProduct(product.id));
  }, [dispatch, open, product.id]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      dispatch(clearProductDetail());
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[min(90vh,720px)] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-neutral-200/80 px-6 py-5">
          <DialogTitle className="pr-8 text-lg">{product.title}</DialogTitle>
          <DialogDescription className="font-mono text-xs text-neutral-500">
            {product.product_code}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2Icon className="size-5 animate-spin" />
            Loading images and variants…
          </div>
        )}

        {detailError && detailStatus === "failed" && (
          <p className={alertErrorClassName} role="alert">
            {detailError}
          </p>
        )}

        {display && (
          <div className="space-y-6">
            <dl className="grid gap-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-neutral-500">Category</dt>
                <dd className="mt-0.5 font-medium text-neutral-900">
                  {display.category_name ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Price</dt>
                <dd className="font-medium tabular-nums">{formatPrice(display.price)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Visibility</dt>
                <dd className="capitalize">{display.visibility}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Total Stock</dt>
                <dd className="font-semibold tabular-nums">{display.total_stock}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-muted-foreground">Updated</dt>
                <dd>{formatDate(display.updated_at)}</dd>
              </div>
              {display.description && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-muted-foreground">Description</dt>
                  <dd className="text-muted-foreground">{display.description}</dd>
                </div>
              )}
              {specLines.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-muted-foreground">Details</dt>
                  <dd>
                    <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                      {specLines.map((line, index) => (
                        <li key={`detail-${index}`}>{line}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>

            <div className={sectionClassName}>
              <h3 className={sectionTitleClassName}>Images</h3>
              {ROLE_SECTIONS.map(({ role, title }) => {
                const roleImages = imagesByRole(display.images, role);
                if (
                  (role === "model" || role === "sizing") &&
                  roleImages.length === 0
                ) {
                  return null;
                }
                return (
                  <div key={role} className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {title}
                      <span className="ml-1 font-normal">({roleImages.length})</span>
                    </p>
                    <ImageGrid
                      images={roleImages}
                      emptyLabel={
                        role === "gallery"
                          ? "No gallery images."
                          : role === "sizing"
                            ? "No size chart."
                            : role === "model"
                              ? "No Placeholder 2 image."
                              : "No Placeholder 1 image."
                      }
                    />
                  </div>
                );
              })}
              {display.images.length === 0 && (
                <p className="text-sm text-muted-foreground">No images on this product.</p>
              )}
            </div>

            {display.variants.length > 0 && (
              <div className={sectionClassName}>
                <h3 className={sectionTitleClassName}>Variants</h3>
                <div className="overflow-x-auto rounded-lg border border-neutral-200/90 bg-white shadow-sm">
                  <table className="w-full min-w-[320px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50/80 text-left text-xs text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Size</th>
                        <th className="px-3 py-2 font-medium">Color</th>
                        <th className="px-3 py-2 text-right font-medium">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {display.variants.map((variant) => (
                        <tr
                          key={variant.id}
                          className="border-b border-neutral-100 last:border-b-0"
                        >
                          <td className="px-3 py-2 font-medium">{variant.size}</td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1.5">
                              {variant.hex_code && (
                                <span
                                  className="size-4 rounded border border-neutral-200"
                                  style={{ backgroundColor: variant.hex_code }}
                                  aria-hidden
                                />
                              )}
                              {variant.color_name}
                            </span>
                          </td>
                          <td
                            className={cn(
                              "px-3 py-2 text-right font-medium tabular-nums",
                              variant.stock <= 0 && "text-red-600",
                            )}
                          >
                            {variant.stock}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {!isLoading && !display && !detailError && (
          <p className="text-sm text-muted-foreground">No details available.</p>
        )}
        </div>

        <div className="flex justify-end border-t border-neutral-200/80 bg-neutral-50/50 px-6 py-4">
          <Button type="button" variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
