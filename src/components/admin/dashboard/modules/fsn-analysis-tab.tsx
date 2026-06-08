"use client";

import { useState } from "react";
import { RabbitIcon, SnailIcon, BanIcon } from "lucide-react";
import {
  adminAlertErrorClass,
  adminEmptyStateClass,
  adminSegmentListClass,
  adminSegmentTabClass,
  adminTableHeadClass,
  adminTableRowClass,
  adminTableWrapClass,
} from "@/components/admin/product/modules/admin-product-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FsnAnalysis, FsnClassification, FsnProductRow } from "@/types/admin-dashboard";

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

  if (status === "loading" && !data) {
    return (
      <div className="space-y-4 p-5 sm:p-6 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((key) => (
            <div key={key} className="h-24 animate-pulse rounded-xl bg-neutral-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-neutral-100" />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="space-y-4 p-5 sm:p-6 lg:p-8">
        <div className={adminAlertErrorClass}>{error ?? "Failed to load FSN analysis."}</div>
        <Button type="button" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn(adminEmptyStateClass, "m-5 sm:m-6 lg:m-8")}>
        <p className="text-sm text-muted-foreground">FSN analysis will appear here.</p>
      </div>
    );
  }

  const activeProducts = data.products[activeClass];
  const activeMeta = FSN_TABS.find((tab) => tab.id === activeClass);

  return (
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
        Fast-moving threshold: {data.thresholds.fast_moving_min_units} units sold (75th percentile
        among products with sales).
      </p>

      <div className="space-y-4">
        <div className={adminSegmentListClass}>
          {FSN_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveClass(tab.id)}
              className={adminSegmentTabClass(activeClass === tab.id)}
            >
              {tab.label} ({data.summary[tab.id]})
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-900">{activeMeta?.label} products</h3>
          <FsnProductTable products={activeProducts} emptyLabel={activeMeta?.label ?? "products"} />
        </div>
      </div>
    </div>
  );
}

function FsnProductTable({
  products,
  emptyLabel,
}: {
  products: FsnProductRow[];
  emptyLabel: string;
}) {
  if (products.length === 0) {
    return (
      <div className={adminEmptyStateClass}>
        <p className="text-sm text-muted-foreground">No {emptyLabel.toLowerCase()} in this period.</p>
      </div>
    );
  }

  return (
    <div className={adminTableWrapClass}>
      <table className="w-full min-w-[640px]">
        <thead>
          <tr>
            <th className={cn(adminTableHeadClass, "px-4 py-3")}>Product</th>
            <th className={cn(adminTableHeadClass, "px-4 py-3")}>Code</th>
            <th className={cn(adminTableHeadClass, "px-4 py-3 text-right")}>Units Sold</th>
            <th className={cn(adminTableHeadClass, "px-4 py-3 text-right")}>Current Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.product_id} className={adminTableRowClass}>
              <td className="px-4 py-3 font-medium text-neutral-900">{product.title}</td>
              <td className="px-4 py-3 text-muted-foreground">{product.product_code}</td>
              <td className="px-4 py-3 text-right tabular-nums">{product.units_sold}</td>
              <td className="px-4 py-3 text-right tabular-nums">{product.current_stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
