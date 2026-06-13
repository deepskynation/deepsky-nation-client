import {
  emptyStateClassName,
  sectionTitleClassName,
  tableHeadClassName,
  tableRowClassName,
  tableWrapClassName,
} from "@/lib/panel-styles";
import { formatMoney } from "@/lib/order-display";
import { cn } from "@/lib/utils";
import type { SalesAnalytics, TopSellingProduct } from "@/types/admin-dashboard";

type SalesAnalyticsTopProductsTableProps =
  | {
      section: "summary";
      summary: SalesAnalytics["summary"];
      products?: never;
    }
  | {
      section: "detail";
      products: TopSellingProduct[];
      summary?: never;
    };

const SUMMARY_TILES = [
  { key: "revenue" as const, label: "Revenue" },
  { key: "orders" as const, label: "Orders" },
  { key: "units_sold" as const, label: "Units Sold" },
];

export function SalesAnalyticsTopProductsTable(props: SalesAnalyticsTopProductsTableProps) {
  return (
    <>
      {props.section === "summary" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {SUMMARY_TILES.map((tile) => (
            <div
              key={tile.key}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-3"
            >
              <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                {tile.label}
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-neutral-900">
                {tile.key === "revenue"
                  ? formatMoney(props.summary.revenue)
                  : props.summary[tile.key].toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className={sectionTitleClassName}>Top Products Detail</h3>
          {props.products.length === 0 ? (
            <div className={emptyStateClassName}>
              <p className="text-sm text-muted-foreground">No product sales in this period.</p>
            </div>
          ) : (
            <div className={tableWrapClassName}>
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr>
                    <th className={cn(tableHeadClassName, "px-4 py-3")}>Product</th>
                    <th className={cn(tableHeadClassName, "px-4 py-3")}>Code</th>
                    <th className={cn(tableHeadClassName, "px-4 py-3 text-right")}>Units</th>
                    <th className={cn(tableHeadClassName, "px-4 py-3 text-right")}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {props.products.map((product) => (
                    <tr key={product.product_id} className={tableRowClassName}>
                      <td className="px-4 py-3 font-medium text-neutral-900">{product.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{product.product_code}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{product.units_sold}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatMoney(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
