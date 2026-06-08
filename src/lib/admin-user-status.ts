import type { AdminUserActivityStatus } from "@/types/admin-user";

export const ADMIN_USER_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

export function formatAdminUserStatus(status: AdminUserActivityStatus): {
  label: string;
  className: string;
} {
  if (status === "active") {
    return {
      label: "Active",
      className: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    };
  }
  return {
    label: "Inactive",
    className: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  };
}

export function formatAdminUserDateTime(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
