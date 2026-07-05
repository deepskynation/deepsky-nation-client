"use client";

import { PurchaseActivityToast } from "@/components/common/marketing/purchase-activity-toast";
import type { PurchaseActivityToastItem } from "@/types/purchase-activity";

type PurchaseActivityViewportProps = {
  items: PurchaseActivityToastItem[];
  onDismiss: (toastId: string) => void;
};

export function PurchaseActivityViewport({
  items,
  onDismiss,
}: PurchaseActivityViewportProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed bottom-4 left-4 z-[9999] w-[min(100vw-2rem,24rem)]"
    >
      {items.map((item) => (
        <PurchaseActivityToast
          key={item.toastId}
          item={item}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
