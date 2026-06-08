"use client";

import { useEffect } from "react";
import { Loader2Icon } from "lucide-react";
import {
  adminAlertErrorClass,
  adminSectionClass,
  adminSectionTitleClass,
} from "@/components/admin/product/modules/admin-product-ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  formatAdminUserDateTime,
  formatAdminUserStatus,
} from "@/lib/admin-user-status";
import {
  clearAdminUserDetail,
  fetchAdminUserDetail,
  selectAdminUserDetail,
  selectAdminUserDetailError,
  selectAdminUserDetailStatus,
} from "@/store/slices/adminUserSlice";
import type { AdminUserDetail, AdminUserListItem } from "@/types/admin-user";

type AdminUserDetailDialogProps = {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewUser?: AdminUserListItem | null;
};

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
        {label}
      </p>
      <p className="text-sm text-neutral-900">{value?.trim() ? value : "—"}</p>
    </div>
  );
}

export function AdminUserDetailDialog({
  userId,
  open,
  onOpenChange,
  previewUser = null,
}: AdminUserDetailDialogProps) {
  const dispatch = useAppDispatch();
  const detailUser = useAppSelector(selectAdminUserDetail);
  const detailStatus = useAppSelector(selectAdminUserDetailStatus);
  const detailError = useAppSelector(selectAdminUserDetailError);

  useEffect(() => {
    if (!open || !userId) {
      return;
    }
    void dispatch(fetchAdminUserDetail(userId));
  }, [dispatch, open, userId]);

  useEffect(() => {
    if (!open) {
      dispatch(clearAdminUserDetail());
    }
  }, [dispatch, open]);

  const user: AdminUserDetail | AdminUserListItem | null =
    detailUser ?? previewUser;
  const isLoading = detailStatus === "loading" && !detailUser;
  const statusMeta = user ? formatAdminUserStatus(user.status) : null;
  const fullUser = detailUser;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>{user?.name ?? "User Details"}</DialogTitle>
          <DialogDescription>
            Review account profile, verification status, and recent sessions.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-500">
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
            Loading user…
          </div>
        ) : null}

        {detailError ? (
          <p className={adminAlertErrorClass} role="alert">
            {detailError}
          </p>
        ) : null}

        {user && !isLoading ? (
          <div className="space-y-6">
            <section className={adminSectionClass}>
              <h3 className={adminSectionTitleClass}>Account</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <DetailField label="Email" value={user.email} />
                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                    Status
                  </p>
                  {statusMeta ? (
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                  ) : null}
                </div>
                <DetailField label="Role" value={fullUser?.role ?? null} />
                <DetailField
                  label="Email Verified"
                  value={
                    fullUser
                      ? fullUser.is_email_verified
                        ? "Yes"
                        : "No"
                      : null
                  }
                />
                <DetailField
                  label="Last Login"
                  value={formatAdminUserDateTime(user.last_login_at)}
                />
                <DetailField
                  label="Registered"
                  value={formatAdminUserDateTime(fullUser?.created_at ?? null)}
                />
                <DetailField
                  label="Active Sessions"
                  value={
                    fullUser ? String(fullUser.active_session_count) : null
                  }
                />
              </div>
            </section>

            {fullUser ? (
              <section className={adminSectionClass}>
                <h3 className={adminSectionTitleClass}>Profile</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DetailField label="Phone" value={fullUser.phone_number} />
                  <DetailField label="City" value={fullUser.city} />
                  <DetailField label="Region" value={fullUser.region} />
                  <DetailField label="Country" value={fullUser.country} />
                  <DetailField label="Postal Code" value={fullUser.postal_code} />
                  <DetailField label="Address" value={fullUser.home_address} />
                </div>
              </section>
            ) : null}

            {fullUser && fullUser.recent_sessions.length > 0 ? (
              <section className={adminSectionClass}>
                <h3 className={adminSectionTitleClass}>Recent Sessions</h3>
                <div className="mt-4 space-y-3">
                  {fullUser.recent_sessions.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-lg border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-neutral-900">
                          {formatAdminUserDateTime(session.created_at)}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {session.revoked_at ? "Revoked" : "Open"}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">
                        Expires {formatAdminUserDateTime(session.expires_at)}
                      </p>
                      {session.ip_address ? (
                        <p className="mt-1 text-xs text-neutral-500">
                          IP {session.ip_address}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
