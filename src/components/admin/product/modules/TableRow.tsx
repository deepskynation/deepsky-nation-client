"use client";

import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/common/dialogs/confirm-delete-dialog";
import { useToast } from "@/components/common/feedback/toast-provider";
import { ProductDetailsDialog } from "@/components/admin/product/modules/product-details-dialog";
import { ProductRowActionsMenu } from "@/components/admin/product/modules/product-row-actions-menu";
import { ProductThumbnail } from "@/components/admin/product/modules/product-thumbnail";
import { tableRowClassName } from "@/lib/panel-styles";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  clearProductDetail,
  deleteAdminProduct,
  resetDeleteProduct,
  selectDeleteProductError,
  selectDeleteProductStatus,
} from "@/store/slices/productSlice";
import type { ApiProduct, ProductVisibility } from "@/types/product";
import { parseApiProductPrice } from "@/types/product";
import { isProductOnSale } from "@/lib/product-variants";

export type TableRowProps = {
  product: ApiProduct;
  className?: string;
  onEdit?: (productId: string) => void;
};

function formatPrice(price: string): string {
  return parseApiProductPrice(price).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(iso),
  );
}

function visibilityStyles(visibility: ProductVisibility): string {
  return visibility === "released"
    ? "border-emerald-200/80 bg-emerald-50 text-emerald-800"
    : "border-neutral-200 bg-neutral-100 text-neutral-700";
}

export default function TableRow({ product, className, onEdit }: TableRowProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const deleteStatus = useAppSelector(selectDeleteProductStatus);
  const deleteError = useAppSelector(selectDeleteProductError);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const priceLabel = formatPrice(product.price);
  const salePriceLabel = product.sale_price ? formatPrice(product.sale_price) : null;
  const onSale = isProductOnSale(product);
  const dateAddedLabel = formatDate(product.created_at);
  const isDeleting = deleteStatus === "loading";

  const handleDeleteConfirm = async () => {
    dispatch(resetDeleteProduct());
    const result = await dispatch(deleteAdminProduct(product.id));

    if (deleteAdminProduct.fulfilled.match(result)) {
      toast.success(`"${product.title}" deleted.`);
      setDeleteOpen(false);
      dispatch(clearProductDetail());
      return;
    }

    if (deleteAdminProduct.rejected.match(result)) {
      toast.error(
        typeof result.payload === "string"
          ? result.payload
          : "Failed to delete product.",
      );
    }
  };

  const handleDeleteOpenChange = (open: boolean) => {
    if (!open) {
      dispatch(resetDeleteProduct());
    }
    setDeleteOpen(open);
  };

  return (
    <>
      <tr className={cn(tableRowClassName, className)}>
        <td className="w-20 px-4 py-3.5">
          <ProductThumbnail product={product} size="md" />
        </td>

        <td className="px-4 py-3.5">
          <div className="min-w-0 max-w-[240px]">
            <p className="truncate font-medium text-neutral-900">{product.title}</p>
            {product.description ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {product.description}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-neutral-400">No description</p>
            )}
          </div>
        </td>

        <td className="hidden px-4 py-3.5 md:table-cell">
          <span className="text-sm text-neutral-600">
            {product.category_name ?? "—"}
          </span>
        </td>

        <td className="px-4 py-3.5 text-right text-sm font-medium whitespace-nowrap text-neutral-900 tabular-nums">
          {onSale && salePriceLabel ? (
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs font-normal text-neutral-400 line-through">
                {priceLabel}
              </span>
              <span>{salePriceLabel}</span>
            </div>
          ) : (
            priceLabel
          )}
        </td>

        <td className="px-4 py-3.5 text-right whitespace-nowrap">
          <span
            className={cn(
              "inline-flex min-w-[2.5rem] justify-end text-sm font-semibold tabular-nums",
              product.total_stock <= 0
                ? "text-red-600"
                : product.total_stock <= 5
                  ? "text-amber-700"
                  : "text-neutral-900",
            )}
            title={
              product.variants.length > 1
                ? `${product.variants.length} variants`
                : undefined
            }
          >
            {product.total_stock}
          </span>
          {product.variants.length > 1 && (
            <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
              {product.variants.length} variants
            </p>
          )}
        </td>

        <td className="px-4 py-3.5">
          <span
            className={cn(
              "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
              visibilityStyles(product.visibility),
            )}
          >
            {product.visibility}
          </span>
        </td>

        <td className="hidden px-4 py-3.5 text-sm whitespace-nowrap text-muted-foreground lg:table-cell">
          {dateAddedLabel}
        </td>

        <td className="px-4 py-3.5 whitespace-nowrap">
          <span className="rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-xs font-medium text-neutral-700">
            {product.product_code}
          </span>
        </td>

        <td className="w-12 px-2 py-3.5 text-right whitespace-nowrap">
          <ProductRowActionsMenu
            onView={() => setDetailsOpen(true)}
            onEdit={onEdit ? () => onEdit(product.id) : undefined}
            onDelete={() => setDeleteOpen(true)}
            disabled={isDeleting}
          />
        </td>
      </tr>

      <ProductDetailsDialog
        product={product}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <ConfirmDeleteDialog
        title="Delete product"
        description={
          product ? (
            <>
              Permanently delete{" "}
              <span className="font-medium text-neutral-900">{product.title}</span>{" "}
              (<span className="font-mono text-xs">{product.product_code}</span>)? This
              cannot be undone.
            </>
          ) : (
            "This product will be permanently removed."
          )
        }
        open={deleteOpen}
        onOpenChange={handleDeleteOpenChange}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </>
  );
}
