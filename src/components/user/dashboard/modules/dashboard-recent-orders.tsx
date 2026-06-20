"use client";

import Link from "next/link";
import { Loader2Icon, PackageIcon } from "lucide-react";
import { glassCardClassName } from "@/lib/glass-styles";
import {
  formatOrderDate,
  formatOrderNumber,
  formatOrderStatus,
  formatOrderTotal,
} from "@/lib/order-display";
import { cn } from "@/lib/utils";
import type { ApiOrder } from "@/types/order";

type DashboardRecentOrdersProps = {
  orders: ApiOrder[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

export function DashboardRecentOrders({
  orders,
  status,
  error,
}: DashboardRecentOrdersProps) {
  const isLoading = status === "loading" && orders.length === 0;
  const isEmpty = orders.length === 0 && status === "succeeded";

  return (
    <section className={cn(glassCardClassName, "flex h-full flex-col p-5 sm:p-6")}>
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-full bg-black/[0.04] text-black/45">
          <PackageIcon className="size-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-black">Recent Orders</h2>
          <p className="text-xs text-black/50">Latest purchase updates</p>
        </div>
      </div>

      {error && status === "failed" ? (
        <p className="mb-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-black/50">
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
          Loading orders…
        </div>
      ) : isEmpty ? (
        <div className="flex flex-1 flex-col justify-between gap-4">
          <p className="text-sm text-black/55">No orders yet.</p>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/15 bg-white px-5 text-[11px] uppercase tracking-[0.18em] text-black transition hover:border-black hover:bg-black hover:text-white"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3">
          <ul className="space-y-2">
            {orders.map((order) => {
              const statusMeta = formatOrderStatus(order.status);
              return (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl bg-black/[0.03] px-3 py-3 transition hover:bg-white hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-black">
                        {formatOrderNumber(order.order_number)}
                      </p>
                      <p className="text-xs text-black/50">
                        {formatOrderDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                          statusMeta.className,
                        )}
                      >
                        {statusMeta.label}
                      </span>
                      <span className="text-xs font-medium tabular-nums text-black/75">
                        {formatOrderTotal(order)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/orders"
            className="mt-auto inline-flex h-10 items-center justify-center rounded-full border border-black/15 bg-white px-5 text-[11px] uppercase tracking-[0.18em] text-black transition hover:border-black hover:bg-black hover:text-white"
          >
            View all orders
          </Link>
        </div>
      )}
    </section>
  );
}
