"use client";

import { useState } from "react";
import { UserPlusIcon } from "lucide-react";
import { AdminUsersList } from "@/components/admin/users/list";
import { CreateAdminAccountDialog } from "@/components/admin/users/modules/create-admin-account-dialog";
import { UserStatCards } from "@/components/admin/users/modules/user-stat-cards";
import { adminCardClass } from "@/components/admin/product/modules/admin-product-ui";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks";
import { selectAdminUserStatistics } from "@/store/slices/adminUserSlice";

export function AdminUsersPageContent() {
  const statistics = useAppSelector(selectAdminUserStatistics);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <section className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
            Admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            User Management
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            View registered users, create admin accounts, and open detailed profile
            information for each account.
          </p>
        </div>

        <Button type="button" onClick={() => setCreateDialogOpen(true)}>
          <UserPlusIcon className="size-4" aria-hidden />
          Create Admin Account
        </Button>
      </header>

      <UserStatCards statistics={statistics} />

      <div className={adminCardClass}>
        <div className="p-5 sm:p-6 lg:p-8">
          <AdminUsersList />
        </div>
      </div>

      <CreateAdminAccountDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </section>
  );
}
