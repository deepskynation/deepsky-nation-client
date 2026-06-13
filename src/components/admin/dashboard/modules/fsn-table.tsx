import {
  emptyStateClassName,
  tableHeadClassName,
  tableRowClassName,
  tableWrapClassName,
} from "@/lib/panel-styles";
import { cn } from "@/lib/utils";
import type { FsnProductRow } from "@/types/admin-dashboard";

type FsnProductTableProps = {
  products: FsnProductRow[];
  emptyLabel: string;
};

export function FsnProductTable({ products, emptyLabel }: FsnProductTableProps) {
  return (
    <>
      {products.length === 0 ? (
        <div className={emptyStateClassName}>
          <p className="text-sm text-muted-foreground">
            No {emptyLabel.toLowerCase()} in this period.
          </p>
        </div>
      ) : (
        <div className={tableWrapClassName}>
          <table className="w-full min-w-[640px]">
            <thead>
              <tr>
                <th className={cn(tableHeadClassName, "px-4 py-3")}>Product</th>
                <th className={cn(tableHeadClassName, "px-4 py-3")}>Code</th>
                <th className={cn(tableHeadClassName, "px-4 py-3 text-right")}>Units Sold</th>
                <th className={cn(tableHeadClassName, "px-4 py-3 text-right")}>Current Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.product_id} className={tableRowClassName}>
                  <td className="px-4 py-3 font-medium text-neutral-900">{product.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{product.product_code}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{product.units_sold}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{product.current_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
