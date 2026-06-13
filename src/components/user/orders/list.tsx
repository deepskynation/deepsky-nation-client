"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2Icon, PackageIcon } from "lucide-react";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import {
  CenteredLoading,
  PageStateGate,
} from "@/components/common/feedback/page-state-gate";
import { TablePagination } from "@/components/common/pagination/table-pagination";
import { OrderCard } from "@/components/user/orders/modules/order-card";
import { OrdersTableHeader } from "@/components/user/orders/modules/table-header";
import { OrdersTableRow } from "@/components/user/orders/modules/table-row";
import {
  OrdersViewToggle,
  type OrdersListView,
} from "@/components/user/orders/modules/orders-view-toggle";
import { UserOrdersFilterBar } from "@/components/user/orders/modules/user-orders-filter-bar";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { glassCardClassName } from "@/lib/glass-styles";
import { myOrdersHasActiveFilters } from "@/lib/user-order-filters";
import { cn } from "@/lib/utils";
import type { MyOrdersQuery } from "@/types/order";
import {
  selectAuthInitialized,
  selectAuthUser,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";
import {
  fetchMyOrdersList,
  selectMyOrders,
  selectMyOrdersListError,
  selectMyOrdersListQuery,
  selectMyOrdersListStatus,
  selectMyOrdersPagination,
} from "@/store/slices/orderSlice";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "@/types/pagination";

export function OrdersList() {
  const dispatch = useAppDispatch();
  const authInitialized = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authUser = useAppSelector(selectAuthUser);
  const orders = useAppSelector(selectMyOrders);
  const listStatus = useAppSelector(selectMyOrdersListStatus);
  const listError = useAppSelector(selectMyOrdersListError);
  const listQuery = useAppSelector(selectMyOrdersListQuery);
  const pagination = useAppSelector(selectMyOrdersPagination);
  const [viewMode, setViewMode] = useState<OrdersListView>("cards");

  useEffect(() => {
    setViewMode(window.matchMedia("(min-width: 768px)").matches ? "table" : "cards");
  }, []);

  const loadOrders = useCallback(
    (query?: Partial<MyOrdersQuery>) => {
      void dispatch(fetchMyOrdersList(query));
    },
    [dispatch],
  );

  useEffect(() => {
    if (!authInitialized || !isAuthenticated) {
      return;
    }
    void dispatch(fetchMyOrdersList());
  }, [authInitialized, dispatch, isAuthenticated]);

  const handlePageChange = (page: number) => {
    loadOrders({ page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    loadOrders({ page: 1, page_size: pageSize });
  };

  const handleApplyFilters = (patch: Partial<MyOrdersQuery>) => {
    loadOrders(patch);
  };

  const handleClearFilters = () => {
    loadOrders({
      page: 1,
      status: undefined,
      order_number: undefined,
      created_from: undefined,
      created_to: undefined,
    });
  };

  const userName = authUser?.name?.trim() || "You";
  const isLoading = listStatus === "loading";
  const hasActiveFilters = myOrdersHasActiveFilters(listQuery);
  const showPagination =
    pagination !== null && (listStatus === "succeeded" || listStatus === "loading");
  const totalPages = pagination?.totalPages ?? 0;

  return (
    <PageStateGate
      authChecking={!authInitialized}
      authCheckingMessage="Loading your session…"
      authRequired={authInitialized && !isAuthenticated}
      authRequiredTitle="Sign In To View Orders"
      authRequiredDescription="Track your purchases and delivery status after you sign in."
      authRequiredAction={{ href: "/login", label: "Sign In" }}
      authRequiredLayout="centered"
    >
      <div className="min-h-full bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
        <DashboardGlassSection variant="light" className="min-h-full">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-12 lg:py-10">
            <header className="mb-6 space-y-1 sm:mb-8">
              <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">
              Deepsky
              </p>
              <h1 className="font-serif text-2xl font-normal text-black sm:text-3xl">
                My Orders
              </h1>
              <p className="text-sm text-black/55">
                Track Order status, delivery address, and payment for your purchases.
              </p>
            </header>

            <UserOrdersFilterBar
              query={listQuery}
              disabled={isLoading}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />

            <div className={cn(glassCardClassName, "p-4 sm:p-6")}>
              {listStatus === "failed" && listError ? (
                <p className="mb-4 text-sm text-red-600" role="alert">
                  {listError}
                </p>
              ) : null}

              {orders.length > 0 || (isLoading && orders.length > 0) ? (
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-black/55">
                    {pagination?.total ?? orders.length} order
                    {(pagination?.total ?? orders.length) === 1 ? "" : "s"}
                  </p>
                  <OrdersViewToggle value={viewMode} onChange={setViewMode} />
                </div>
              ) : null}

              {isLoading && orders.length === 0 ? (
                <CenteredLoading message="Loading orders…" className="min-h-[240px]" />
              ) : orders.length === 0 && listStatus === "succeeded" ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-black/[0.04] text-black/35">
                    <PackageIcon className="size-6" aria-hidden />
                  </span>
                  <p className="text-sm font-medium text-black">
                    {hasActiveFilters ? "No orders match your filters" : "No orders yet"}
                  </p>
                  <p className="max-w-sm text-sm text-black/50">
                    {hasActiveFilters
                      ? "Try adjusting the order number, date range, or status."
                      : "When you complete checkout, your orders will appear here for tracking."}
                  </p>
                </div>
              ) : (
                <>
                  {isLoading && orders.length > 0 ? (
                    <div className="mb-3 flex items-center justify-center gap-2 py-2 text-sm text-black/45">
                      <Loader2Icon className="size-4 animate-spin" aria-hidden />
                      Updating…
                    </div>
                  ) : null}

                  {viewMode === "cards" ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <div
                        role="table"
                        aria-label="Your Orders"
                        className="min-w-[52rem] space-y-2"
                      >
                        <OrdersTableHeader />
                        <div role="rowgroup" className="space-y-2">
                          {orders.map((order) => (
                            <OrdersTableRow
                              key={order.id}
                              order={order}
                              userName={userName}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {showPagination && totalPages > 0 ? (
                <TablePagination
                  className="mt-6"
                  page={pagination?.page ?? listQuery.page ?? 1}
                  totalPages={totalPages}
                  pageSize={pagination?.pageSize ?? listQuery.page_size ?? 10}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  disabled={isLoading}
                  pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
                  bordered
                />
              ) : null}
            </div>
          </div>
        </DashboardGlassSection>
      </div>
    </PageStateGate>
  );
}
