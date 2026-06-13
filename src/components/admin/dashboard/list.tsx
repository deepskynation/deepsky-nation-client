"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { BarChart3Icon, TrendingUpIcon } from "lucide-react";
import { DateRangeFilter } from "@/components/common/filters";
import { DashboardStatCards } from "@/components/admin/dashboard/modules/dashboard-stat-cards";
import { FsnAnalysisTab } from "@/components/admin/dashboard/modules/fsn-analysis-tab";
import { SalesAnalyticsTab } from "@/components/admin/dashboard/modules/sales-analytics-tab";
import {
  alertErrorClassName,
  cardClassName,
  segmentListClassName,
  segmentTabClassName,
} from "@/lib/panel-styles";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  createDateRangeFromPreset,
  resolveDateRangeBounds,
  type DateRangeFilterValue,
} from "@/lib/date-range-filter";
import { cn } from "@/lib/utils";
import {
  fetchDashboardStatistics,
  fetchFsnAnalysis,
  fetchSalesAnalytics,
  selectDashboardStatistics,
  selectDashboardStatisticsError,
  selectDashboardStatisticsStatus,
  selectFsnAnalysis,
  selectFsnAnalysisError,
  selectFsnAnalysisStatus,
  selectFsnFetchedForQuery,
  selectSalesAnalytics,
  selectSalesAnalyticsError,
  selectSalesAnalyticsStatus,
  selectSalesFetchedForQuery,
  setDashboardDateQuery,
} from "@/store/slices/adminDashboardSlice";
import {
  selectAuthInitialized,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";

type AnalyticsView = "sales" | "fsn";

const ANALYTICS_TABS: {
  id: AnalyticsView;
  label: string;
  icon: typeof TrendingUpIcon;
}[] = [
  { id: "sales", label: "Sales Analytics", icon: TrendingUpIcon },
  { id: "fsn", label: "FSN Analysis", icon: BarChart3Icon },
];

function serializeDateQuery(from?: string, to?: string): string {
  return JSON.stringify({ from: from ?? null, to: to ?? null });
}

export function AdminDashboardList() {
  const dispatch = useAppDispatch();
  const tabListId = useId();
  const authReady = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const statistics = useAppSelector(selectDashboardStatistics);
  const statisticsStatus = useAppSelector(selectDashboardStatisticsStatus);
  const statisticsError = useAppSelector(selectDashboardStatisticsError);

  const salesAnalytics = useAppSelector(selectSalesAnalytics);
  const salesStatus = useAppSelector(selectSalesAnalyticsStatus);
  const salesError = useAppSelector(selectSalesAnalyticsError);
  const salesFetchedForQuery = useAppSelector(selectSalesFetchedForQuery);

  const fsnAnalysis = useAppSelector(selectFsnAnalysis);
  const fsnStatus = useAppSelector(selectFsnAnalysisStatus);
  const fsnError = useAppSelector(selectFsnAnalysisError);
  const fsnFetchedForQuery = useAppSelector(selectFsnFetchedForQuery);

  const [dateRange, setDateRange] = useState<DateRangeFilterValue>(() =>
    createDateRangeFromPreset("this-month"),
  );
  const [activeView, setActiveView] = useState<AnalyticsView>("sales");

  const { from, to } = resolveDateRangeBounds(dateRange);
  const queryKey = serializeDateQuery(from, to);

  const loadStatistics = useCallback(() => {
    const query = { from, to };
    dispatch(setDashboardDateQuery(query));
    void dispatch(fetchDashboardStatistics(query));
  }, [dispatch, from, to]);

  const loadSales = useCallback(() => {
    void dispatch(fetchSalesAnalytics({ from, to }));
  }, [dispatch, from, to]);

  const loadFsn = useCallback(() => {
    void dispatch(fetchFsnAnalysis({ from, to }));
  }, [dispatch, from, to]);

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      return;
    }
    loadStatistics();
  }, [authReady, isAuthenticated, loadStatistics]);

  useEffect(() => {
    if (!authReady || !isAuthenticated) {
      return;
    }
    if (activeView === "sales" && salesFetchedForQuery !== queryKey) {
      loadSales();
    }
    if (activeView === "fsn" && fsnFetchedForQuery !== queryKey) {
      loadFsn();
    }
  }, [
    activeView,
    authReady,
    fsnFetchedForQuery,
    isAuthenticated,
    loadFsn,
    loadSales,
    queryKey,
    salesFetchedForQuery,
  ]);

  const handleDateRangeChange = (value: DateRangeFilterValue) => {
    setDateRange(value);
    const bounds = resolveDateRangeBounds(value);
    const query = { from: bounds.from, to: bounds.to };
    dispatch(setDashboardDateQuery(query));
    void dispatch(fetchDashboardStatistics(query));
    if (activeView === "sales") {
      void dispatch(fetchSalesAnalytics(query));
    } else {
      void dispatch(fetchFsnAnalysis(query));
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Admin</p>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Overview of inventory, sales, and product movement. Analytics respond to the selected
            date range.
          </p>
        </div>

        <DateRangeFilter
          value={dateRange}
          onChange={handleDateRangeChange}
          label="Period"
          placeholder="All time"
          className="shrink-0"
        />
      </header>

      {statisticsStatus === "failed" ? (
        <div className="space-y-3">
          <div className={alertErrorClassName}>
            {statisticsError ?? "Failed to load dashboard statistics."}
          </div>
          <Button type="button" variant="outline" onClick={loadStatistics}>
            Retry
          </Button>
        </div>
      ) : null}

      <DashboardStatCards
        statistics={statistics}
        loading={statisticsStatus === "loading"}
      />

      <div className="space-y-4">
        <div
          id={tabListId}
          role="tablist"
          aria-label="Dashboard Analytics Views"
          className={segmentListClassName}
        >
          {ANALYTICS_TABS.map((tab) => {
            const isActive = activeView === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${tabListId}-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`${tabListId}-${tab.id}-panel`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveView(tab.id)}
                className={cn(segmentTabClassName(isActive), "inline-flex items-center gap-2")}
              >
                <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className={cardClassName}>
          {ANALYTICS_TABS.map((tab) => {
            const isActive = activeView === tab.id;

            return (
              <div
                key={tab.id}
                id={`${tabListId}-${tab.id}-panel`}
                role="tabpanel"
                aria-labelledby={`${tabListId}-${tab.id}`}
                hidden={!isActive}
              >
                {tab.id === "sales" ? (
                  <SalesAnalyticsTab
                    data={salesAnalytics}
                    status={salesStatus}
                    error={salesError}
                    dateFrom={from}
                    dateTo={to}
                    onRetry={loadSales}
                  />
                ) : (
                  <FsnAnalysisTab
                    data={fsnAnalysis}
                    status={fsnStatus}
                    error={fsnError}
                    onRetry={loadFsn}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
