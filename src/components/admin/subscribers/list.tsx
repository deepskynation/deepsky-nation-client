"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2Icon, MailIcon, MailXIcon } from "lucide-react";
import { AdminSubscriberTabs } from "@/components/admin/subscribers/modules/admin-subscriber-tabs";
import { AdminSubscribersTableHeader } from "@/components/admin/subscribers/modules/table-header";
import { AdminSubscribersTableRow } from "@/components/admin/subscribers/modules/table-row";
import { AdminUnsubscribersTableHeader } from "@/components/admin/subscribers/modules/unsubscribers-table-header";
import { AdminUnsubscribersTableRow } from "@/components/admin/subscribers/modules/unsubscribers-table-row";
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
import type { AdminSubscriberTab } from "@/types/admin-subscriber";
import { selectAuthInitialized, selectIsAuthenticated } from "@/store/slices/authSlice";
import {
  fetchAdminSubscribersList,
  fetchAdminUnsubscribersList,
  selectAdminSubscriberTab,
  selectAdminSubscribers,
  selectAdminSubscribersListError,
  selectAdminSubscribersListQuery,
  selectAdminSubscribersListStatus,
  selectAdminSubscribersPagination,
  selectAdminUnsubscribers,
  selectAdminUnsubscribersListError,
  selectAdminUnsubscribersListQuery,
  selectAdminUnsubscribersListStatus,
  selectAdminUnsubscribersPagination,
  setAdminSubscriberTab,
} from "@/store/slices/adminSubscriberSlice";

const SEARCH_DEBOUNCE_MS = 350;

export function AdminSubscribersList() {
  const dispatch = useAppDispatch();
  const authReady = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const activeTab = useAppSelector(selectAdminSubscriberTab);

  const subscribers = useAppSelector(selectAdminSubscribers);
  const subscribersPagination = useAppSelector(selectAdminSubscribersPagination);
  const subscribersQuery = useAppSelector(selectAdminSubscribersListQuery);
  const subscribersStatus = useAppSelector(selectAdminSubscribersListStatus);
  const subscribersError = useAppSelector(selectAdminSubscribersListError);

  const unsubscribers = useAppSelector(selectAdminUnsubscribers);
  const unsubscribersPagination = useAppSelector(selectAdminUnsubscribersPagination);
  const unsubscribersQuery = useAppSelector(selectAdminUnsubscribersListQuery);
  const unsubscribersStatus = useAppSelector(selectAdminUnsubscribersListStatus);
  const unsubscribersError = useAppSelector(selectAdminUnsubscribersListError);

  const isSubscribersTab = activeTab === "subscribers";
  const listQuery = isSubscribersTab ? subscribersQuery : unsubscribersQuery;
  const pagination = isSubscribersTab ? subscribersPagination : unsubscribersPagination;
  const status = isSubscribersTab ? subscribersStatus : unsubscribersStatus;
  const error = isSubscribersTab ? subscribersError : unsubscribersError;
  const rows = isSubscribersTab ? subscribers : unsubscribers;

  const [searchInput, setSearchInput] = useState(listQuery.search ?? "");

  const loadSubscribers = useCallback(
    (query?: Parameters<typeof fetchAdminSubscribersList>[0]) => {
      void dispatch(fetchAdminSubscribersList(query));
    },
    [dispatch],
  );

  const loadUnsubscribers = useCallback(
    (query?: Parameters<typeof fetchAdminUnsubscribersList>[0]) => {
      void dispatch(fetchAdminUnsubscribersList(query));
    },
    [dispatch],
  );

  const loadActiveList = useCallback(
    (
      query?:
        | Parameters<typeof fetchAdminSubscribersList>[0]
        | Parameters<typeof fetchAdminUnsubscribersList>[0],
    ) => {
      if (isSubscribersTab) {
        loadSubscribers(query);
        return;
      }
      loadUnsubscribers(query);
    },
    [isSubscribersTab, loadSubscribers, loadUnsubscribers],
  );

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      return;
    }
    if (isSubscribersTab) {
      void dispatch(fetchAdminSubscribersList());
      return;
    }
    void dispatch(fetchAdminUnsubscribersList());
  }, [authReady, dispatch, isAuthenticated, isSubscribersTab]);

  useEffect(() => {
    setSearchInput(listQuery.search ?? "");
  }, [activeTab, listQuery.search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      if ((listQuery.search ?? "") === trimmed) {
        return;
      }
      loadActiveList({ page: 1, search: trimmed || undefined });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [listQuery.search, loadActiveList, searchInput]);

  const isLoading = status === "loading";
  const showPagination =
    pagination.total_pages > 0 && (status === "succeeded" || status === "loading");
  const totalCount = pagination.total ?? rows.length;
  const columnCount = isSubscribersTab ? 2 : 3;

  const handleTabChange = (tab: AdminSubscriberTab) => {
    if (tab === activeTab) {
      return;
    }
    dispatch(setAdminSubscriberTab(tab));
  };

  const handlePageChange = (page: number) => {
    loadActiveList({ page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    loadActiveList({ page: 1, page_size: pageSize });
  };

  const handleDateRangeChange = (value: DateRangeFilterValue) => {
    const { from, to } = resolveDateRangeBounds(value);
    if (isSubscribersTab) {
      loadSubscribers({
        page: 1,
        created_from: from,
        created_to: to,
      });
      return;
    }
    loadUnsubscribers({
      page: 1,
      unsubscribed_from: from,
      unsubscribed_to: to,
    });
  };

  const dateRange = isSubscribersTab
    ? dateRangeFromBounds(subscribersQuery.created_from, subscribersQuery.created_to)
    : dateRangeFromBounds(
        unsubscribersQuery.unsubscribed_from,
        unsubscribersQuery.unsubscribed_to,
      );

  const headingTitle = isSubscribersTab ? "Active Subscribers" : "Unsubscribers";
  const headingSubtitle =
    status === "succeeded"
      ? isSubscribersTab
        ? `${totalCount} subscriber${totalCount === 1 ? "" : "s"} receiving emails`
        : `${totalCount} unsubscriber${totalCount === 1 ? "" : "s"} opted out`
      : isSubscribersTab
        ? "Newsletter signups will appear here."
        : "People who opted out will appear here.";

  const emptyLabel = isSubscribersTab ? "No subscribers found." : "No unsubscribers found.";
  const loadingLabel = isSubscribersTab
    ? "Loading subscribers…"
    : "Loading unsubscribers…";
  const EmptyIcon = isSubscribersTab ? MailIcon : MailXIcon;

  return (
    <div className="space-y-5">
      <AdminSubscriberTabs
        activeTab={activeTab}
        disabled={isLoading}
        onTabChange={handleTabChange}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-neutral-900">{headingTitle}</h2>
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
            <span className={labelClassName}>
              {isSubscribersTab ? "Subscribed" : "Unsubscribed"}
            </span>
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
            {isSubscribersTab ? (
              <AdminSubscribersTableHeader />
            ) : (
              <AdminUnsubscribersTableHeader />
            )}
            <tbody>
              {isLoading && rows.length === 0 ? (
                <tr>
                  <td colSpan={columnCount}>
                    <div className={cn(emptyStateClassName, "border-0")}>
                      <Loader2Icon className="size-5 animate-spin" aria-hidden />
                      <span>{loadingLabel}</span>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && rows.length === 0 ? (
                <tr>
                  <td colSpan={columnCount}>
                    <div className={cn(emptyStateClassName, "border-0")}>
                      <EmptyIcon className="size-8 text-neutral-300" aria-hidden />
                      <span>{emptyLabel}</span>
                    </div>
                  </td>
                </tr>
              ) : null}

              {isSubscribersTab
                ? subscribers.map((subscriber) => (
                    <AdminSubscribersTableRow
                      key={subscriber.id}
                      subscriber={subscriber}
                    />
                  ))
                : unsubscribers.map((unsubscriber) => (
                    <AdminUnsubscribersTableRow
                      key={unsubscriber.id}
                      unsubscriber={unsubscriber}
                    />
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
