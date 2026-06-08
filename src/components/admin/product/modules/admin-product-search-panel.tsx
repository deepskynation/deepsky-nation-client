"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FilterPanelSection,
  FilterSearchField,
  ListFilterHeader,
  OptionalFilterRow,
} from "@/components/common/filters/list-filter-panel";
import { useFilterPanel } from "@/components/common/filters/use-list-filter-panel";
import {
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/product/modules/admin-product-ui";
import { DateRangeFilter } from "@/components/common/filters";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  adminProductsHasActiveFilters,
  optionalFiltersFromQuery,
  parseOptionalNumber,
  type OptionalProductFilterKey,
} from "@/lib/admin-product-filters";
import {
  dateRangeFromBounds,
  resolveDateRangeBounds,
  type DateRangeFilterValue,
} from "@/lib/date-range-filter";
import { cn } from "@/lib/utils";
import { fetchCategories, selectCategories } from "@/store/slices/categorySlice";
import type { AdminProductsQuery, ProductVisibility } from "@/types/product";

const PANEL_ID = "admin-product-filters-panel";

const OPTIONAL_FILTER_OPTIONS: { key: OptionalProductFilterKey; label: string }[] = [
  { key: "category", label: "Category" },
  { key: "status", label: "Status" },
  { key: "product_code", label: "Product Code / Number" },
  { key: "stock", label: "Stock" },
  { key: "price", label: "Price" },
];

type FilterDraft = {
  category_id: string;
  visibility: "" | ProductVisibility;
  product_code: string;
  min_price: string;
  max_price: string;
  min_stock: string;
  max_stock: string;
  dateRange?: DateRangeFilterValue;
};

function draftFromQuery(query: AdminProductsQuery): FilterDraft {
  return {
    category_id: query.category_id ?? "",
    visibility: query.visibility ?? "",
    product_code: query.product_code ?? "",
    min_price: query.min_price != null ? String(query.min_price) : "",
    max_price: query.max_price != null ? String(query.max_price) : "",
    min_stock: query.min_stock != null ? String(query.min_stock) : "",
    max_stock: query.max_stock != null ? String(query.max_stock) : "",
    dateRange: dateRangeFromBounds(query.created_from, query.created_to),
  };
}

function draftToQueryPatch(draft: FilterDraft): Partial<AdminProductsQuery> {
  const { from, to } = resolveDateRangeBounds(draft.dateRange);

  return {
    category_id: draft.category_id || undefined,
    visibility: draft.visibility || undefined,
    product_code: draft.product_code.trim() || undefined,
    min_price: parseOptionalNumber(draft.min_price),
    max_price: parseOptionalNumber(draft.max_price),
    min_stock: parseOptionalNumber(draft.min_stock),
    max_stock: parseOptionalNumber(draft.max_stock),
    created_from: from,
    created_to: to,
  };
}

function emptyDraftFields(key: OptionalProductFilterKey): Partial<FilterDraft> {
  switch (key) {
    case "category":
      return { category_id: "" };
    case "status":
      return { visibility: "" };
    case "product_code":
      return { product_code: "" };
    case "stock":
      return { min_stock: "", max_stock: "" };
    case "price":
      return { min_price: "", max_price: "" };
  }
}

export function AdminProductSearchPanel({
  headingSubtitle,
  query,
  searchInput,
  onSearchInputChange,
  onClearSearch,
  onApplyFilters,
  onClearAll,
}: {
  headingSubtitle: string;
  query: AdminProductsQuery;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onClearSearch: () => void;
  onApplyFilters: (patch: Partial<AdminProductsQuery>) => void;
  onClearAll: () => void;
}) {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const { open, toggle, close } = useFilterPanel();
  const [draft, setDraft] = useState<FilterDraft>(() => draftFromQuery(query));
  const [visibleOptional, setVisibleOptional] = useState<Set<OptionalProductFilterKey>>(
    () => optionalFiltersFromQuery(query),
  );
  const [filterPicker, setFilterPicker] = useState("");

  useEffect(() => {
    setDraft(draftFromQuery(query));
    setVisibleOptional((prev) => {
      const next = new Set(prev);
      for (const key of optionalFiltersFromQuery(query)) {
        next.add(key);
      }
      return next;
    });
  }, [query]);

  useEffect(() => {
    void dispatch(fetchCategories());
  }, [dispatch]);

  const hasActive = adminProductsHasActiveFilters(query);

  const availableToAdd = useMemo(
    () => OPTIONAL_FILTER_OPTIONS.filter((option) => !visibleOptional.has(option.key)),
    [visibleOptional],
  );

  const applyDraft = () => {
    onApplyFilters({ page: 1, ...draftToQueryPatch(draft) });
  };

  const clearEverything = () => {
    setDraft({
      category_id: "",
      visibility: "",
      product_code: "",
      min_price: "",
      max_price: "",
      min_stock: "",
      max_stock: "",
      dateRange: undefined,
    });
    setVisibleOptional(new Set());
    setFilterPicker("");
    onClearAll();
    close();
  };

  const updateDraft = (patch: Partial<FilterDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const addOptionalFilter = (key: OptionalProductFilterKey) => {
    setVisibleOptional((prev) => new Set(prev).add(key));
    setFilterPicker("");
  };

  const removeOptionalFilter = (key: OptionalProductFilterKey) => {
    setVisibleOptional((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    updateDraft(emptyDraftFields(key));
  };

  const handleFilterPickerChange = (value: string) => {
    if (!value) {
      setFilterPicker("");
      return;
    }
    addOptionalFilter(value as OptionalProductFilterKey);
  };

  const orderedVisible = OPTIONAL_FILTER_OPTIONS.filter((option) =>
    visibleOptional.has(option.key),
  );

  return (
    <div className="space-y-4">
      <ListFilterHeader
        title="All Products"
        subtitle={headingSubtitle}
        panelId={PANEL_ID}
        toggleAriaLabel="Search And Filter Products"
        hasActiveFilters={hasActive}
        open={open}
        onToggle={toggle}
      />

      <FilterPanelSection
        open={open}
        panelId={PANEL_ID}
        ariaLabel="Search And Filter Products"
        onClose={close}
        onApply={applyDraft}
        onClearAll={clearEverything}
        hasActiveFilters={hasActive}
      >
        <FilterSearchField
          id="admin-product-search"
          label="Search Products"
          value={searchInput}
          placeholder="Search by title, code, description…"
          onChange={onSearchInputChange}
          onClear={onClearSearch}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="admin-filter-by" className={adminLabelClass}>
              Filter By
            </label>
            <select
              id="admin-filter-by"
              value={filterPicker}
              onChange={(event) => handleFilterPickerChange(event.target.value)}
              disabled={availableToAdd.length === 0}
              className={cn(adminFieldClass, "bg-white")}
            >
              <option value="">
                {availableToAdd.length === 0 ? "All Filters Added" : "Choose A Filter…"}
              </option>
              {availableToAdd.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <span className={adminLabelClass}>Date Added</span>
            <DateRangeFilter
              value={draft.dateRange}
              onChange={(dateRange) => updateDraft({ dateRange })}
              placeholder="All Time"
              className="w-full"
              triggerClassName="w-full justify-between"
            />
          </div>
        </div>

        {orderedVisible.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {orderedVisible.map((option) => {
              switch (option.key) {
                case "category":
                  return (
                    <OptionalFilterRow
                      key={option.key}
                      label={option.label}
                      onRemove={() => removeOptionalFilter("category")}
                    >
                      <select
                        id="admin-filter-category"
                        value={draft.category_id}
                        onChange={(event) =>
                          updateDraft({ category_id: event.target.value })
                        }
                        className={adminFieldClass}
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.category_name}
                          </option>
                        ))}
                      </select>
                    </OptionalFilterRow>
                  );
                case "status":
                  return (
                    <OptionalFilterRow
                      key={option.key}
                      label={option.label}
                      onRemove={() => removeOptionalFilter("status")}
                    >
                      <select
                        id="admin-filter-status"
                        value={draft.visibility}
                        onChange={(event) =>
                          updateDraft({
                            visibility: event.target.value as FilterDraft["visibility"],
                          })
                        }
                        className={adminFieldClass}
                      >
                        <option value="">All Statuses</option>
                        <option value="released">Released</option>
                        <option value="private">Private</option>
                      </select>
                    </OptionalFilterRow>
                  );
                case "product_code":
                  return (
                    <OptionalFilterRow
                      key={option.key}
                      label={option.label}
                      onRemove={() => removeOptionalFilter("product_code")}
                    >
                      <input
                        id="admin-filter-code"
                        type="text"
                        value={draft.product_code}
                        onChange={(event) =>
                          updateDraft({ product_code: event.target.value })
                        }
                        placeholder="e.g. DS-001"
                        className={adminFieldClass}
                      />
                    </OptionalFilterRow>
                  );
                case "price":
                  return (
                    <OptionalFilterRow
                      key={option.key}
                      label={`${option.label} (₱)`}
                      onRemove={() => removeOptionalFilter("price")}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={draft.min_price}
                          onChange={(event) =>
                            updateDraft({ min_price: event.target.value })
                          }
                          placeholder="Min"
                          aria-label="Minimum Price"
                          className={adminFieldClass}
                        />
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={draft.max_price}
                          onChange={(event) =>
                            updateDraft({ max_price: event.target.value })
                          }
                          placeholder="Max"
                          aria-label="Maximum Price"
                          className={adminFieldClass}
                        />
                      </div>
                    </OptionalFilterRow>
                  );
                case "stock":
                  return (
                    <OptionalFilterRow
                      key={option.key}
                      label={option.label}
                      onRemove={() => removeOptionalFilter("stock")}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={draft.min_stock}
                          onChange={(event) =>
                            updateDraft({ min_stock: event.target.value })
                          }
                          placeholder="Min"
                          aria-label="Minimum Stock"
                          className={adminFieldClass}
                        />
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={draft.max_stock}
                          onChange={(event) =>
                            updateDraft({ max_stock: event.target.value })
                          }
                          placeholder="Max"
                          aria-label="Maximum Stock"
                          className={adminFieldClass}
                        />
                      </div>
                    </OptionalFilterRow>
                  );
                default:
                  return null;
              }
            })}
          </div>
        ) : null}
      </FilterPanelSection>
    </div>
  );
}
