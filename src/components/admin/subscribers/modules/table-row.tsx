import { tableRowClassName } from "@/lib/panel-styles";
import { formatAdminUserDateTime } from "@/lib/admin-user-status";
import type { AdminSubscriberListItem } from "@/types/admin-subscriber";

type AdminSubscribersTableRowProps = {
  subscriber: AdminSubscriberListItem;
};

export function AdminSubscribersTableRow({ subscriber }: AdminSubscribersTableRowProps) {
  return (
    <tr className={tableRowClassName}>
      <td className="px-4 py-3 font-medium text-neutral-900">{subscriber.email}</td>
      <td className="px-4 py-3 text-neutral-600">
        {formatAdminUserDateTime(subscriber.created_at)}
      </td>
    </tr>
  );
}
