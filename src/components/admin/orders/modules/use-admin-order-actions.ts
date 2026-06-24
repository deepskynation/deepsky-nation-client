"use client";

import { useCallback } from "react";
import { useToast } from "@/components/common/feedback/toast-provider";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { formatOrderNumber } from "@/lib/order-display";
import {
  fetchAdminOrdersList,
  selectAdminOrdersListQuery,
  updateAdminOrderStatus,
} from "@/store/slices/orderSlice";
import type { AdminUpdateOrderAction, ApiOrder } from "@/types/order";

const ACTION_SUCCESS_MESSAGES: Record<AdminUpdateOrderAction, string> = {
  approve: "Order approved. The customer will be notified by email.",
  reject: "Order rejected.",
  ship: "Order marked as shipped.",
};

export function useAdminOrderActions() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const listQuery = useAppSelector(selectAdminOrdersListQuery);

  const runAction = useCallback(
    async (
      order: Pick<ApiOrder, "id" | "order_number">,
      action: AdminUpdateOrderAction,
      rejectionReason?: string,
    ) => {
      try {
        await dispatch(
          updateAdminOrderStatus({
            orderId: order.id,
            action,
            rejectionReason,
          }),
        ).unwrap();

        void dispatch(fetchAdminOrdersList(listQuery));

        const orderLabel = formatOrderNumber(order.order_number);
        toast.success(`${orderLabel}: ${ACTION_SUCCESS_MESSAGES[action]}`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update order status.";
        toast.error(message);
        throw error;
      }
    },
    [dispatch, listQuery, toast],
  );

  return { runAction };
}
