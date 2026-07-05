"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import {
  isPurchaseActivityOrderSkipped,
  maxPurchasedAt,
  readPurchaseActivityLatestAt,
  readPurchaseActivitySeenIds,
  writePurchaseActivityLatestAt,
  writePurchaseActivitySeenIds,
} from "@/lib/purchase-activity-storage";
import { fetchRecentPurchases } from "@/store/slices/purchaseActivitySlice";
import type {
  PurchaseActivityToastItem,
  RecentPurchaseActivityItem,
} from "@/types/purchase-activity";

const POLL_INTERVAL_MS = 10_000;
const AUTO_DISMISS_MS = 6_000;
const QUEUE_GAP_MS = 300;

function createToastId(orderId: string): string {
  return `${orderId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toToastItem(item: RecentPurchaseActivityItem): PurchaseActivityToastItem {
  return {
    ...item,
    toastId: createToastId(item.order_id),
  };
}

function shouldSkipItem(orderId: string): boolean {
  return isPurchaseActivityOrderSkipped(orderId);
}

export function usePurchaseActivityPolling() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const enabled = !pathname.startsWith("/admin");

  const [visibleItems, setVisibleItems] = useState<PurchaseActivityToastItem[]>([]);
  const [ready, setReady] = useState(false);
  const queueRef = useRef<PurchaseActivityToastItem[]>([]);
  const seenIdsRef = useRef<Set<string>>(readPurchaseActivitySeenIds());
  const latestAtRef = useRef<string | null>(readPurchaseActivityLatestAt());
  const dismissTimersRef = useRef<Map<string, number>>(new Map());
  const queueGapTimerRef = useRef<number | null>(null);
  const isShowingRef = useRef(false);

  const clearQueueGapTimer = useCallback(() => {
    if (queueGapTimerRef.current !== null) {
      window.clearTimeout(queueGapTimerRef.current);
      queueGapTimerRef.current = null;
    }
  }, []);

  const persistBaseline = useCallback((items: RecentPurchaseActivityItem[]) => {
    for (const item of items) {
      seenIdsRef.current.add(item.order_id);
    }
    writePurchaseActivitySeenIds(seenIdsRef.current);

    const newest = maxPurchasedAt(items);
    if (newest && (!latestAtRef.current || newest > latestAtRef.current)) {
      latestAtRef.current = newest;
      writePurchaseActivityLatestAt(newest);
    }
  }, []);

  const showToast = useCallback((toastItem: PurchaseActivityToastItem) => {
    isShowingRef.current = true;
    setVisibleItems([toastItem]);
  }, []);

  const scheduleDismiss = useCallback((toastId: string) => {
    const existing = dismissTimersRef.current.get(toastId);
    if (existing) {
      window.clearTimeout(existing);
    }

    const timerId = window.setTimeout(() => {
      dismissTimersRef.current.delete(toastId);
      isShowingRef.current = false;
      setVisibleItems([]);
    }, AUTO_DISMISS_MS);

    dismissTimersRef.current.set(toastId, timerId);
  }, []);

  const promoteNextFromQueue = useCallback(
    (withGap: boolean) => {
      const next = queueRef.current.shift();
      if (!next) {
        return;
      }

      clearQueueGapTimer();

      const present = () => {
        showToast(next);
        scheduleDismiss(next.toastId);
      };

      if (withGap) {
        queueGapTimerRef.current = window.setTimeout(() => {
          queueGapTimerRef.current = null;
          present();
        }, QUEUE_GAP_MS);
        return;
      }

      present();
    },
    [clearQueueGapTimer, scheduleDismiss, showToast],
  );

  const enqueueItems = useCallback(
    (items: RecentPurchaseActivityItem[]) => {
      const sorted = [...items]
        .filter((item) => !shouldSkipItem(item.order_id))
        .sort((a, b) => a.purchased_at.localeCompare(b.purchased_at));

      if (sorted.length === 0) {
        return;
      }

      const toastItems = sorted.map(toToastItem);
      persistBaseline(sorted);

      for (const toastItem of toastItems) {
        if (!isShowingRef.current) {
          showToast(toastItem);
          scheduleDismiss(toastItem.toastId);
        } else {
          queueRef.current.push(toastItem);
        }
      }
    },
    [persistBaseline, scheduleDismiss, showToast],
  );

  const syncPurchaseActivity = useCallback(
    async (mode: "init" | "poll") => {
      if (!enabled) {
        return;
      }

      try {
        const response = await dispatch(
          fetchRecentPurchases({
            since: mode === "poll" ? latestAtRef.current : null,
            limit: 10,
          }),
        ).unwrap();

        if (mode === "init") {
          persistBaseline(response.items);
          return;
        }

        const unseen = response.items.filter((item) => {
          if (seenIdsRef.current.has(item.order_id)) {
            return false;
          }
          if (shouldSkipItem(item.order_id)) {
            seenIdsRef.current.add(item.order_id);
            return false;
          }
          return true;
        });
        if (unseen.length > 0) {
          enqueueItems(unseen);
        } else if (response.items.length > 0) {
          persistBaseline(response.items);
          writePurchaseActivitySeenIds(seenIdsRef.current);
        }
      } catch {
        // Ignore polling errors — social proof is non-critical.
      }
    },
    [dispatch, enabled, enqueueItems, persistBaseline],
  );

  const dismiss = useCallback((toastId: string) => {
    const timerId = dismissTimersRef.current.get(toastId);
    if (timerId) {
      window.clearTimeout(timerId);
      dismissTimersRef.current.delete(toastId);
    }

    isShowingRef.current = false;
    setVisibleItems([]);
  }, []);

  useEffect(() => {
    if (visibleItems.length > 0) {
      return;
    }
    if (queueRef.current.length === 0) {
      return;
    }
    if (queueGapTimerRef.current !== null) {
      return;
    }

    promoteNextFromQueue(true);
  }, [promoteNextFromQueue, visibleItems]);

  useEffect(() => {
    if (!enabled) {
      setVisibleItems([]);
      setReady(false);
      queueRef.current = [];
      isShowingRef.current = false;
      clearQueueGapTimer();
      return;
    }

    let cancelled = false;
    void (async () => {
      await syncPurchaseActivity("init");
      if (!cancelled) {
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
      setReady(false);
    };
  }, [clearQueueGapTimer, enabled, syncPurchaseActivity]);

  useEffect(() => {
    if (!enabled || !ready) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void syncPurchaseActivity("poll");
    }, POLL_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncPurchaseActivity("poll");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, ready, syncPurchaseActivity]);

  useEffect(() => {
    return () => {
      clearQueueGapTimer();
      for (const timerId of dismissTimersRef.current.values()) {
        window.clearTimeout(timerId);
      }
      dismissTimersRef.current.clear();
    };
  }, [clearQueueGapTimer]);

  return {
    enabled,
    visibleItems,
    dismiss,
  };
}
