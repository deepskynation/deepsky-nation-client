import { tableHeadClassName } from "@/lib/panel-styles";

export function AdminUnsubscribersTableHeader() {
  return (
    <thead className={tableHeadClassName}>
      <tr>
        <th className="px-4 py-3 text-left font-medium">Email</th>
        <th className="px-4 py-3 text-left font-medium">Subscribed</th>
        <th className="px-4 py-3 text-left font-medium">Unsubscribed</th>
      </tr>
    </thead>
  );
}
