"use client";

import { AdminOrdersList } from "@/components/admin/orders/list";
import {
  adminCardClass,
} from "@/components/admin/product/modules/admin-product-ui";

export function AdminOrdersPageContent() {
  return (
    <section className="w-full space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
          Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          Orders
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Review customer orders, approve or reject payments, and track delivery from
          pending through shipped to delivered.
        </p>
      </header>

      <div className={adminCardClass}>
        <div className="p-5 sm:p-6 lg:p-8">
          <AdminOrdersList />
        </div>
      </div>
    </section>
  );
}
