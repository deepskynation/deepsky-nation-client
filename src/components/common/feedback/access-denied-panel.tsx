"use client";

import { ShieldXIcon } from "lucide-react";
import { GlassMessagePanel } from "@/components/common/feedback/glass-message-panel";
import { getDashboardPathForRole } from "@/lib/auth-session";
import type { UserRole } from "@/types";

type AccessDeniedPanelProps = {
  /** Dashboard for the signed-in user's actual role. */
  fallbackRole: UserRole;
};

export function AccessDeniedPanel({ fallbackRole }: AccessDeniedPanelProps) {
  const isAdminDestination = fallbackRole === "admin";

  return (
    <GlassMessagePanel
      variant="flat"
      fullPage
      icon={<ShieldXIcon className="size-10 text-black/40" aria-hidden />}
      title={
        isAdminDestination
          ? "This is the customer area"
          : "You don't have access to this area"
      }
      description={
        isAdminDestination
          ? "Storefront and customer pages are for shoppers. Use the admin dashboard to manage the store."
          : "This section is for administrators only. Return to your customer dashboard to continue."
      }
      action={{
        href: getDashboardPathForRole(fallbackRole),
        label: isAdminDestination ? "Go to admin dashboard" : "Go to my dashboard",
        variant: "button",
      }}
    />
  );
}
