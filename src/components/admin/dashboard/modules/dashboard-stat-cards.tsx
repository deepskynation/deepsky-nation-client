"use client";

import {
  PackageIcon,
  ShoppingCartIcon,
  DollarSignIcon,
  EyeOffIcon,
  EyeIcon,
} from "lucide-react";
import type { DashboardStatistics } from "@/types/admin-dashboard";
import { formatMoney } from "@/lib/order-display";
import { cn } from "@/lib/utils";

type DashboardStatCardsProps = {
  statistics: DashboardStatistics | null;
  loading?: boolean;
  className?: string;
};

const primaryCards = [
  {
    key: "total_items" as const,
    label: "Total Items",
    description: "Inventory units across all variants",
    icon: PackageIcon,
    accent: "text-neutral-900",
    format: (value: number) => value.toLocaleString(),
  },
  {
    key: "total_sales" as const,
    label: "Total Sales",
    description: "Revenue from approved, shipped, and delivered orders",
    icon: DollarSignIcon,
    accent: "text-emerald-700",
    format: (value: string) => formatMoney(value),
  },
  {
    key: "total_orders" as const,
    label: "Total Orders",
    description: "All Orders placed in the selected period",
    icon: ShoppingCartIcon,
    accent: "text-neutral-900",
    format: (value: number) => value.toLocaleString(),
  },
];

const productCards = [
  {
    key: "total_not_released_products" as const,
    label: "Not Released Products",
    description: "Pending approval · private, admin only",
    icon: EyeOffIcon,
    accent: "text-amber-700",
  },
  {
    key: "total_released_products" as const,
    label: "Released Products",
    description: "Approved · live on shop",
    icon: EyeIcon,
    accent: "text-emerald-700",
  },
];

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
      <div className="space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
        <div className="h-8 w-16 animate-pulse rounded bg-neutral-200" />
        <div className="h-3 w-40 animate-pulse rounded bg-neutral-100" />
      </div>
    </div>
  );
}

export function DashboardStatCards({
  statistics,
  loading = false,
  className,
}: DashboardStatCardsProps) {
  if (loading && !statistics) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-3">
        {primaryCards.map((card) => {
          const Icon = card.icon;
          const rawValue = statistics?.[card.key];
          const display =
            rawValue != null
              ? card.format(rawValue as never)
              : "—";

          return (
            <div
              key={card.key}
              className="rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                    {card.label}
                  </p>
                  <p className={cn("text-3xl font-semibold tabular-nums", card.accent)}>
                    {display}
                  </p>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </div>
                <Icon className="size-5 text-neutral-300" aria-hidden />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {productCards.map((card) => {
          const Icon = card.icon;
          const value = statistics?.[card.key];

          return (
            <div
              key={card.key}
              className="rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                    {card.label}
                  </p>
                  <p className={cn("text-3xl font-semibold tabular-nums", card.accent)}>
                    {value != null ? value.toLocaleString() : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </div>
                <Icon className="size-5 text-neutral-300" aria-hidden />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
