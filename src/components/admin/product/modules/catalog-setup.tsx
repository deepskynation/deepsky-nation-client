"use client";

import { useEffect, useId, useState } from "react";
import { Loader2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/common/dialogs/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  clearCategoryErrors,
  createCategory,
  deleteCategory,
  fetchCategories,
  resetCategoryCreate,
  resetCategoryDelete,
  resetCategoryUpdate,
  selectCategories,
  selectCategoryCreateError,
  selectCategoryCreateStatus,
  selectCategoryDeleteError,
  selectCategoryDeleteStatus,
  selectCategoriesListStatus,
  selectCategoryUpdateError,
  selectCategoryUpdateStatus,
  updateCategory,
} from "@/store/slices/categorySlice";
import {
  clearColorErrors,
  createColor,
  deleteColor,
  fetchColors,
  resetColorCreate,
  resetColorDelete,
  resetColorUpdate,
  selectColorCreateError,
  selectColorCreateStatus,
  selectColorDeleteError,
  selectColorDeleteStatus,
  selectColors,
  selectColorsListStatus,
  selectColorUpdateError,
  selectColorUpdateStatus,
  updateColor,
} from "@/store/slices/colorSlice";
import { selectAuthInitialized, selectIsAuthenticated } from "@/store/slices/authSlice";
import type { ApiProductCategory } from "@/types/catalog";
import type { ApiProductColor } from "@/types/product";
import {
  alertErrorClassName,
  alertSuccessClassName,
  fieldClassName,
  hintClassName,
  segmentListClassName,
  segmentTabClassName,
} from "@/lib/panel-styles";

type CatalogTab = "categories" | "colors";

const TAB_ITEMS: { id: CatalogTab; label: string; description: string }[] = [
  {
    id: "categories",
    label: "Categories",
    description: "Add a category before assigning products (e.g. Top, Bottom).",
  },
  {
    id: "colors",
    label: "Colors",
    description: "Add colors for product variants (e.g. Multiblack, White).",
  },
];

function catalogDeleteDescription(itemLabel: string, itemName: string | null) {
  const lower = itemLabel.toLowerCase();

  if (itemName) {
    return (
      <>
        Permanently delete{" "}
        <span className="font-medium text-neutral-900">{itemName}</span>? Products using
        this {lower} may be affected. This cannot be undone.
      </>
    );
  }

  return `This ${lower} will be permanently removed.`;
}

function CatalogItemList({
  children,
  emptyLabel,
  isLoading,
}: {
  children: React.ReactNode;
  emptyLabel: string;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Loading…</p>;
  }

  if (children == null) {
    return <p className="text-xs text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="max-h-64 divide-y divide-neutral-200/80 overflow-y-auto rounded-lg border border-neutral-200/80 bg-white">
      {children}
    </ul>
  );
}

function CategoriesPanel() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const listStatus = useAppSelector(selectCategoriesListStatus);
  const createStatus = useAppSelector(selectCategoryCreateStatus);
  const createError = useAppSelector(selectCategoryCreateError);
  const updateStatus = useAppSelector(selectCategoryUpdateStatus);
  const updateError = useAppSelector(selectCategoryUpdateError);
  const deleteStatus = useAppSelector(selectCategoryDeleteStatus);
  const deleteError = useAppSelector(selectCategoryDeleteError);

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiProductCategory | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isEditMode = editingId !== null;
  const isSubmitting = createStatus === "loading" || updateStatus === "loading";
  const isDeleting = deleteStatus === "loading";
  const mutationError = createError ?? updateError;

  const startEdit = (category: ApiProductCategory) => {
    setEditingId(category.id);
    setName(category.category_name);
    setSuccessMessage(null);
    dispatch(clearCategoryErrors());
    dispatch(resetCategoryCreate());
    dispatch(resetCategoryUpdate());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    dispatch(clearCategoryErrors());
    dispatch(resetCategoryUpdate());
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    dispatch(clearCategoryErrors());
    setSuccessMessage(null);

    if (isEditMode && editingId) {
      const result = await dispatch(
        updateCategory({ categoryId: editingId, payload: { category_name: trimmed } }),
      );

      if (updateCategory.fulfilled.match(result)) {
        setSuccessMessage("Category updated.");
        cancelEdit();
        dispatch(resetCategoryUpdate());
      }
      return;
    }

    const result = await dispatch(createCategory({ category_name: trimmed }));

    if (createCategory.fulfilled.match(result)) {
      setName("");
      setSuccessMessage("Category created.");
      dispatch(resetCategoryCreate());
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }

    dispatch(resetCategoryDelete());
    const result = await dispatch(deleteCategory(deleteTarget.id));

    if (deleteCategory.fulfilled.match(result)) {
      if (editingId === deleteTarget.id) {
        cancelEdit();
      }
      setDeleteTarget(null);
      setSuccessMessage("Category deleted.");
    }
  };

  const hasItems = categories.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <p className={hintClassName}>{TAB_ITEMS[0].description}</p>

      <form onSubmit={handleSubmit} className="space-y-2">
        {isEditMode && (
          <p className="text-xs font-medium text-neutral-600">Editing Category</p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (mutationError) {
                dispatch(clearCategoryErrors());
              }
            }}
            placeholder="Category name"
            maxLength={50}
            className={fieldClassName}
            disabled={isSubmitting}
          />
          <div className="flex shrink-0 gap-2">
            {isEditMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={cancelEdit}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : isEditMode ? (
                "Save"
              ) : (
                <>
                  <PlusIcon className="size-4" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {mutationError && (
        <p className={alertErrorClassName} role="alert">
          {mutationError}
        </p>
      )}

      {successMessage && (
        <p className={alertSuccessClassName}>{successMessage}</p>
      )}

      <div className="border-t border-neutral-200/80 pt-5">
        <p className="mb-3 text-sm font-medium text-neutral-800">
          Existing ({categories.length})
        </p>
        <CatalogItemList
          isLoading={listStatus === "loading"}
          emptyLabel="No Categories Yet."
        >
          {hasItems
            ? categories.map((category) => (
                <li
                  key={category.id}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-2.5",
                    editingId === category.id && "bg-neutral-50",
                  )}
                >
                  <span className="min-w-0 truncate text-sm font-medium text-neutral-900">
                    {category.category_name}
                  </span>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => startEdit(category)}
                      disabled={isSubmitting}
                    >
                      <PencilIcon className="size-3.5" />
                      <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeleteTarget(category)}
                      disabled={isDeleting}
                    >
                      <Trash2Icon className="size-3.5" />
                      <span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
                    </Button>
                  </div>
                </li>
              ))
            : null}
        </CatalogItemList>
      </div>

      <ConfirmDeleteDialog
        title="Delete category"
        description={catalogDeleteDescription(
          "Category",
          deleteTarget?.category_name ?? null,
        )}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            dispatch(resetCategoryDelete());
          }
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}

function ColorsPanel() {
  const dispatch = useAppDispatch();
  const colors = useAppSelector(selectColors);
  const listStatus = useAppSelector(selectColorsListStatus);
  const createStatus = useAppSelector(selectColorCreateStatus);
  const createError = useAppSelector(selectColorCreateError);
  const updateStatus = useAppSelector(selectColorUpdateStatus);
  const updateError = useAppSelector(selectColorUpdateError);
  const deleteStatus = useAppSelector(selectColorDeleteStatus);
  const deleteError = useAppSelector(selectColorDeleteError);

  const [colorName, setColorName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiProductColor | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isEditMode = editingId !== null;
  const isSubmitting = createStatus === "loading" || updateStatus === "loading";
  const isDeleting = deleteStatus === "loading";
  const mutationError = createError ?? updateError;

  const startEdit = (color: ApiProductColor) => {
    setEditingId(color.id);
    setColorName(color.color_name);
    setSuccessMessage(null);
    dispatch(clearColorErrors());
    dispatch(resetColorCreate());
    dispatch(resetColorUpdate());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setColorName("");
    dispatch(clearColorErrors());
    dispatch(resetColorUpdate());
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = colorName.trim();
    if (!trimmedName) {
      return;
    }

    dispatch(clearColorErrors());
    setSuccessMessage(null);

    if (isEditMode && editingId) {
      const result = await dispatch(
        updateColor({
          colorId: editingId,
          payload: {
            color_name: trimmedName,
          },
        }),
      );

      if (updateColor.fulfilled.match(result)) {
        setSuccessMessage("Color updated.");
        cancelEdit();
        dispatch(resetColorUpdate());
      }
      return;
    }

    const result = await dispatch(
      createColor({
        color_name: trimmedName,
      }),
    );

    if (createColor.fulfilled.match(result)) {
      setColorName("");
      setSuccessMessage("Color created.");
      dispatch(resetColorCreate());
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return;
    }

    dispatch(resetColorDelete());
    const result = await dispatch(deleteColor(deleteTarget.id));

    if (deleteColor.fulfilled.match(result)) {
      if (editingId === deleteTarget.id) {
        cancelEdit();
      }
      setDeleteTarget(null);
      setSuccessMessage("Color deleted.");
    }
  };

  const hasItems = colors.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <p className={hintClassName}>{TAB_ITEMS[1].description}</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {isEditMode && (
          <p className="text-xs font-medium text-neutral-600">Editing Color</p>
        )}
        <input
          type="text"
          value={colorName}
          onChange={(e) => {
            setColorName(e.target.value);
            if (mutationError) {
              dispatch(clearColorErrors());
            }
          }}
          placeholder="Color name (e.g. Multiblack)"
          maxLength={50}
          className={fieldClassName}
          disabled={isSubmitting}
        />
        <div className="flex flex-wrap items-center gap-2">
          {isEditMode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={cancelEdit}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !colorName.trim()}
            className="shrink-0"
          >
            {isSubmitting ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : isEditMode ? (
              "Save"
            ) : (
              <>
                <PlusIcon className="size-4" />
                Add
              </>
            )}
          </Button>
        </div>
      </form>

      {mutationError && (
        <p className={alertErrorClassName} role="alert">
          {mutationError}
        </p>
      )}

      {successMessage && (
        <p className={alertSuccessClassName}>{successMessage}</p>
      )}

      <div className="border-t border-neutral-200/80 pt-5">
        <p className="mb-3 text-sm font-medium text-neutral-800">
          Existing ({colors.length})
        </p>
        <CatalogItemList
          isLoading={listStatus === "loading"}
          emptyLabel="No Colors Yet."
        >
          {hasItems
            ? colors.map((color) => (
                <li
                  key={color.id}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-2.5",
                    editingId === color.id && "bg-neutral-50",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {color.hex_code && (
                      <span
                        className="size-4 shrink-0 rounded border border-neutral-200/80 shadow-inner"
                        style={{ backgroundColor: color.hex_code }}
                        aria-hidden
                      />
                    )}
                    <span className="truncate text-sm font-medium text-neutral-900">
                      {color.color_name}
                    </span>
                  </span>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => startEdit(color)}
                      disabled={isSubmitting}
                    >
                      <PencilIcon className="size-3.5" />
                      <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeleteTarget(color)}
                      disabled={isDeleting}
                    >
                      <Trash2Icon className="size-3.5" />
                      <span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
                    </Button>
                  </div>
                </li>
              ))
            : null}
        </CatalogItemList>
      </div>

      <ConfirmDeleteDialog
        title="Delete color"
        description={catalogDeleteDescription("Color", deleteTarget?.color_name ?? null)}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            dispatch(resetColorDelete());
          }
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}

export type CatalogSetupProps = {
  /** When true, omits outer card chrome (used inside admin page view tabs). */
  embedded?: boolean;
};

export function CatalogSetup({ embedded = false }: CatalogSetupProps) {
  const dispatch = useAppDispatch();
  const authReady = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [activeTab, setActiveTab] = useState<CatalogTab>("categories");
  const tabListId = useId();

  const categories = useAppSelector(selectCategories);
  const colors = useAppSelector(selectColors);

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      return;
    }
    void dispatch(fetchCategories());
    void dispatch(fetchColors());
  }, [authReady, dispatch, isAuthenticated]);

  const Wrapper = embedded ? "div" : "section";

  return (
    <Wrapper
      className={cn(
        embedded
          ? "min-w-0"
          : "rounded-xl border border-neutral-200 bg-white shadow-sm",
      )}
    >
      <div className={cn("space-y-4", embedded ? "" : "px-5 pt-5")}>
        {!embedded && (
          <>
            <h2 className="text-sm font-semibold text-neutral-900">Catalog Setup</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add categories and colors used when creating products.
            </p>
          </>
        )}

        <div
          id={tabListId}
          role="tablist"
          aria-label="Catalog Setup"
          className={cn(embedded ? "mt-0" : "mt-4", segmentListClassName)}
        >
          {TAB_ITEMS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tab.id === "categories" ? categories.length : colors.length;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${tabListId}-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`${tabListId}-${tab.id}-panel`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  segmentTabClassName(isActive),
                  "inline-flex items-center gap-2",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums",
                    isActive
                      ? "bg-neutral-100 text-neutral-700"
                      : "text-neutral-500",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {TAB_ITEMS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <div
            key={tab.id}
            id={`${tabListId}-${tab.id}-panel`}
            role="tabpanel"
            aria-labelledby={`${tabListId}-${tab.id}`}
            hidden={!isActive}
            className={cn(!isActive && "hidden")}
          >
            {tab.id === "categories" ? <CategoriesPanel /> : <ColorsPanel />}
          </div>
        );
      })}
    </Wrapper>
  );
}
