"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch } from "@/hooks";
import {
  fetchCart,
  optimisticUpdateCartItemQuantity,
  updateCartItem,
} from "@/store/slices/cartSlice";

const QUANTITY_PATCH_DEBOUNCE_MS = 350;

export function useDebouncedCartQuantityUpdate() {
  const dispatch = useAppDispatch();
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const pendingQuantitiesRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const timers = debounceTimersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
      pendingQuantitiesRef.current.clear();
    };
  }, []);

  const flushQuantityUpdate = useCallback(
    (itemId: string) => {
      const nextQuantity = pendingQuantitiesRef.current.get(itemId);
      pendingQuantitiesRef.current.delete(itemId);
      debounceTimersRef.current.delete(itemId);

      if (nextQuantity === undefined) {
        return;
      }

      void dispatch(updateCartItem({ itemId, quantity: nextQuantity }))
        .unwrap()
        .catch(() => {
          void dispatch(fetchCart());
        });
    },
    [dispatch],
  );

  const changeQuantity = useCallback(
    (itemId: string, nextQuantity: number) => {
      dispatch(
        optimisticUpdateCartItemQuantity({ itemId, quantity: nextQuantity }),
      );

      pendingQuantitiesRef.current.set(itemId, nextQuantity);

      const existingTimer = debounceTimersRef.current.get(itemId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      debounceTimersRef.current.set(
        itemId,
        setTimeout(() => {
          flushQuantityUpdate(itemId);
        }, QUANTITY_PATCH_DEBOUNCE_MS),
      );
    },
    [dispatch, flushQuantityUpdate],
  );

  return changeQuantity;
}
