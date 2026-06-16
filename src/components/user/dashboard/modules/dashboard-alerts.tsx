"use client";

import Link from "next/link";
import { AlertTriangleIcon, PackageIcon, TruckIcon, UserCircleIcon } from "lucide-react";
import { glassCardClassName } from "@/lib/glass-styles";
import { formatOrderNumber } from "@/lib/order-display";
import { cn } from "@/lib/utils";
import type { ApiOrder } from "@/types/order";
import type { User } from "@/types";

type DashboardAlertsProps = {
  user: User | null;
  profileIncomplete: boolean;
  orders: ApiOrder[];
};

type DashboardAlert = {
  id: string;
  tone: "warning" | "info" | "danger" | "success";
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  icon: typeof AlertTriangleIcon;
};

function buildAlerts(user: User | null, profileIncomplete: boolean, orders: ApiOrder[]) {
  const alerts: DashboardAlert[] = [];

  if (profileIncomplete && user) {
    alerts.push({
      id: "profile-incomplete",
      tone: "warning",
      title: "Complete Your Delivery Profile",
      description: "Add your phone and address for faster checkout next time.",
      href: "/profile",
      actionLabel: "Update Profile",
      icon: UserCircleIcon,
    });
  }

  const pendingOrder = orders.find((order) => order.status === "pending");
  if (pendingOrder) {
    alerts.push({
      id: `pending-${pendingOrder.id}`,
      tone: "info",
      title: "Order Awaiting Review",
      description: `${formatOrderNumber(pendingOrder.order_number)} is pending admin approval.`,
      href: `/orders/${pendingOrder.id}`,
      actionLabel: "View Order",
      icon: PackageIcon,
    });
  }

  const rejectedOrder = orders.find((order) => order.status === "rejected");
  if (rejectedOrder) {
    alerts.push({
      id: `rejected-${rejectedOrder.id}`,
      tone: "danger",
      title: "Order Was Rejected",
      description:
        rejectedOrder.rejection_reason?.trim() ||
        `${formatOrderNumber(rejectedOrder.order_number)} was not approved.`,
      href: `/orders/${rejectedOrder.id}`,
      actionLabel: "View Details",
      icon: AlertTriangleIcon,
    });
  }

  const shippedOrder = orders.find((order) => order.status === "shipped");
  if (shippedOrder) {
    alerts.push({
      id: `shipped-${shippedOrder.id}`,
      tone: "success",
      title: "Order On The Way",
      description: `${formatOrderNumber(shippedOrder.order_number)} has been shipped.`,
      href: `/orders/${shippedOrder.id}`,
      actionLabel: "Track Order",
      icon: TruckIcon,
    });
  }

  return alerts;
}

const TONE_STYLES: Record<DashboardAlert["tone"], string> = {
  warning: "border-amber-200/80 bg-amber-50/80 text-amber-950",
  info: "border-blue-200/80 bg-blue-50/80 text-blue-950",
  danger: "border-red-200/80 bg-red-50/80 text-red-950",
  success: "border-emerald-200/80 bg-emerald-50/80 text-emerald-950",
};

export function DashboardAlerts({
  user,
  profileIncomplete,
  orders,
}: DashboardAlertsProps) {
  const alerts = buildAlerts(user, profileIncomplete, orders);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      {alerts.map((alert) => {
        const Icon = alert.icon;
        return (
          <div
            key={alert.id}
            className={cn(
              glassCardClassName,
              "flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
              TONE_STYLES[alert.tone],
            )}
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white/70">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{alert.title}</p>
                <p className="mt-0.5 text-sm opacity-80">{alert.description}</p>
              </div>
            </div>
            <Link
              href={alert.href}
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-current/20 bg-white/70 px-4 text-[11px] uppercase tracking-[0.16em] transition hover:bg-white"
            >
              {alert.actionLabel}
            </Link>
          </div>
        );
      })}
    </section>
  );
}
