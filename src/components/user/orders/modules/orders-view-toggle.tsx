"use client";

import { LayoutGridIcon, ListIcon } from "lucide-react";
import {
  glassFilterPillSimpleActiveClassName,
  glassFilterPillSimpleClassName,
} from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

export type OrdersListView = "cards" | "table";

type OrdersViewToggleProps = {
  value: OrdersListView;
  onChange: (value: OrdersListView) => void;
  className?: string;
};

const VIEW_OPTIONS: { id: OrdersListView; label: string; icon: typeof LayoutGridIcon }[] = [
  { id: "cards", label: "Cards", icon: LayoutGridIcon },
  { id: "table", label: "List", icon: ListIcon },
];

export function OrdersViewToggle({ value, onChange, className }: OrdersViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Order list view"
      className={cn("inline-flex flex-wrap gap-1 rounded-lg bg-black/[0.04] p-1", className)}
    >
      {VIEW_OPTIONS.map(({ id, label, icon: Icon }) => {
        const isActive = value === id;

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? glassFilterPillSimpleActiveClassName
                : glassFilterPillSimpleClassName,
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
