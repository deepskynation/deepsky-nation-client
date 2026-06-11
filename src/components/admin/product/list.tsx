"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2Icon, PackageIcon, Search } from "lucide-react";
import { TablePagination } from "@/components/common/pagination/table-pagination";
import { AdminProductSearchPanel } from "@/components/admin/product/modules/admin-product-search-panel";
import TableHeader from "@/components/admin/product/modules/TableHeader";
import TableRow from "@/components/admin/product/modules/TableRow";
import {
  adminAlertErrorClass,
  adminEmptyStateClass,
  adminTableWrapClass,
} from "@/components/admin/product/modules/admin-product-ui";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { adminProductsHasActiveFilters } from "@/lib/admin-product-filters";
import { cn } from "@/lib/utils";
import type { AdminProductsQuery } from "@/types/product";
import {
  fetchAdminProducts,
  selectAdminProducts,
  selectAdminProductsListError,
  selectAdminProductsListQuery,
  selectAdminProductsListStatus,
  selectAdminProductsPagination,
} from "@/store/slices/productSlice";
import { selectAuthInitialized, selectIsAuthenticated } from "@/store/slices/authSlice";

const SEARCH_DEBOUNCE_MS = 350;

export function AdminProductsList({
  onEditProduct,
}: {
  onEditProduct?: (productId: string) => void;
}) {
  const dispatch = useAppDispatch();
  const authReady = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const products = useAppSelector(selectAdminProducts);
  const pagination = useAppSelector(selectAdminProductsPagination);
  const listQuery = useAppSelector(selectAdminProductsListQuery);
  const status = useAppSelector(selectAdminProductsListStatus);
  const error = useAppSelector(selectAdminProductsListError);

  const [searchInput, setSearchInput] = useState(listQuery.search ?? "");

  const loadProducts = useCallback(
    (query?: Partial<AdminProductsQuery>) => {
      void dispatch(fetchAdminProducts(query));
    },
    [dispatch],
  );

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      return;
    }
    void dispatch(fetchAdminProducts());
  }, [authReady, dispatch, isAuthenticated]);

  useEffect(() => {
    setSearchInput(listQuery.search ?? "");
  }, [listQuery.search]);

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      return;
    }

    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      const current = (listQuery.search ?? "").trim();

      if (trimmed === current) {
        return;
      }

      loadProducts({
        page: 1,
        page_size: listQuery.page_size,
        search: trimmed || undefined,
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [
    authReady,
    isAuthenticated,
    listQuery.page_size,
    listQuery.search,
    loadProducts,
    searchInput,
  ]);

  const isLoading = status === "loading";
  const showPagination =
    pagination !== null && (status === "succeeded" || status === "loading");
  const totalCount = pagination?.total ?? products.length;
  const hasActiveFilters = adminProductsHasActiveFilters(listQuery);

  const handlePageChange = (page: number) => {
    loadProducts({ page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    loadProducts({ page: 1, page_size: pageSize });
  };

  const clearSearch = () => {
    setSearchInput("");
    loadProducts({ page: 1, search: undefined });
  };

  const clearAllFilters = () => {
    setSearchInput("");
    loadProducts({
      page: 1,
      search: undefined,
      category_id: undefined,
      visibility: undefined,
      product_code: undefined,
      min_price: undefined,
      max_price: undefined,
      min_stock: undefined,
      max_stock: undefined,
      created_from: undefined,
      created_to: undefined,
    });
  };

  const applyFilters = (patch: Partial<AdminProductsQuery>) => {
    loadProducts(patch);
  };

  const showEmptyCatalog =
    status === "succeeded" && products.length === 0 && !error && !hasActiveFilters;

  const showNoResults =
    status === "succeeded" && products.length === 0 && !error && hasActiveFilters;

  const headingSubtitle =
    status === "succeeded"
      ? hasActiveFilters
        ? `${totalCount} product${totalCount === 1 ? "" : "s"} match your search or filters`
        : `${totalCount} product${totalCount === 1 ? "" : "s"} in catalog`
      : "Your catalog list will appear here.";

  return (
    <div className="space-y-5">
      <AdminProductSearchPanel
        headingSubtitle={headingSubtitle}
        query={listQuery}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onClearSearch={clearSearch}
        onApplyFilters={applyFilters}
        onClearAll={clearAllFilters}
      />

      {status === "loading" && products.length === 0 && (
        <div className={adminEmptyStateClass}>
          <Loader2Icon className="size-8 animate-spin text-neutral-400" />
          <p className="text-sm font-medium text-neutral-700">Loading products…</p>
        </div>
      )}

      {error && (
        <p className={adminAlertErrorClass} role="alert">
          {error}
        </p>
      )}

      {showEmptyCatalog && (
        <div className={adminEmptyStateClass}>
          <PackageIcon className="size-10 text-neutral-300" strokeWidth={1.25} />
          <p className="text-sm font-medium text-neutral-800">No products yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Switch to Add Product to create your first listing, or set up categories and
            colors under Catalog Setup.
          </p>
        </div>
      )}

      {showNoResults && (
        <div className={adminEmptyStateClass}>
          <Search className="size-10 text-neutral-300" strokeWidth={1.25} />
          <p className="text-sm font-medium text-neutral-800">No products found</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try different search terms or filters, or clear everything to see the full catalog.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        </div>
      )}

      {products.length > 0 && (
        <div className={cn(adminTableWrapClass, isLoading && "opacity-70")}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <TableHeader />
              <tbody>
                {products.map((product) => (
                  <TableRow key={product.id} product={product} onEdit={onEditProduct} />
                ))}
              </tbody>
            </table>
          </div>

          {showPagination && pagination && (
            <div className="border-t border-neutral-200 bg-neutral-50/50 px-4 py-3 sm:px-5">
              <TablePagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                disabled={isLoading}
                className="border-t-0 pt-0"
              />
            </div>
          )}
        </div>
      )}

      {status === "succeeded" && products.length === 0 && pagination && pagination.total > 0 && (
        <TablePagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          disabled={isLoading}
        />
      )}
    </div>
  );
}
