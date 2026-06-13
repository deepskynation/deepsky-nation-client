"use client";

import { useCallback, useEffect } from "react";
import { Loader2Icon, PackageIcon } from "lucide-react";
import { AdminOrdersFilterPanel } from "@/components/admin/orders/modules/admin-orders-filter-panel";
import { AdminOrdersTableHeader } from "@/components/admin/orders/modules/table-header";
import { AdminOrdersTableRow } from "@/components/admin/orders/modules/table-row";
import {
  alertErrorClassName,
  emptyStateClassName,
  tableWrapClassName,
} from "@/lib/panel-styles";
import { TablePagination } from "@/components/common/pagination/table-pagination";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { adminOrdersHasActiveFilters } from "@/lib/admin-order-filters";
import { cn } from "@/lib/utils";
import type { AdminOrdersQuery } from "@/types/order";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "@/types/pagination";
import { selectAuthInitialized, selectIsAuthenticated } from "@/store/slices/authSlice";
import {
  fetchAdminOrdersList,
  selectAdminOrders,
  selectAdminOrdersListError,
  selectAdminOrdersListQuery,
  selectAdminOrdersListStatus,
  selectAdminOrdersPagination,
} from "@/store/slices/orderSlice";

export function AdminOrdersList() {
  const dispatch = useAppDispatch();
  const authReady = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const orders = useAppSelector(selectAdminOrders);
  const pagination = useAppSelector(selectAdminOrdersPagination);
  const listQuery = useAppSelector(selectAdminOrdersListQuery);
  const status = useAppSelector(selectAdminOrdersListStatus);
  const error = useAppSelector(selectAdminOrdersListError);

  const loadOrders = useCallback(
    (query?: Partial<AdminOrdersQuery>) => {
      void dispatch(fetchAdminOrdersList(query));
    },
    [dispatch],
  );

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      return;
    }
    void dispatch(fetchAdminOrdersList());
  }, [authReady, dispatch, isAuthenticated]);

  const isLoading = status === "loading";
  const showPagination =
    pagination !== null && (status === "succeeded" || status === "loading");
  const totalCount = pagination?.total ?? orders.length;
  const hasActiveFilters = adminOrdersHasActiveFilters(listQuery);

  const handlePageChange = (page: number) => {
    loadOrders({ page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    loadOrders({ page: 1, page_size: pageSize });
  };

  const handleApplyFilters = (patch: Partial<AdminOrdersQuery>) => {
    loadOrders(patch);
  };

  const handleStatusTabChange = (status?: AdminOrdersQuery["status"]) => {
    loadOrders({ page: 1, status });
  };

  const handleClearFilters = () => {
    loadOrders({
      page: 1,
      status: undefined,
      user_id: undefined,
      created_from: undefined,
      created_to: undefined,
      order_number: undefined,
      customer: undefined,
      payment_method: undefined,
    });
  };

  const headingSubtitle =
    status === "succeeded"
      ? `${totalCount} order${totalCount === 1 ? "" : "s"}`
      : "All customer orders will appear here.";

  return (
    <div className="space-y-5">
      <AdminOrdersFilterPanel
        headingSubtitle={headingSubtitle}
        query={listQuery}
        disabled={isLoading}
        onApplyFilters={handleApplyFilters}
        onClearAll={handleClearFilters}
        onStatusTabChange={handleStatusTabChange}
      />

      {status === "loading" && orders.length === 0 ? (
        <div className={cn(emptyStateClassName, "border-0")}>
          <Loader2Icon className="size-8 animate-spin text-neutral-400" />
          <p className="text-sm font-medium text-neutral-700">Loading orders…</p>
        </div>
      ) : null}

      {error ? (
        <p className={alertErrorClassName} role="alert">
          {error}
        </p>
      ) : null}

      {status === "succeeded" && orders.length === 0 && !error ? (
        <div className={cn(emptyStateClassName, "border-0")}>
          <PackageIcon className="size-10 text-neutral-300" strokeWidth={1.25} />
          <p className="text-sm font-medium text-neutral-800">No orders found</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Try adjusting or clearing your filters to see more orders."
              : "Orders will appear here when customers complete checkout."}
          </p>
        </div>
      ) : null}

      {orders.length > 0 ? (
        <div className={cn(tableWrapClassName, isLoading && "opacity-70")}>
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full border-collapse">
              <AdminOrdersTableHeader />
              <tbody>
                {orders.map((order) => (
                  <AdminOrdersTableRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>

          {showPagination && pagination ? (
            <div className="border-t border-neutral-200 bg-neutral-50/50 px-4 py-3 sm:px-5">
              <TablePagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                disabled={isLoading}
                pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
                className="border-t-0 pt-0"
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
