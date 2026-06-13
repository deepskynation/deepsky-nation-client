"use client";

import { useState } from "react";
import { RabbitIcon, SnailIcon, BanIcon } from "lucide-react";
import { FsnProductTable } from "@/components/admin/dashboard/modules/fsn-table";
import {
  alertErrorClassName,
  emptyStateClassName,
  segmentListClassName,
  segmentTabClassName,
} from "@/lib/panel-styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FsnAnalysis, FsnClassification } from "@/types/admin-dashboard";

type FsnAnalysisTabProps = {
  data: FsnAnalysis | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  onRetry: () => void;
};

type FsnTabId = FsnClassification;

const FSN_TABS: {
  id: FsnTabId;
  label: string;
  description: string;
  icon: typeof RabbitIcon;
  accent: string;
}[] = [
  {
    id: "fast_moving",
    label: "Fast Moving",
    description: "High sales velocity in this period",
    icon: RabbitIcon,
    accent: "text-emerald-700",
  },
  {
    id: "slow_moving",
    label: "Slow Moving",
    description: "Some sales, below fast-moving threshold",
    icon: SnailIcon,
    accent: "text-amber-700",
  },
  {
    id: "non_moving",
    label: "Non-moving",
    description: "Zero units sold in this period",
    icon: BanIcon,
    accent: "text-neutral-600",
  },
];

export function FsnAnalysisTab({ data, status, error, onRetry }: FsnAnalysisTabProps) {
  const [activeClass, setActiveClass] = useState<FsnTabId>("fast_moving");
  const activeProducts = data?.products[activeClass] ?? [];
  const activeMeta = FSN_TABS.find((tab) => tab.id === activeClass);
  const isInitialLoading = status === "loading" && !data;

  return (
    <>
      {isInitialLoading ? (
        <div className="space-y-4 p-5 sm:p-6 lg:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((key) => (
              <div key={key} className="h-24 animate-pulse rounded-xl bg-neutral-100" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-xl bg-neutral-100" />
        </div>
      ) : status === "failed" ? (
        <div className="space-y-4 p-5 sm:p-6 lg:p-8">
          <div className={alertErrorClassName}>{error ?? "Failed to load FSN analysis."}</div>
          <Button type="button" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : !data ? (
        <div className={cn(emptyStateClassName, "m-5 sm:m-6 lg:m-8")}>
          <p className="text-sm text-muted-foreground">FSN analysis will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6 p-5 sm:p-6 lg:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {FSN_TABS.map((tab) => {
              const Icon = tab.icon;
              const count = data.summary[tab.id];

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveClass(tab.id)}
                  className={cn(
                    "rounded-xl border px-5 py-4 text-left shadow-sm transition-colors",
                    activeClass === tab.id
                      ? "border-neutral-400 bg-neutral-50"
                      : "border-neutral-200 bg-white hover:border-neutral-300",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                        {tab.label}
                      </p>
                      <p className={cn("text-3xl font-semibold tabular-nums", tab.accent)}>
                        {count}
                      </p>
                      <p className="text-xs text-muted-foreground">{tab.description}</p>
                    </div>
                    <Icon className="size-5 text-neutral-300" aria-hidden />
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            Fast-moving threshold: {data.thresholds.fast_moving_min_units} units sold (75th
            percentile among products with sales).
          </p>

          <div className="space-y-4">
            <div className={segmentListClassName}>
              {FSN_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveClass(tab.id)}
                  className={segmentTabClassName(activeClass === tab.id)}
                >
                  {tab.label} ({data.summary[tab.id]})
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-neutral-900">
                {activeMeta?.label} products
              </h3>
              <FsnProductTable
                products={activeProducts}
                emptyLabel={activeMeta?.label ?? "products"}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

