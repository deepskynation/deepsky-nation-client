import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiUrl } from "@/lib/api-config";
import { readApiError } from "@/store/api-utils";
import type { CheckoutDeliveryFormState } from "@/lib/checkout-delivery";
import type { CheckoutPaymentMethod } from "@/lib/checkout-payment";
import type { AppDispatch, RootState } from "@/store";
import type {
  AdminOrdersQuery,
  AdminUpdateOrderStatusPayload,
  ApiOrder,
  CreateOrderPayload,
  MyOrdersQuery,
  PaginatedApiOrders,
} from "@/types/order";

type OrdersThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
};

export type OrdersListStatus = "idle" | "loading" | "succeeded" | "failed";
export type OrderMutationStatus = "idle" | "loading" | "succeeded" | "failed";
export type PaymentProofScope = "admin" | "user";

export type OrderPaymentReceiptState = {
  dataUrl: string | null;
  status: OrdersListStatus;
  error: string | null;
};

export type OrdersState = {
  myList: PaginatedApiOrders | null;
  listStatus: OrdersListStatus;
  listError: string | null;
  listQuery: MyOrdersQuery;
  detailOrder: ApiOrder | null;
  detailStatus: OrdersListStatus;
  detailError: string | null;
  createStatus: OrderMutationStatus;
  createError: string | null;
  lastCreated: ApiOrder | null;
  cancelStatus: OrderMutationStatus;
  cancelError: string | null;
  adminList: PaginatedApiOrders | null;
  adminListStatus: OrdersListStatus;
  adminListError: string | null;
  adminListQuery: AdminOrdersQuery;
  adminDetailOrder: ApiOrder | null;
  adminDetailStatus: OrdersListStatus;
  adminDetailError: string | null;
  adminUpdateStatus: OrderMutationStatus;
  adminUpdateError: string | null;
  adminUpdatingOrderId: string | null;
  previewOrders: ApiOrder[];
  previewStatus: OrdersListStatus;
  previewError: string | null;
  paymentReceipts: Record<string, OrderPaymentReceiptState>;
};

const initialListQuery: MyOrdersQuery = {
  page: 1,
  page_size: 10,
};

const initialAdminListQuery: AdminOrdersQuery = {
  page: 1,
  page_size: 10,
};

const initialState: OrdersState = {
  myList: null,
  listStatus: "idle",
  listError: null,
  listQuery: initialListQuery,
  detailOrder: null,
  detailStatus: "idle",
  detailError: null,
  createStatus: "idle",
  createError: null,
  lastCreated: null,
  cancelStatus: "idle",
  cancelError: null,
  adminList: null,
  adminListStatus: "idle",
  adminListError: null,
  adminListQuery: initialAdminListQuery,
  adminDetailOrder: null,
  adminDetailStatus: "idle",
  adminDetailError: null,
  adminUpdateStatus: "idle",
  adminUpdateError: null,
  adminUpdatingOrderId: null,
  previewOrders: [],
  previewStatus: "idle",
  previewError: null,
  paymentReceipts: {},
};

function patchOrderInList(state: OrdersState, updated: ApiOrder) {
  if (!state.myList) {
    return;
  }
  state.myList.rows = state.myList.rows.map((row) =>
    row.id === updated.id ? updated : row,
  );
}

function patchAdminOrderInList(state: OrdersState, updated: ApiOrder) {
  if (!state.adminList) {
    return;
  }
  state.adminList.rows = state.adminList.rows.map((row) =>
    row.id === updated.id ? updated : row,
  );
}

function getAccessToken(getState: () => RootState): string | null {
  return getState().auth.accessToken;
}

export function paymentReceiptKey(orderId: string, scope: PaymentProofScope): string {
  return `${scope}:${orderId}`;
}

function buildPaymentReceiptUrl(orderId: string, scope: PaymentProofScope): string {
  const path =
    scope === "admin"
      ? `/api/admin/orders/${orderId}/payment-receipt`
      : `/api/user/orders/${orderId}/payment-receipt`;
  return apiUrl(path);
}

function mapPaymentMethod(method: CheckoutPaymentMethod): "cod" | "online_transfer" {
  return method === "cod" ? "cod" : "online_transfer";
}

function mapDeliveryBody(delivery: CheckoutDeliveryFormState) {
  return {
    email: delivery.email.trim(),
    phone_number: delivery.phone_number.trim(),
    home_address: delivery.home_address.trim(),
    city: delivery.city.trim(),
    region: delivery.region.trim(),
    country: delivery.country.trim(),
    postal_code: delivery.postal_code.trim(),
  };
}

function buildMyOrdersUrl(query: MyOrdersQuery): string {
  const params = new URLSearchParams();
  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }
  if (query.page_size !== undefined) {
    params.set("page_size", String(query.page_size));
  }
  if (query.status?.trim()) {
    params.set("status", query.status.trim());
  }
  if (query.order_number?.trim()) {
    params.set("order_number", query.order_number.trim());
  }
  if (query.created_from?.trim()) {
    params.set("created_from", query.created_from.trim());
  }
  if (query.created_to?.trim()) {
    params.set("created_to", query.created_to.trim());
  }
  const qs = params.toString();
  return apiUrl(`/api/user/orders${qs ? `?${qs}` : ""}`);
}

function buildAdminOrdersUrl(query: AdminOrdersQuery): string {
  const params = new URLSearchParams();
  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }
  if (query.page_size !== undefined) {
    params.set("page_size", String(query.page_size));
  }
  if (query.status?.trim()) {
    params.set("status", query.status.trim());
  }
  if (query.user_id?.trim()) {
    params.set("user_id", query.user_id.trim());
  }
  if (query.created_from?.trim()) {
    params.set("created_from", query.created_from.trim());
  }
  if (query.created_to?.trim()) {
    params.set("created_to", query.created_to.trim());
  }
  if (query.order_number?.trim()) {
    params.set("order_number", query.order_number.trim());
  }
  if (query.customer?.trim()) {
    params.set("customer", query.customer.trim());
  }
  if (query.payment_method?.trim()) {
    params.set("payment_method", query.payment_method.trim());
  }
  const qs = params.toString();
  return apiUrl(`/api/admin/orders${qs ? `?${qs}` : ""}`);
}

export const fetchMyOrdersList = createAsyncThunk<
  { data: PaginatedApiOrders; query: MyOrdersQuery },
  MyOrdersQuery | undefined,
  OrdersThunkConfig
>("orders/fetchMyOrdersList", async (query, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in to view orders.");
  }

  const mergedQuery = { ...getState().orders.listQuery, ...query };

  try {
    const response = await fetch(buildMyOrdersUrl(mergedQuery), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const data = (await response.json()) as PaginatedApiOrders;
    return { data, query: mergedQuery };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load orders.";
    return rejectWithValue(message);
  }
});

export const fetchMyOrdersPreview = createAsyncThunk<
  ApiOrder[],
  { page_size?: number } | undefined,
  OrdersThunkConfig
>("orders/fetchMyOrdersPreview", async (query, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in to view orders.");
  }

  const pageSize = query?.page_size ?? 5;
  const url = buildMyOrdersUrl({ page: 1, page_size: pageSize });

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const data = (await response.json()) as PaginatedApiOrders;
    return data.rows;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load orders.";
    return rejectWithValue(message);
  }
});

export const fetchMyOrderDetail = createAsyncThunk<
  ApiOrder,
  string,
  OrdersThunkConfig
>("orders/fetchMyOrderDetail", async (orderId, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in to view this order.");
  }

  try {
    const response = await fetch(apiUrl(`/api/user/orders/${orderId}`), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    return (await response.json()) as ApiOrder;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load order.";
    return rejectWithValue(message);
  }
});

export const cancelMyOrder = createAsyncThunk<
  ApiOrder,
  string,
  OrdersThunkConfig
>("orders/cancelMyOrder", async (orderId, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in to cancel an order.");
  }

  try {
    const response = await fetch(apiUrl(`/api/user/orders/${orderId}/cancel`), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    return (await response.json()) as ApiOrder;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to cancel order.";
    return rejectWithValue(message);
  }
});

export const fetchAdminOrdersList = createAsyncThunk<
  { data: PaginatedApiOrders; query: AdminOrdersQuery },
  AdminOrdersQuery | undefined,
  OrdersThunkConfig
>("orders/fetchAdminOrdersList", async (query, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  const mergedQuery = { ...getState().orders.adminListQuery, ...query };

  try {
    const response = await fetch(buildAdminOrdersUrl(mergedQuery), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const data = (await response.json()) as PaginatedApiOrders;
    return { data, query: mergedQuery };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load orders.";
    return rejectWithValue(message);
  }
});

export const fetchAdminOrderDetail = createAsyncThunk<
  ApiOrder,
  string,
  OrdersThunkConfig
>("orders/fetchAdminOrderDetail", async (orderId, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  try {
    const response = await fetch(apiUrl(`/api/admin/orders/${orderId}`), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    return (await response.json()) as ApiOrder;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load order.";
    return rejectWithValue(message);
  }
});

export const fetchOrderPaymentReceipt = createAsyncThunk<
  { key: string; dataUrl: string },
  { orderId: string; scope: PaymentProofScope },
  OrdersThunkConfig
>(
  "orders/fetchOrderPaymentReceipt",
  async ({ orderId, scope }, { getState, rejectWithValue }) => {
    const token = getAccessToken(getState);
    if (!token) {
      return rejectWithValue("You must be signed in to view payment receipts.");
    }

    const key = paymentReceiptKey(orderId, scope);

    try {
      const response = await fetch(buildPaymentReceiptUrl(orderId, scope), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const data = (await response.json()) as { data_url: string };
      return { key, dataUrl: data.data_url };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load payment receipt.";
      return rejectWithValue(message);
    }
  },
  {
    condition({ orderId, scope }, { getState }) {
      const key = paymentReceiptKey(orderId, scope);
      const entry = getState().orders.paymentReceipts[key];
      if (entry?.status === "loading") {
        return false;
      }
      if (entry?.status === "succeeded" && entry.dataUrl) {
        return false;
      }
      return true;
    },
  },
);

export const updateAdminOrderStatus = createAsyncThunk<
  ApiOrder,
  AdminUpdateOrderStatusPayload,
  OrdersThunkConfig
>(
  "orders/updateAdminOrderStatus",
  async ({ orderId, action, rejectionReason }, { getState, rejectWithValue }) => {
    const token = getAccessToken(getState);
    if (!token) {
      return rejectWithValue("You must be signed in as an admin.");
    }

    const body: { action: string; rejection_reason?: string } = { action };
    if (action === "reject" && rejectionReason?.trim()) {
      body.rejection_reason = rejectionReason.trim();
    }

    try {
      const response = await fetch(apiUrl(`/api/admin/orders/${orderId}/status`), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      return (await response.json()) as ApiOrder;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update order status.";
      return rejectWithValue(message);
    }
  },
);

export const placeOrder = createAsyncThunk<
  ApiOrder,
  CreateOrderPayload,
  OrdersThunkConfig
>("orders/placeOrder", async (payload, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in to place an order.");
  }

  const body: Record<string, unknown> = {
    delivery_source: payload.deliverySource,
    delivery: mapDeliveryBody(payload.delivery),
    payment_method: mapPaymentMethod(payload.paymentMethod),
    receipt_base64:
      payload.paymentMethod === "non-cod" ? payload.receiptBase64 ?? null : null,
  };

  if (payload.fromCart) {
    body.from_cart = true;
    if (payload.cartItemIds && payload.cartItemIds.length > 0) {
      body.cart_item_ids = payload.cartItemIds;
    }
  } else if (payload.items && payload.items.length > 0) {
    body.items = payload.items.map((line) => ({
      product_id: line.productId,
      variant_id: line.variantId ?? null,
      quantity: line.quantity,
    }));
  } else if (payload.productId) {
    body.product_id = payload.productId;
    body.variant_id = payload.variantId ?? null;
    body.quantity = payload.quantity ?? 1;
  }

  try {
    const response = await fetch(apiUrl("/api/user/orders"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    return (await response.json()) as ApiOrder;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to place order.";
    return rejectWithValue(message);
  }
});

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setMyOrdersListQuery(state, action: { payload: MyOrdersQuery }) {
      state.listQuery = { ...state.listQuery, ...action.payload };
    },
    clearOrderDetail(state) {
      state.detailOrder = null;
      state.detailStatus = "idle";
      state.detailError = null;
    },
    resetPlaceOrder(state) {
      state.createStatus = "idle";
      state.createError = null;
      state.lastCreated = null;
    },
    setAdminOrdersListQuery(state, action: { payload: AdminOrdersQuery }) {
      state.adminListQuery = { ...state.adminListQuery, ...action.payload };
    },
    clearAdminOrderDetail(state) {
      state.adminDetailOrder = null;
      state.adminDetailStatus = "idle";
      state.adminDetailError = null;
    },
    resetAdminOrderUpdate(state) {
      state.adminUpdateStatus = "idle";
      state.adminUpdateError = null;
    },
    clearOrderPaymentReceipt(
      state,
      action: { payload: { orderId: string; scope: PaymentProofScope } },
    ) {
      delete state.paymentReceipts[paymentReceiptKey(action.payload.orderId, action.payload.scope)];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrdersList.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchMyOrdersList.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.myList = action.payload.data;
        state.listQuery = action.payload.query;
      })
      .addCase(fetchMyOrdersList.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load orders.";
      })
      .addCase(fetchMyOrdersPreview.pending, (state) => {
        state.previewStatus = "loading";
        state.previewError = null;
      })
      .addCase(fetchMyOrdersPreview.fulfilled, (state, action) => {
        state.previewStatus = "succeeded";
        state.previewOrders = action.payload;
      })
      .addCase(fetchMyOrdersPreview.rejected, (state, action) => {
        state.previewStatus = "failed";
        state.previewError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load orders.";
      })
      .addCase(fetchMyOrderDetail.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
        state.detailOrder = null;
      })
      .addCase(fetchMyOrderDetail.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.detailOrder = action.payload;
      })
      .addCase(fetchMyOrderDetail.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load order.";
      })
      .addCase(placeOrder.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.lastCreated = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to place order.";
      })
      .addCase(cancelMyOrder.pending, (state) => {
        state.cancelStatus = "loading";
        state.cancelError = null;
      })
      .addCase(cancelMyOrder.fulfilled, (state, action) => {
        state.cancelStatus = "succeeded";
        const updated = action.payload;
        if (state.detailOrder?.id === updated.id) {
          state.detailOrder = updated;
        }
        if (state.lastCreated?.id === updated.id) {
          state.lastCreated = updated;
        }
        patchOrderInList(state, updated);
        state.previewOrders = state.previewOrders.map((row) =>
          row.id === updated.id ? updated : row,
        );
      })
      .addCase(cancelMyOrder.rejected, (state, action) => {
        state.cancelStatus = "failed";
        state.cancelError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to cancel order.";
      })
      .addCase(fetchAdminOrdersList.pending, (state) => {
        state.adminListStatus = "loading";
        state.adminListError = null;
      })
      .addCase(fetchAdminOrdersList.fulfilled, (state, action) => {
        state.adminListStatus = "succeeded";
        state.adminList = action.payload.data;
        state.adminListQuery = action.payload.query;
      })
      .addCase(fetchAdminOrdersList.rejected, (state, action) => {
        state.adminListStatus = "failed";
        state.adminListError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load orders.";
      })
      .addCase(fetchAdminOrderDetail.pending, (state) => {
        state.adminDetailStatus = "loading";
        state.adminDetailError = null;
        state.adminDetailOrder = null;
      })
      .addCase(fetchAdminOrderDetail.fulfilled, (state, action) => {
        state.adminDetailStatus = "succeeded";
        state.adminDetailOrder = action.payload;
      })
      .addCase(fetchAdminOrderDetail.rejected, (state, action) => {
        state.adminDetailStatus = "failed";
        state.adminDetailError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load order.";
      })
      .addCase(updateAdminOrderStatus.pending, (state, action) => {
        state.adminUpdateStatus = "loading";
        state.adminUpdateError = null;
        state.adminUpdatingOrderId = action.meta.arg.orderId;
      })
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        state.adminUpdateStatus = "succeeded";
        state.adminUpdatingOrderId = null;
        const updated = action.payload;
        if (state.adminDetailOrder?.id === updated.id) {
          state.adminDetailOrder = updated;
        }
        patchAdminOrderInList(state, updated);
      })
      .addCase(updateAdminOrderStatus.rejected, (state, action) => {
        state.adminUpdateStatus = "failed";
        state.adminUpdatingOrderId = null;
        state.adminUpdateError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to update order status.";
      })
      .addCase(fetchOrderPaymentReceipt.pending, (state, action) => {
        const key = paymentReceiptKey(action.meta.arg.orderId, action.meta.arg.scope);
        state.paymentReceipts[key] = {
          dataUrl: state.paymentReceipts[key]?.dataUrl ?? null,
          status: "loading",
          error: null,
        };
      })
      .addCase(fetchOrderPaymentReceipt.fulfilled, (state, action) => {
        state.paymentReceipts[action.payload.key] = {
          dataUrl: action.payload.dataUrl,
          status: "succeeded",
          error: null,
        };
      })
      .addCase(fetchOrderPaymentReceipt.rejected, (state, action) => {
        const key = paymentReceiptKey(action.meta.arg.orderId, action.meta.arg.scope);
        state.paymentReceipts[key] = {
          dataUrl: null,
          status: "failed",
          error:
            typeof action.payload === "string"
              ? action.payload
              : "Could not load payment receipt.",
        };
      });
  },
});

export const {
  setMyOrdersListQuery,
  clearOrderDetail,
  resetPlaceOrder,
  setAdminOrdersListQuery,
  clearAdminOrderDetail,
  resetAdminOrderUpdate,
  clearOrderPaymentReceipt,
} = orderSlice.actions;

export const selectOrdersState = (state: RootState) => state.orders;
export const selectMyOrders = (state: RootState) => state.orders.myList?.rows ?? [];
export const selectMyOrdersPagination = (state: RootState) => {
  const list = state.orders.myList;
  if (!list) {
    return null;
  }
  return {
    total: list.total,
    page: list.page,
    pageSize: list.page_size,
    totalPages: list.total_pages,
    hasNext: list.has_next,
    hasPrevious: list.has_previous,
  };
};
export const selectMyOrdersListStatus = (state: RootState) => state.orders.listStatus;
export const selectMyOrdersListError = (state: RootState) => state.orders.listError;
export const selectMyOrdersListQuery = (state: RootState) => state.orders.listQuery;
export const selectMyOrdersPreview = (state: RootState) => state.orders.previewOrders;
export const selectMyOrdersPreviewStatus = (state: RootState) =>
  state.orders.previewStatus;
export const selectMyOrdersPreviewError = (state: RootState) =>
  state.orders.previewError;
export const selectMyOrderDetail = (state: RootState) => state.orders.detailOrder;
export const selectMyOrderDetailStatus = (state: RootState) =>
  state.orders.detailStatus;
export const selectMyOrderDetailError = (state: RootState) => state.orders.detailError;
export const selectPlaceOrderStatus = (state: RootState) => state.orders.createStatus;
export const selectPlaceOrderError = (state: RootState) => state.orders.createError;
export const selectLastPlacedOrder = (state: RootState) => state.orders.lastCreated;
export const selectCancelOrderStatus = (state: RootState) => state.orders.cancelStatus;
export const selectAdminOrders = (state: RootState) => state.orders.adminList?.rows ?? [];
export const selectAdminOrdersPagination = (state: RootState) => {
  const list = state.orders.adminList;
  if (!list) {
    return null;
  }
  return {
    total: list.total,
    page: list.page,
    pageSize: list.page_size,
    totalPages: list.total_pages,
    hasNext: list.has_next,
    hasPrevious: list.has_previous,
  };
};
export const selectAdminOrdersListStatus = (state: RootState) =>
  state.orders.adminListStatus;
export const selectAdminOrdersListError = (state: RootState) =>
  state.orders.adminListError;
export const selectAdminOrdersListQuery = (state: RootState) =>
  state.orders.adminListQuery;
export const selectAdminOrderDetail = (state: RootState) =>
  state.orders.adminDetailOrder;
export const selectAdminOrderDetailStatus = (state: RootState) =>
  state.orders.adminDetailStatus;
export const selectAdminOrderDetailError = (state: RootState) =>
  state.orders.adminDetailError;
export const selectAdminOrderUpdateStatus = (state: RootState) =>
  state.orders.adminUpdateStatus;
export const selectAdminOrderUpdateError = (state: RootState) =>
  state.orders.adminUpdateError;
export const selectAdminUpdatingOrderId = (state: RootState) =>
  state.orders.adminUpdatingOrderId;

export const selectOrderPaymentReceipt =
  (orderId: string, scope: PaymentProofScope) =>
  (state: RootState): OrderPaymentReceiptState => {
    const key = paymentReceiptKey(orderId, scope);
    return (
      state.orders.paymentReceipts[key] ?? {
        dataUrl: null,
        status: "idle",
        error: null,
      }
    );
  };

export default orderSlice.reducer;
