"use client";

import { useState } from "react";
import { AdminUserDetailDialog } from "@/components/admin/users/modules/user-detail-dialog";
import { tableRowClassName } from "@/lib/panel-styles";
import { Button } from "@/components/ui/button";
import {
  formatAdminUserDateTime,
  formatAdminUserRole,
  formatAdminUserStatus,
} from "@/lib/admin-user-status";
import type { AdminUserListItem } from "@/types/admin-user";

type AdminUsersTableRowProps = {
  user: AdminUserListItem;
};

export function AdminUsersTableRow({ user }: AdminUsersTableRowProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const roleMeta = formatAdminUserRole(user.role);
  const statusMeta = formatAdminUserStatus(user.status);

  return (
    <>
      <tr className={tableRowClassName}>
        <td className="px-4 py-3 font-medium text-neutral-900">{user.name}</td>
        <td className="px-4 py-3 text-neutral-700">{user.email}</td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${roleMeta.className}`}
          >
            {roleMeta.label}
          </span>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusMeta.className}`}
          >
            {statusMeta.label}
          </span>
        </td>
        <td className="px-4 py-3 text-neutral-600">
          {formatAdminUserDateTime(user.last_login_at)}
        </td>
        <td className="px-4 py-3">
          <div className="flex justify-end">
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => setDetailOpen(true)}
            >
              View
            </Button>
          </div>
        </td>
      </tr>

      <AdminUserDetailDialog
        userId={user.id}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        previewUser={user}
      />
    </>
  );
}
