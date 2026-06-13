"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2Icon, MailIcon } from "lucide-react";
import { AdminSubscribersTableHeader } from "@/components/admin/subscribers/modules/table-header";
import { AdminSubscribersTableRow } from "@/components/admin/subscribers/modules/table-row";
import { DateRangeFilter } from "@/components/common/filters";
import { TablePagination } from "@/components/common/pagination/table-pagination";
import {
  alertErrorClassName,
  emptyStateClassName,
  fieldClassName,
  labelClassName,
  tableWrapClassName,
} from "@/lib/panel-styles";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  dateRangeFromBounds,
  resolveDateRangeBounds,
  type DateRangeFilterValue,
} from "@/lib/date-range-filter";
import { cn } from "@/lib/utils";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "@/types/pagination";
import { selectAuthInitialized, selectIsAuthenticated } from "@/store/slices/authSlice";
import {
  fetchAdminSubscribersList,
  selectAdminSubscribers,
  selectAdminSubscribersListError,
  selectAdminSubscribersListQuery,
  selectAdminSubscribersListStatus,
  selectAdminSubscribersPagination,
} from "@/store/slices/adminSubscriberSlice";

const SEARCH_DEBOUNCE_MS = 350;

export function AdminSubscribersList() {
  const dispatch = useAppDispatch();
  const authReady = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const subscribers = useAppSelector(selectAdminSubscribers);
  const pagination = useAppSelector(selectAdminSubscribersPagination);
  const listQuery = useAppSelector(selectAdminSubscribersListQuery);
  const status = useAppSelector(selectAdminSubscribersListStatus);
  const error = useAppSelector(selectAdminSubscribersListError);

  const [searchInput, setSearchInput] = useState(listQuery.search ?? "");

  const loadSubscribers = useCallback(
    (query?: Parameters<typeof fetchAdminSubscribersList>[0]) => {
      void dispatch(fetchAdminSubscribersList(query));
    },
    [dispatch],
  );

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      return;
    }
    void dispatch(fetchAdminSubscribersList());
  }, [authReady, dispatch, isAuthenticated]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      if ((listQuery.search ?? "") === trimmed) {
        return;
      }
      loadSubscribers({ page: 1, search: trimmed || undefined });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [listQuery.search, loadSubscribers, searchInput]);

  const isLoading = status === "loading";
  const showPagination =
    pagination.total_pages > 0 && (status === "succeeded" || status === "loading");
  const totalCount = pagination.total ?? subscribers.length;

  const handlePageChange = (page: number) => {
    loadSubscribers({ page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    loadSubscribers({ page: 1, page_size: pageSize });
  };

  const handleDateRangeChange = (value: DateRangeFilterValue) => {
    const { from, to } = resolveDateRangeBounds(value);
    loadSubscribers({
      page: 1,
      created_from: from,
      created_to: to,
    });
  };

  const dateRange = dateRangeFromBounds(listQuery.created_from, listQuery.created_to);

  const headingSubtitle =
    status === "succeeded"
      ? `${totalCount} subscriber${totalCount === 1 ? "" : "s"}`
      : "Newsletter signups will appear here.";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-neutral-900">All Subscribers</h2>
          <p className="text-sm text-muted-foreground">{headingSubtitle}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-[12rem] space-y-1.5">
            <label htmlFor="admin-subscribers-search" className={labelClassName}>
              Search
            </label>
            <input
              id="admin-subscribers-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Email"
              className={fieldClassName}
            />
          </div>
          <div className="min-w-[12rem] space-y-1.5">
            <span className={labelClassName}>Subscribed</span>
            <DateRangeFilter
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder="All time"
              triggerClassName={cn(fieldClassName, "w-full justify-between text-left")}
            />
          </div>
        </div>
      </div>

      {error ? (
        <p className={alertErrorClassName} role="alert">
          {error}
        </p>
      ) : null}

      <div className={tableWrapClassName}>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-sm">
            <AdminSubscribersTableHeader />
            <tbody>
              {isLoading && subscribers.length === 0 ? (
                <tr>
                  <td colSpan={2}>
                    <div className={cn(emptyStateClassName, "border-0")}>
                      <Loader2Icon className="size-5 animate-spin" aria-hidden />
                      <span>Loading subscribers…</span>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && subscribers.length === 0 ? (
                <tr>
                  <td colSpan={2}>
                    <div className={cn(emptyStateClassName, "border-0")}>
                      <MailIcon className="size-8 text-neutral-300" aria-hidden />
                      <span>No subscribers found.</span>
                    </div>
                  </td>
                </tr>
              ) : null}

              {subscribers.map((subscriber) => (
                <AdminSubscribersTableRow key={subscriber.id} subscriber={subscriber} />
              ))}
            </tbody>
          </table>
        </div>

        {showPagination ? (
          <div className="border-t border-neutral-200 bg-neutral-50/50 px-4 py-3">
            <TablePagination
              page={pagination.page}
              totalPages={pagination.total_pages}
              pageSize={pagination.page_size}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              disabled={isLoading}
              pageSizeOptions={[...DEFAULT_PAGE_SIZE_OPTIONS]}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
