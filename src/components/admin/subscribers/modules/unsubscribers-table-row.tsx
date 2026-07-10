import { tableRowClassName } from "@/lib/panel-styles";
import { formatAdminUserDateTime } from "@/lib/admin-user-status";
import type { AdminUnsubscriberListItem } from "@/types/admin-subscriber";

type AdminUnsubscribersTableRowProps = {
  unsubscriber: AdminUnsubscriberListItem;
};

export function AdminUnsubscribersTableRow({
  unsubscriber,
}: AdminUnsubscribersTableRowProps) {
  return (
    <tr className={tableRowClassName}>
      <td className="px-4 py-3 font-medium text-neutral-900">{unsubscriber.email}</td>
      <td className="px-4 py-3 text-neutral-600">
        {formatAdminUserDateTime(unsubscriber.subscribed_at)}
      </td>
      <td className="px-4 py-3 text-neutral-600">
        {formatAdminUserDateTime(unsubscriber.unsubscribed_at)}
      </td>
    </tr>
  );
}
