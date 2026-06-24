import { tableHeadClassName } from "@/lib/panel-styles";

export function AdminOrdersTableHeader() {
  return (
    <thead>
      <tr className={tableHeadClassName}>
        <th className="px-4 py-3 font-semibold">Order</th>
        <th className="px-4 py-3 font-semibold">Customer</th>
        <th className="px-4 py-3 font-semibold">Items</th>
        <th className="px-4 py-3 font-semibold">Total</th>
        <th className="px-4 py-3 font-semibold">Payment</th>
        <th className="px-4 py-3 font-semibold">Placed</th>
        <th className="px-4 py-3 font-semibold">Completed</th>
        <th className="px-4 py-3 font-semibold">Status</th>
        <th className="w-12 px-4 py-3 font-semibold">
          <span className="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
  );
}
