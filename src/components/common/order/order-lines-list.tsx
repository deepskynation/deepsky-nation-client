import { OrderLineRow, type OrderLineRowData } from "@/components/common/order/order-line-row";
import { cn } from "@/lib/utils";

type OrderLinesListProps = {
  lines: OrderLineRowData[];
  mode?: "display" | "editable";
  selectable?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (lineId: string) => void;
  onDecrease?: (lineId: string) => void;
  onIncrease?: (lineId: string) => void;
  onRemove?: (lineId: string) => void;
  onImageClick?: (src: string, alt: string) => void;
  isUpdating?: boolean;
  className?: string;
};

export function OrderLinesList({
  lines,
  mode = "display",
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  onDecrease,
  onIncrease,
  onRemove,
  onImageClick,
  isUpdating = false,
  className,
}: OrderLinesListProps) {
  const selectedSet = new Set(selectedIds);
  if (lines.length === 0) {
    return null;
  }

  return (
    <ul className={cn("space-y-3", className)}>
      {lines.map((line) => (
        <li key={line.id}>
          <OrderLineRow
            line={line}
            mode={mode}
            selectable={selectable}
            selected={selectedSet.has(line.id)}
            onToggleSelect={
              onToggleSelect ? () => onToggleSelect(line.id) : undefined
            }
            onDecrease={onDecrease ? () => onDecrease(line.id) : undefined}
            onIncrease={onIncrease ? () => onIncrease(line.id) : undefined}
            onRemove={onRemove ? () => onRemove(line.id) : undefined}
            onImageClick={onImageClick}
            isUpdating={isUpdating}
          />
        </li>
      ))}
    </ul>
  );
}
