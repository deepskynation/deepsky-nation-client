import { cn } from "@/lib/utils";

export type SlantOutOfStockBadgeProps = {
  label?: string;
  className?: string;
};

export function SlantOutOfStockBadge({
  label = "Out of stock",
  className,
}: SlantOutOfStockBadgeProps) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute right-0 top-0 z-10 size-9 overflow-hidden rounded-tr-lg",
        className,
      )}
      aria-hidden
    >
      <span className="absolute right-[-30px] top-[10px] block w-[72px] rotate-45 whitespace-nowrap bg-red-600 py-0.5 text-center text-[5px] font-bold uppercase leading-none tracking-tight text-white shadow-sm">
        {label}
      </span>
    </span>
  );
}
