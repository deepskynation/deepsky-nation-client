"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PurchaseActivityViewport } from "@/components/common/marketing/purchase-activity-viewport";
import { usePurchaseActivityPolling } from "@/hooks/use-purchase-activity-polling";

export function PurchaseActivityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { enabled, visibleItems, dismiss } = usePurchaseActivityPolling();

  useEffect(() => {
    setMounted(true);
  }, []);

  const viewport =
    enabled && visibleItems.length > 0 ? (
      <PurchaseActivityViewport items={visibleItems} onDismiss={dismiss} />
    ) : null;

  return (
    <>
      {children}
      {mounted && viewport ? createPortal(viewport, document.body) : viewport}
    </>
  );
}
