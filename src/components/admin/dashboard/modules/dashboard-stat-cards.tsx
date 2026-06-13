"use client";

import {
  PackageIcon,
  ShoppingCartIcon,
  DollarSignIcon,
  EyeOffIcon,
  EyeIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatCardsSkeleton } from "@/components/common/feedback/stat-cards-skeleton";
import { formatMoney } from "@/lib/order-display";
import { cn } from "@/lib/utils";
import type { DashboardStatistics } from "@/types/admin-dashboard";

type DashboardStatCardsProps = {
  statistics: DashboardStatistics | null;
  loading?: boolean;
  className?: string;
};

type StatCardConfig = {
  key: string;
  label: string;
  description: string;
  accent: string;
  icon: LucideIcon;
  display: string;
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

const STAT_CARD_ROWS = [
  { id: "primary", source: primaryCards, columns: 3 },
  { id: "products", source: productCards, columns: 2 },
] as const;

export function DashboardStatCards({
  statistics,
  loading = false,
  className,
}: DashboardStatCardsProps) {
  const isInitialLoading = loading && !statistics;

  const statCardRows = STAT_CARD_ROWS.map((row) => ({
    id: row.id,
    columns: row.columns,
    cards:
      row.id === "primary"
        ? primaryCards.map((card) => {
            const rawValue = statistics?.[card.key];
            return {
              key: card.key,
              label: card.label,
              description: card.description,
              accent: card.accent,
              icon: card.icon,
              display: rawValue != null ? card.format(rawValue as never) : "—",
            };
          })
        : productCards.map((card) => {
            const value = statistics?.[card.key];
            return {
              key: card.key,
              label: card.label,
              description: card.description,
              accent: card.accent,
              icon: card.icon,
              display: value != null ? value.toLocaleString() : "—",
            };
          }),
  }));

  return (
    <div className={cn("space-y-4", className)}>
      {isInitialLoading ? (
        <StatCardsSkeleton />
      ) : (
        <>
          {statCardRows.map((row) => (
            <div
              key={row.id}
              className={cn("grid gap-4", row.columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}
            >
              {row.cards.map((card: StatCardConfig) => {
                const Icon = card.icon;

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
                          {card.display}
                        </p>
                        <p className="text-xs text-muted-foreground">{card.description}</p>
                      </div>
                      <Icon className="size-5 text-neutral-300" aria-hidden />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
