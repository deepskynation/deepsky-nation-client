"use client";

import { MailIcon, MailXIcon } from "lucide-react";
import {
  segmentListClassName,
  segmentTabClassName,
} from "@/lib/panel-styles";
import { cn } from "@/lib/utils";
import type { AdminSubscriberTab } from "@/types/admin-subscriber";

const TABS = [
  { id: "subscribers" as const, label: "Subscribers", icon: MailIcon },
  { id: "unsubscribers" as const, label: "Unsubscribers", icon: MailXIcon },
];

type AdminSubscriberTabsProps = {
  activeTab: AdminSubscriberTab;
  disabled?: boolean;
  onTabChange: (tab: AdminSubscriberTab) => void;
};

export function AdminSubscriberTabs({
  activeTab,
  disabled,
  onTabChange,
}: AdminSubscriberTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter by subscription status"
      className={segmentListClassName}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              segmentTabClassName(isActive),
              "inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
