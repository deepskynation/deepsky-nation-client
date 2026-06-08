"use client";

import { UsersIcon } from "lucide-react";
import type { AdminUserStatistics } from "@/types/admin-user";
import { cn } from "@/lib/utils";

type UserStatCardsProps = {
  statistics: AdminUserStatistics | null;
  className?: string;
};

const cards = [
  {
    key: "registered_users" as const,
    label: "Registered Users",
    description: "Customer accounts",
    accent: "text-neutral-900",
  },
  {
    key: "active_users" as const,
    label: "Active Users",
    description: "Currently logged in",
    accent: "text-emerald-700",
  },
  {
    key: "inactive_users" as const,
    label: "Inactive Users",
    description: "Logged out or expired",
    accent: "text-neutral-600",
  },
];

export function UserStatCards({ statistics, className }: UserStatCardsProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {cards.map((card) => (
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
                {statistics ? statistics[card.key] : "—"}
              </p>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </div>
            <UsersIcon className="size-5 text-neutral-300" aria-hidden />
          </div>
        </div>
      ))}
    </div>
  );
}
