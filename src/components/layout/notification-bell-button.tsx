"use client";

import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sidebarHoverClassName } from "@/components/layout/sidebar-styles";
import { cn } from "@/lib/utils";

type NotificationBellButtonProps = {
  count?: number;
  className?: string;
};

export function NotificationBellButton({
  count,
  className,
}: NotificationBellButtonProps) {
  const hasUnread = count !== undefined && count > 0;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(
        "relative text-neutral-600 hover:text-neutral-900",
        sidebarHoverClassName,
        className,
      )}
      aria-label={
        hasUnread ? `${count} unread notifications` : "Notifications"
      }
    >
      <BellIcon className="size-5" strokeWidth={1.75} />
      {hasUnread ? (
        <span
          className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500"
          aria-hidden
        />
      ) : null}
    </Button>
  );
}
