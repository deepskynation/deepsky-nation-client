"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2Icon, UsersIcon } from "lucide-react";
import { AdminUsersTableHeader } from "@/components/admin/users/modules/table-header";
import { AdminUsersTableRow } from "@/components/admin/users/modules/table-row";
import {
  adminAlertErrorClass,
  adminEmptyStateClass,
  adminFieldClass,
  adminLabelClass,
  adminTableWrapClass,
} from "@/components/admin/product/modules/admin-product-ui";
import { DateRangeFilter } from "@/components/common/filters";
import { TablePagination } from "@/components/common/pagination/table-pagination";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { ADMIN_USER_STATUS_FILTER_OPTIONS } from "@/lib/admin-user-status";
import {
  dateRangeFromBounds,
  resolveDateRangeBounds,
  type DateRangeFilterValue,
} from "@/lib/date-range-filter";
import { cn } from "@/lib/utils";
import type { AdminUserActivityStatus } from "@/types/admin-user";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "@/types/pagination";
import { selectAuthInitialized, selectIsAuthenticated } from "@/store/slices/authSlice";
import {
  fetchAdminUsersList,
  selectAdminUserStatistics,
  selectAdminUsers,
  selectAdminUsersListError,
  selectAdminUsersListQuery,
  selectAdminUsersListStatus,
  selectAdminUsersPagination,
} from "@/store/slices/adminUserSlice";

const SEARCH_DEBOUNCE_MS = 350;

export function AdminUsersList() {
  const dispatch = useAppDispatch();
  const authReady = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const users = useAppSelector(selectAdminUsers);
  const statistics = useAppSelector(selectAdminUserStatistics);
  const pagination = useAppSelector(selectAdminUsersPagination);
  const listQuery = useAppSelector(selectAdminUsersListQuery);
  const status = useAppSelector(selectAdminUsersListStatus);
  const error = useAppSelector(selectAdminUsersListError);

  const [searchInput, setSearchInput] = useState(listQuery.search ?? "");

  const loadUsers = useCallback(
    (query?: Parameters<typeof fetchAdminUsersList>[0]) => {
      void dispatch(fetchAdminUsersList(query));
    },
    [dispatch],
  );

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      return;
    }
    void dispatch(fetchAdminUsersList());
  }, [authReady, dispatch, isAuthenticated]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      if ((listQuery.search ?? "") === trimmed) {
        return;
      }
      loadUsers({ page: 1, search: trimmed || undefined });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [listQuery.search, loadUsers, searchInput]);

  const isLoading = status === "loading";
  const showPagination =
    pagination.total_pages > 0 && (status === "succeeded" || status === "loading");
  const totalCount = pagination.total ?? users.length;
  const statusFilter = listQuery.status ?? "";

  const handlePageChange = (page: number) => {
    loadUsers({ page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    loadUsers({ page: 1, page_size: pageSize });
  };

  const handleStatusFilterChange = (value: string) => {
    loadUsers({
      page: 1,
      status: value ? (value as AdminUserActivityStatus) : undefined,
    });
  };

  const handleDateRangeChange = (value: DateRangeFilterValue) => {
    const { from, to } = resolveDateRangeBounds(value);
    loadUsers({
      page: 1,
      created_from: from,
      created_to: to,
    });
  };

  const dateRange = dateRangeFromBounds(listQuery.created_from, listQuery.created_to);

  const headingSubtitle =
    status === "succeeded"
      ? `${totalCount} user${totalCount === 1 ? "" : "s"}`
      : "Registered accounts will appear here.";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-neutral-900">All Users</h2>
          <p className="text-sm text-muted-foreground">{headingSubtitle}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-[12rem] space-y-1.5">
            <label htmlFor="admin-users-search" className={adminLabelClass}>
              Search
            </label>
            <input
              id="admin-users-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Name or email"
              className={adminFieldClass}
            />
          </div>
          <div className="min-w-[10rem] space-y-1.5">
            <label htmlFor="admin-users-status" className={adminLabelClass}>
              Status
            </label>
            <select
              id="admin-users-status"
              value={statusFilter}
              onChange={(event) => handleStatusFilterChange(event.target.value)}
              className={adminFieldClass}
            >
              {ADMIN_USER_STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[12rem] space-y-1.5">
            <span className={adminLabelClass}>Registered</span>
            <DateRangeFilter
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder="All time"
              triggerClassName={cn(adminFieldClass, "w-full justify-between text-left")}
            />
          </div>
        </div>
      </div>

      {error ? (
        <p className={adminAlertErrorClass} role="alert">
          {error}
        </p>
      ) : null}

      <div className={adminTableWrapClass}>
        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-sm">
            <AdminUsersTableHeader />
            <tbody>
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className={cn(adminEmptyStateClass, "border-0")}>
                      <Loader2Icon className="size-5 animate-spin" aria-hidden />
                      <span>Loading users…</span>
                    </div>
                  </td>
                </tr>
              ) : null}

              {!isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className={cn(adminEmptyStateClass, "border-0")}>
                      <UsersIcon className="size-8 text-neutral-300" aria-hidden />
                      <span>No users found.</span>
                    </div>
                  </td>
                </tr>
              ) : null}

              {users.map((user) => (
                <AdminUsersTableRow key={user.id} user={user} />
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

      {statistics ? (
        <p className="sr-only" aria-live="polite">
          {statistics.registered_users} registered, {statistics.active_users} active,{" "}
          {statistics.inactive_users} inactive
        </p>
      ) : null}
    </div>
  );
}
