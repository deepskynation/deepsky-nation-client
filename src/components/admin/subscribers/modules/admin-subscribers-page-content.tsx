"use client";

import { AdminSubscribersList } from "@/components/admin/subscribers/list";

export function AdminSubscribersPageContent() {
  return (
    <section className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
          Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
          Email Subscribers
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          View newsletter signups from the shop. Subscribers receive emails when
          new products are released or go on sale.
        </p>
      </header>

      <AdminSubscribersList />
    </section>
  );
}
