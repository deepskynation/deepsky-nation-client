import { adminTableHeadClass } from "@/components/admin/product/modules/admin-product-ui";

export function AdminUsersTableHeader() {
  return (
    <thead className={adminTableHeadClass}>
      <tr>
        <th className="px-4 py-3 text-left font-medium">Name</th>
        <th className="px-4 py-3 text-left font-medium">Email</th>
        <th className="px-4 py-3 text-left font-medium">Status</th>
        <th className="px-4 py-3 text-left font-medium">Last Login</th>
        <th className="px-4 py-3 text-right font-medium">Actions</th>
      </tr>
    </thead>
  );
}
