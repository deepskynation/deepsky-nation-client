"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GripVerticalIcon, Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PanelSectionState } from "@/components/common/feedback/panel-section-state";
import { useToast } from "@/components/common/feedback/toast-provider";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  alertErrorClassName,
  alertWarningClassName,
  fieldClassName,
  hintClassName,
  labelClassName,
  sectionClassName,
  sectionTitleClassName,
  textareaClassName,
} from "@/lib/panel-styles";
import { ProductImageSlot } from "@/components/admin/product/modules/product-image-slot";
import {
  fetchCategories,
  selectCategories,
  selectCategoriesListStatus,
} from "@/store/slices/categorySlice";
import { fetchColors, selectColors, selectColorsListStatus } from "@/store/slices/colorSlice";
import {
  clearProductErrors,
  createAdminProduct,
  fetchAdminProduct,
  resetCreateProduct,
  resetUpdateProduct,
  selectAdminProductDetail,
  selectAdminProductDetailError,
  selectAdminProductDetailStatus,
  selectCreateProductError,
  selectCreateProductStatus,
  selectUpdateProductError,
  selectUpdateProductStatus,
  updateAdminProduct,
} from "@/store/slices/productSlice";
import { selectAuthInitialized, selectIsAuthenticated } from "@/store/slices/authSlice";
import type {
  ApiProduct,
  CreateProductPayload,
  ProductImageInput,
  ProductVisibility,
  ProductVariantInput,
  ProductVariantUpdateInput,
  UpdateProductPayload,
} from "@/types/product";
import { parseApiProductPrice } from "@/types/product";
import { formatProductDetails, imagesByRole } from "@/lib/product-image";
import { toImagePreviewSrc } from "@/lib/read-image-base64";

export type AddProductFormProps = {
  /** When set, the form loads and updates an existing product. */
  productId?: string | null;
  onCancel?: () => void;
  onSaved?: () => void;
};

type VariantRow = {
  key: string;
  /** Set when editing an existing variant loaded from the API. */
  id?: string;
  size: string;
  color_id: string;
  stock: string;
};

type DetailRow = {
  key: string;
  value: string;
};

let variantKeyCounter = 0;
let detailKeyCounter = 0;

function newVariantRow(): VariantRow {
  variantKeyCounter += 1;
  return { key: `v-${variantKeyCounter}`, size: "", color_id: "", stock: "0" };
}

function newDetailRow(): DetailRow {
  detailKeyCounter += 1;
  return { key: `d-${detailKeyCounter}`, value: "" };
}

function buildDetailsPayload(rows: DetailRow[]): string[] | null {
  const lines = rows.map((row) => row.value.trim()).filter(Boolean);
  return lines.length > 0 ? lines : null;
}

function variantPairKey(size: string, colorId: string): string {
  return `${size.trim().toLowerCase()}|${colorId}`;
}

function findDuplicateVariantKeys(rows: VariantRow[]): Set<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const row of rows) {
    const size = row.size.trim();
    const colorId = row.color_id.trim();
    if (!size || !colorId) {
      continue;
    }
    const key = variantPairKey(size, colorId);
    if (seen.has(key)) {
      duplicates.add(key);
    } else {
      seen.add(key);
    }
  }

  return duplicates;
}

function reorderVariantRows(
  rows: VariantRow[],
  fromKey: string,
  toKey: string,
): VariantRow[] {
  const fromIndex = rows.findIndex((row) => row.key === fromKey);
  const toIndex = rows.findIndex((row) => row.key === toKey);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return rows;
  }

  const next = [...rows];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

const initialForm = {
  category_id: "",
  title: "",
  description: "",
  price: "",
  sale_price: "",
  visibility: "private" as ProductVisibility,
  is_featured: false,
};

type ProductFormFieldErrors = {
  category_id?: boolean;
  title?: boolean;
  price?: boolean;
  sale_price?: boolean;
  placeholderImage?: boolean;
  variantsGeneral?: boolean;
  variantRows?: Record<
    string,
    { size?: boolean; color_id?: boolean; stock?: boolean; duplicate?: boolean }
  >;
};

const invalidFieldClassName =
  "border-red-500 ring-2 ring-red-200 focus:border-red-500 focus:ring-red-200";

function validateProductForm(
  form: typeof initialForm,
  placeholderImage: string | null,
  variants: VariantRow[],
  duplicateVariantKeys: Set<string>,
): { messages: string[]; fields: ProductFormFieldErrors } {
  const messages: string[] = [];
  const fields: ProductFormFieldErrors = {};

  if (!form.category_id) {
    messages.push("Select a category.");
    fields.category_id = true;
  }

  if (!form.title.trim()) {
    messages.push("Enter a product title.");
    fields.title = true;
  }

  const parsedPrice = Number(form.price);
  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    messages.push("Enter a price greater than 0.");
    fields.price = true;
  }

  const salePriceText = form.sale_price.trim();
  if (salePriceText) {
    const parsedSalePrice = Number(salePriceText);
    if (!Number.isFinite(parsedSalePrice) || parsedSalePrice <= 0) {
      messages.push("Enter a sale price greater than 0.");
      fields.sale_price = true;
    } else if (Number.isFinite(parsedPrice) && parsedSalePrice >= parsedPrice) {
      messages.push("Sale price must be less than the regular price.");
      fields.sale_price = true;
    }
  }

  if (!placeholderImage) {
    messages.push("Upload Placeholder 1.");
    fields.placeholderImage = true;
  }

  const variantRows: NonNullable<ProductFormFieldErrors["variantRows"]> = {};
  let hasVariantIssue = false;

  if (variants.length < 1) {
    messages.push("Add at least one variant.");
    fields.variantsGeneral = true;
  } else {
    for (const row of variants) {
      const rowErrors: NonNullable<ProductFormFieldErrors["variantRows"]>[string] = {};
      const size = row.size.trim();
      const colorId = row.color_id.trim();
      const stock = Number(row.stock);

      if (!size) {
        rowErrors.size = true;
        hasVariantIssue = true;
      }
      if (!colorId) {
        rowErrors.color_id = true;
        hasVariantIssue = true;
      }
      if (!Number.isInteger(stock) || stock < 0) {
        rowErrors.stock = true;
        hasVariantIssue = true;
      }

      const pairKey = size && colorId ? variantPairKey(size, colorId) : "";
      if (pairKey && duplicateVariantKeys.has(pairKey)) {
        rowErrors.duplicate = true;
        hasVariantIssue = true;
      }

      if (Object.keys(rowErrors).length > 0) {
        variantRows[row.key] = rowErrors;
      }
    }

    if (hasVariantIssue) {
      messages.push("Complete all variant rows with size, color, and stock.");
      fields.variantRows = variantRows;
    }
  }

  return { messages, fields };
}

function scrollToFirstInvalidField(fields: ProductFormFieldErrors) {
  const targets: Array<{ active?: boolean; id: string }> = [
    { active: fields.category_id, id: "product-category" },
    { active: fields.title, id: "product-title" },
    { active: fields.price, id: "product-price" },
    { active: fields.sale_price, id: "product-sale-price" },
    { active: fields.placeholderImage, id: "product-placeholder-1" },
    { active: fields.variantsGeneral || Boolean(fields.variantRows), id: "product-variants" },
  ];

  const firstTarget = targets.find((target) => target.active);
  if (!firstTarget) {
    return;
  }

  document.getElementById(firstTarget.id)?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

function hydrateFormFromProduct(product: ApiProduct) {
  const placeholder = imagesByRole(product.images, "placeholder")[0];
  const placeholder2 = imagesByRole(product.images, "placeholder")[0];
  const sizing = imagesByRole(product.images, "sizing")[0];
  const gallery = imagesByRole(product.images, "gallery");
  const detailLines = formatProductDetails(product.details);

  return {
    form: {
      category_id: product.category_id,
      title: product.title,
      description: product.description ?? "",
      price: String(parseApiProductPrice(product.price)),
      sale_price: product.sale_price
        ? String(parseApiProductPrice(product.sale_price))
        : "",
      visibility: product.visibility,
      is_featured: Boolean(product.is_featured),
    },
    placeholderImage: placeholder
      ? toImagePreviewSrc(placeholder.image_base64)
      : null,
    placeholder2Image: placeholder2
      ? toImagePreviewSrc(placeholder2.image_base64)
      : null,
    sizingImage: sizing ? toImagePreviewSrc(sizing.image_base64) : null,
    galleryImages: [0, 1, 2].map((index) => {
      const image = gallery[index];
      return image ? toImagePreviewSrc(image.image_base64) : null;
    }) as (string | null)[],
    variants:
      product.variants.length > 0
        ? product.variants.map((variant) => ({
            key: `v-${variant.id}`,
            id: variant.id,
            size: variant.size,
            color_id: variant.color_id,
            stock: String(variant.stock),
          }))
        : [newVariantRow()],
    detailRows:
      detailLines.length > 0
        ? detailLines.map((line) => {
            detailKeyCounter += 1;
            return { key: `d-${detailKeyCounter}`, value: line };
          })
        : [newDetailRow()],
  };
}

export function AddProductForm({
  productId = null,
  onCancel,
  onSaved,
}: AddProductFormProps = {}) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const authReady = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const categories = useAppSelector(selectCategories);
  const categoriesStatus = useAppSelector(selectCategoriesListStatus);
  const colors = useAppSelector(selectColors);
  const colorsStatus = useAppSelector(selectColorsListStatus);

  const createStatus = useAppSelector(selectCreateProductStatus);
  const createError = useAppSelector(selectCreateProductError);
  const updateStatus = useAppSelector(selectUpdateProductStatus);
  const updateError = useAppSelector(selectUpdateProductError);
  const detailProduct = useAppSelector(selectAdminProductDetail);
  const detailStatus = useAppSelector(selectAdminProductDetailStatus);
  const detailError = useAppSelector(selectAdminProductDetailError);

  const isEditMode = Boolean(productId);
  const [formHydrated, setFormHydrated] = useState(!isEditMode);

  const [form, setForm] = useState(initialForm);
  const [placeholderImage, setPlaceholderImage] = useState<string | null>(null);
  const [placeholder2Image, setPlaceholder2Image] = useState<string | null>(null);
  const [sizingImage, setSizingImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const [variants, setVariants] = useState<VariantRow[]>([newVariantRow()]);
  const [detailRows, setDetailRows] = useState<DetailRow[]>([newDetailRow()]);
  const [draggedVariantKey, setDraggedVariantKey] = useState<string | null>(null);
  const [dragOverVariantKey, setDragOverVariantKey] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProductFormFieldErrors>({});

  const isSubmitting = createStatus === "loading" || updateStatus === "loading";
  const isLoadingProduct =
    isEditMode && (detailStatus === "loading" || !formHydrated);

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      return;
    }
    void dispatch(fetchCategories());
    void dispatch(fetchColors());
  }, [authReady, dispatch, isAuthenticated]);

  useEffect(() => {
    if (!productId || !authReady || !isAuthenticated) {
      if (!productId) {
        setFormHydrated(true);
      }
      return;
    }

    setFormHydrated(false);
    dispatch(clearProductErrors());
    void dispatch(fetchAdminProduct(productId));
  }, [authReady, dispatch, isAuthenticated, productId]);

  useEffect(() => {
    if (!productId || !detailProduct || detailProduct.id !== productId) {
      return;
    }

    const hydrated = hydrateFormFromProduct(detailProduct);
    setForm(hydrated.form);
    setPlaceholderImage(hydrated.placeholderImage);
    setPlaceholder2Image(hydrated.placeholder2Image);
    setSizingImage(hydrated.sizingImage);
    setGalleryImages(hydrated.galleryImages);
    setVariants(hydrated.variants);
    setDetailRows(hydrated.detailRows);
    setFormHydrated(true);
  }, [detailProduct, productId]);

  const duplicateVariantKeys = useMemo(
    () => findDuplicateVariantKeys(variants),
    [variants],
  );

  const parsedPrice = Number(form.price);
  const priceValid = Number.isFinite(parsedPrice) && parsedPrice > 0;
  const parsedSalePrice = Number(form.sale_price);
  const salePriceValid =
    !form.sale_price.trim() ||
    (Number.isFinite(parsedSalePrice) &&
      parsedSalePrice > 0 &&
      priceValid &&
      parsedSalePrice < parsedPrice);
  const hasActiveSale = form.sale_price.trim().length > 0;

  const clearBasicFieldError = (
    key: Exclude<keyof ProductFormFieldErrors, "variantRows">,
  ) => {
    setFieldErrors((current) => {
      if (!current[key]) {
        return current;
      }
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const clearVariantFieldErrors = (variantKey: string) => {
    setFieldErrors((current) => {
      if (!current.variantRows?.[variantKey]) {
        return current;
      }
      const nextVariantRows = { ...current.variantRows };
      delete nextVariantRows[variantKey];
      const next = { ...current };
      if (Object.keys(nextVariantRows).length === 0) {
        delete next.variantRows;
        delete next.variantsGeneral;
      } else {
        next.variantRows = nextVariantRows;
      }
      return next;
    });
  };

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setPlaceholderImage(null);
    setPlaceholder2Image(null);
    setSizingImage(null);
    setGalleryImages([null, null, null]);
    setVariants([newVariantRow()]);
    setDetailRows([newDetailRow()]);
    setFieldErrors({});
    dispatch(resetCreateProduct());
    dispatch(resetUpdateProduct());
  }, [dispatch]);

  const revertEditForm = useCallback(() => {
    if (!productId || !detailProduct || detailProduct.id !== productId) {
      return;
    }
    const hydrated = hydrateFormFromProduct(detailProduct);
    setForm(hydrated.form);
    setPlaceholderImage(hydrated.placeholderImage);
    setPlaceholder2Image(hydrated.placeholder2Image);
    setSizingImage(hydrated.sizingImage);
    setGalleryImages(hydrated.galleryImages);
    setVariants(hydrated.variants);
    setDetailRows(hydrated.detailRows);
    setFieldErrors({});
    dispatch(clearProductErrors());
  }, [detailProduct, dispatch, productId]);

  useEffect(() => {
    if (productId) {
      return;
    }
    resetForm();
  }, [productId, resetForm]);

  const updateVariant = (key: string, patch: Partial<VariantRow>) => {
    clearVariantFieldErrors(key);
    setVariants((rows) =>
      rows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const addVariantRow = () => {
    clearBasicFieldError("variantsGeneral");
    setVariants((rows) => [...rows, newVariantRow()]);
  };

  const removeVariantRow = (key: string) => {
    setVariants((rows) => {
      if (rows.length <= 1) {
        return rows;
      }
      return rows.filter((row) => row.key !== key);
    });
  };

  const moveVariantRow = (fromKey: string, toKey: string) => {
    setVariants((rows) => reorderVariantRows(rows, fromKey, toKey));
  };

  const setGalleryAt = (index: number, value: string | null) => {
    setGalleryImages((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const buildPayload = (): CreateProductPayload => {
    const images: ProductImageInput[] = [];

    if (placeholderImage) {
      images.push({ image_base64: placeholderImage, role: "placeholder" });
    }

    if (placeholder2Image) {
      images.push({ image_base64: placeholder2Image, role: "model" });
    }

    if (sizingImage) {
      images.push({ image_base64: sizingImage, role: "sizing" });
    }

    for (const base64 of galleryImages) {
      if (base64) {
        images.push({ image_base64: base64, role: "gallery" });
      }
    }

    const variantPayload: ProductVariantInput[] = variants.map((row) => ({
      size: row.size.trim(),
      color_id: row.color_id,
      stock: Number(row.stock),
    }));

    const salePriceText = form.sale_price.trim();
    const parsedSalePriceValue = salePriceText ? Number(salePriceText) : null;

    return {
      category_id: form.category_id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      details: buildDetailsPayload(detailRows),
      price: parsedPrice,
      sale_price: parsedSalePriceValue,
      visibility: form.visibility,
      is_featured: form.is_featured,
      images,
      variants: variantPayload,
    };
  };

  const buildUpdatePayload = (): UpdateProductPayload => {
    const createPayload = buildPayload();
    const variantPayload: ProductVariantUpdateInput[] = variants.map((row) => ({
      ...(row.id ? { id: row.id } : {}),
      size: row.size.trim(),
      color_id: row.color_id,
      stock: Number(row.stock),
    }));

    return {
      category_id: createPayload.category_id,
      title: createPayload.title,
      description: createPayload.description,
      details: createPayload.details,
      price: createPayload.price,
      sale_price: createPayload.sale_price ?? null,
      visibility: createPayload.visibility,
      is_featured: createPayload.is_featured,
      images: createPayload.images,
      variants: variantPayload,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || isLoadingProduct) {
      return;
    }

    const validation = validateProductForm(
      form,
      placeholderImage,
      variants,
      duplicateVariantKeys,
    );

    if (validation.messages.length > 0) {
      setFieldErrors(validation.fields);
      toast.error(
        validation.messages.length === 1
          ? validation.messages[0]
          : `Please complete the highlighted fields: ${validation.messages.join(" ")}`,
      );
      scrollToFirstInvalidField(validation.fields);
      return;
    }

    setFieldErrors({});
    dispatch(clearProductErrors());

    if (isEditMode && productId) {
      const result = await dispatch(
        updateAdminProduct({ productId, payload: buildUpdatePayload() }),
      );

      if (updateAdminProduct.fulfilled.match(result)) {
        toast.success(
          `Product updated (${result.payload.product_code}). The product list has been refreshed.`,
        );
        dispatch(resetUpdateProduct());
        onSaved?.();
        return;
      }

      if (updateAdminProduct.rejected.match(result)) {
        toast.error(
          typeof result.payload === "string"
            ? result.payload
            : "Failed to update product.",
        );
      }
      return;
    }

    const result = await dispatch(createAdminProduct(buildPayload()));

    if (createAdminProduct.fulfilled.match(result)) {
      toast.success(
        `Product created (${result.payload.product_code}). The product list has been refreshed.`,
      );
      setForm(initialForm);
      setPlaceholderImage(null);
      setPlaceholder2Image(null);
      setSizingImage(null);
      setGalleryImages([null, null, null]);
      setVariants([newVariantRow()]);
      setDetailRows([newDetailRow()]);
      setFieldErrors({});
      dispatch(resetCreateProduct());
      return;
    }

    if (createAdminProduct.rejected.match(result)) {
      toast.error(
        typeof result.payload === "string"
          ? result.payload
          : "Failed to create product.",
      );
    }
  };

  const updateDetailRow = (key: string, value: string) => {
    setDetailRows((rows) =>
      rows.map((row) => (row.key === key ? { ...row, value } : row)),
    );
  };

  const addDetailRow = () => {
    setDetailRows((rows) => [...rows, newDetailRow()]);
  };

  const removeDetailRow = (key: string) => {
    setDetailRows((rows) => {
      if (rows.length <= 1) {
        return [{ key: rows[0]?.key ?? newDetailRow().key, value: "" }];
      }
      return rows.filter((row) => row.key !== key);
    });
  };

  const catalogLoading =
    categoriesStatus === "loading" || colorsStatus === "loading";

  const mutationError = createError ?? updateError;

  const loadError =
    isEditMode && detailStatus === "failed" && detailError ? detailError : null;

  return (
    <PanelSectionState
      loading={isLoadingProduct}
      loadingMessage="Loading product…"
      error={loadError}
      errorAction={
        onCancel ? { label: "Back To Products", onClick: onCancel } : undefined
      }
    >
      <form onSubmit={handleSubmit} className="space-y-8">
      {isEditMode && detailProduct?.product_code && (
        <p className="font-mono text-xs text-muted-foreground">
          Editing {detailProduct.product_code}
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
        <div className="space-y-6">
          <div className={sectionClassName}>
            <h2 className={sectionTitleClassName}>Basic Information</h2>

            <div className="space-y-1.5">
              <label htmlFor="product-category" className={labelClassName}>
                Category <span className="text-destructive">*</span>
              </label>
              <select
                id="product-category"
                value={form.category_id}
                onChange={(e) => {
                  clearBasicFieldError("category_id");
                  setForm((prev) => ({ ...prev, category_id: e.target.value }));
                }}
                className={cn(fieldClassName, fieldErrors.category_id && invalidFieldClassName)}
                disabled={isSubmitting || catalogLoading}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
              {fieldErrors.category_id ? (
                <p className="text-xs text-red-600">Category is required.</p>
              ) : null}
              {categories.length === 0 && categoriesStatus === "succeeded" && (
                <p className={alertWarningClassName}>
                  No Categories Yet. Add one under Catalog Setup.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="product-title" className={labelClassName}>
                Title <span className="text-destructive">*</span>
              </label>
              <input
                id="product-title"
                type="text"
                value={form.title}
                onChange={(e) => {
                  clearBasicFieldError("title");
                  setForm((prev) => ({ ...prev, title: e.target.value }));
                }}
                maxLength={255}
                className={cn(fieldClassName, fieldErrors.title && invalidFieldClassName)}
                disabled={isSubmitting}
                required
              />
              {fieldErrors.title ? (
                <p className="text-xs text-red-600">Title is required.</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="product-description" className={labelClassName}>
                Description
              </label>
              <textarea
                id="product-description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className={textareaClassName}
                disabled={isSubmitting}
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className={labelClassName}>Details (specs)</p>
                  <p className={hintClassName}>
                    Optional bullet points shown on the product page (e.g. Material: Cotton).
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={addDetailRow}
                >
                  <PlusIcon className="size-4" />
                  Add line
                </Button>
              </div>
              <div className="space-y-2">
                {detailRows.map((row, index) => (
                  <div key={row.key} className="flex gap-2">
                    <input
                      type="text"
                      value={row.value}
                      onChange={(e) => updateDetailRow(row.key, e.target.value)}
                      placeholder={
                        index === 0
                          ? "e.g. 100% premium cotton"
                          : "Another spec or detail"
                      }
                      className={fieldClassName}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={isSubmitting}
                      onClick={() => removeDetailRow(row.key)}
                      aria-label="Remove Detail Line"
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="product-price" className={labelClassName}>
                  Price <span className="text-destructive">*</span>
                </label>
                <input
                  id="product-price"
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => {
                    clearBasicFieldError("price");
                    setForm((prev) => ({ ...prev, price: e.target.value }));
                  }}
                  className={cn(fieldClassName, fieldErrors.price && invalidFieldClassName)}
                  disabled={isSubmitting}
                  required
                />
                {fieldErrors.price ? (
                  <p className="text-xs text-red-600">Enter a price greater than 0.</p>
                ) : form.price && !priceValid ? (
                  <p className="text-xs text-red-600">Enter a price greater than 0.</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="product-sale-price" className={labelClassName}>
                    Sale price
                  </label>
                  {hasActiveSale ? (
                    <button
                      type="button"
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                      disabled={isSubmitting}
                      onClick={() => {
                        clearBasicFieldError("sale_price");
                        setForm((prev) => ({ ...prev, sale_price: "" }));
                      }}
                    >
                      Remove sale
                    </button>
                  ) : null}
                </div>
                <input
                  id="product-sale-price"
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={form.sale_price}
                  onChange={(e) => {
                    clearBasicFieldError("sale_price");
                    setForm((prev) => ({ ...prev, sale_price: e.target.value }));
                  }}
                  className={cn(
                    fieldClassName,
                    fieldErrors.sale_price && invalidFieldClassName,
                  )}
                  disabled={isSubmitting}
                  placeholder="Optional"
                />
                {fieldErrors.sale_price ? (
                  <p className="text-xs text-red-600">
                    Sale price must be greater than 0 and less than the regular price.
                  </p>
                ) : form.sale_price && !salePriceValid ? (
                  <p className="text-xs text-red-600">
                    Sale price must be greater than 0 and less than the regular price.
                  </p>
                ) : (
                  <p className={hintClassName}>
                    Leave empty for no sale. Setting a sale price puts the product on sale.
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="product-visibility" className={labelClassName}>
                  Visibility
                </label>
                <select
                  id="product-visibility"
                  value={form.visibility}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      visibility: e.target.value as ProductVisibility,
                    }))
                  }
                  className={fieldClassName}
                  disabled={isSubmitting}
                >
                  <option value="private">Private (admin only)</option>
                  <option value="released">Released (shop)</option>
                </select>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50/80 px-4 py-3">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    is_featured: event.target.checked,
                  }))
                }
                disabled={isSubmitting}
                className="mt-0.5 size-4 rounded border-neutral-300"
              />
              <span className="space-y-1">
                <span className={labelClassName}>Featured On User Dashboard</span>
                <span className={cn(hintClassName, "block")}>
                  Highlight this product in the signed-in dashboard when released.
                </span>
              </span>
            </label>
          </div>

          <div id="product-variants" className={sectionClassName}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className={sectionTitleClassName}>Variants</h2>
                <p className={cn(hintClassName, "mt-1")}>
                  At least one size, color, and stock. Drag rows to reorder. No duplicate
                  size + color pairs.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={addVariantRow}
              >
                <PlusIcon className="size-4" />
                Add row
              </Button>
            </div>

            {fieldErrors.variantsGeneral ? (
              <p className="text-xs text-red-600">Add at least one complete variant row.</p>
            ) : null}

            {colors.length === 0 && colorsStatus === "succeeded" && (
              <p className={alertWarningClassName}>
                No Colors Yet. Add colors under Catalog Setup.
              </p>
            )}

            <div className="space-y-2">
              {variants.map((row, index) => {
                const pairKey =
                  row.size.trim() && row.color_id
                    ? variantPairKey(row.size, row.color_id)
                    : "";
                const isDuplicate = pairKey && duplicateVariantKeys.has(pairKey);
                const rowFieldErrors = fieldErrors.variantRows?.[row.key];
                const hasRowError = Boolean(rowFieldErrors);

                return (
                  <div
                    key={row.key}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      if (draggedVariantKey && draggedVariantKey !== row.key) {
                        setDragOverVariantKey(row.key);
                      }
                    }}
                    onDragLeave={() => {
                      setDragOverVariantKey((current) =>
                        current === row.key ? null : current,
                      );
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (draggedVariantKey && draggedVariantKey !== row.key) {
                        moveVariantRow(draggedVariantKey, row.key);
                      }
                      setDraggedVariantKey(null);
                      setDragOverVariantKey(null);
                    }}
                    className={cn(
                      "grid gap-2 rounded-lg border border-neutral-200/90 bg-white p-3 shadow-sm sm:grid-cols-[auto_1fr_1fr_100px_auto]",
                      (isDuplicate || hasRowError) && "border-red-200 bg-red-50/50",
                      draggedVariantKey === row.key && "opacity-50",
                      dragOverVariantKey === row.key &&
                        "border-primary/40 ring-1 ring-primary/20",
                    )}
                  >
                    <div className={cn("flex items-end", index === 0 && "sm:pt-5")}>
                      <button
                        type="button"
                        draggable={!isSubmitting}
                        disabled={isSubmitting}
                        aria-label={`Reorder variant row ${index + 1}`}
                        className={cn(
                          "inline-flex size-8 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-neutral-100 hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50",
                        )}
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          setDraggedVariantKey(row.key);
                        }}
                        onDragEnd={() => {
                          setDraggedVariantKey(null);
                          setDragOverVariantKey(null);
                        }}
                      >
                        <GripVerticalIcon className="size-4" aria-hidden />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {index === 0 && (
                        <span className={labelClassName}>
                          Size <span className="text-destructive">*</span>
                        </span>
                      )}
                      <input
                        type="text"
                        value={row.size}
                        onChange={(e) =>
                          updateVariant(row.key, { size: e.target.value })
                        }
                        placeholder="e.g. M"
                        maxLength={20}
                        className={cn(
                          fieldClassName,
                          rowFieldErrors?.size && invalidFieldClassName,
                        )}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-1">
                      {index === 0 && (
                        <span className={labelClassName}>
                          Color <span className="text-destructive">*</span>
                        </span>
                      )}
                      <select
                        value={row.color_id}
                        onChange={(e) =>
                          updateVariant(row.key, { color_id: e.target.value })
                        }
                        className={cn(
                          fieldClassName,
                          rowFieldErrors?.color_id && invalidFieldClassName,
                        )}
                        disabled={isSubmitting || colors.length === 0}
                      >
                        <option value="">Select Color</option>
                        {colors.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.color_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      {index === 0 && (
                        <span className={labelClassName}>
                          Stock <span className="text-destructive">*</span>
                        </span>
                      )}
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={row.stock}
                        onChange={(e) =>
                          updateVariant(row.key, { stock: e.target.value })
                        }
                        className={cn(
                          fieldClassName,
                          rowFieldErrors?.stock && invalidFieldClassName,
                        )}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className={cn("flex items-end", index === 0 && "sm:pt-5")}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={isSubmitting || variants.length <= 1}
                        onClick={() => removeVariantRow(row.key)}
                        aria-label="Remove Variant Row"
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                    {(isDuplicate || rowFieldErrors?.duplicate) && (
                      <p className="text-xs text-destructive sm:col-span-5">
                        Duplicate size and color combination.
                      </p>
                    )}
                    {hasRowError && !isDuplicate && !rowFieldErrors?.duplicate ? (
                      <p className="text-xs text-destructive sm:col-span-5">
                        Complete size, color, and stock for this row.
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={sectionClassName}>
          <div>
            <h2 className={sectionTitleClassName}>Images</h2>
            <p className={cn(hintClassName, "mt-1")}>
              Placeholder 1 is required. Placeholder 2, galleries, and size chart are optional.
            </p>
          </div>

          <div className="space-y-5 pt-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ProductImageSlot
                id="product-placeholder-1"
                variant="wide"
                label="Placeholder 1"
                hint="Front View"
                required
                value={placeholderImage}
                onChange={(value) => {
                  clearBasicFieldError("placeholderImage");
                  setPlaceholderImage(value);
                }}
                hasError={fieldErrors.placeholderImage}
                disabled={isSubmitting}
              />

              <ProductImageSlot
                variant="wide"
                label="Placeholder 2"
                hint="Back View"
                value={placeholder2Image}
                onChange={setPlaceholder2Image}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <div>
                <p className={labelClassName}>Galleries</p>
                <p className={hintClassName}>Optional extra photos for the slide show.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {galleryImages.map((value, index) => (
                  <ProductImageSlot
                    key={`gallery-${index}`}
                    hideLabel
                    variant="tile"
                    label={`Gallery ${index + 1}`}
                    value={value}
                    onChange={(base64) => setGalleryAt(index, base64)}
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>

            <ProductImageSlot
              variant="wide"
              label="Size Chart"
              hint="Optional sizing guide."
              value={sizingImage}
              onChange={setSizingImage}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0 space-y-2">
          {mutationError && (
            <p className={alertErrorClassName} role="alert">
              {mutationError}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={isEditMode ? revertEditForm : resetForm}
          >
            {isEditMode ? "Revert changes" : "Reset"}
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoadingProduct}>
            {isSubmitting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                {isEditMode ? "Saving…" : "Creating…"}
              </>
            ) : isEditMode ? (
              "Save changes"
            ) : (
              "Create product"
            )}
          </Button>
        </div>
      </div>
    </form>
    </PanelSectionState>
  );
}
