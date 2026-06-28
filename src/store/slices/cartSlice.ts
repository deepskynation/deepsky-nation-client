import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiUrl } from "@/lib/api-config";
import { readApiError } from "@/store/api-utils";
import { placeOrder } from "@/store/slices/orderSlice";
import type { RootState } from "@/store";
import {
  pruneCartAfterOrder,
  selectedCartItemCount,
  selectedCartSubtotal,
  syncCartSelection,
} from "@/lib/cart-selection";
import type {
  AddCartItemPayload,
  ApiCart,
  ApiCartLine,
  UpdateCartItemPayload,
} from "@/types/cart";

type CartThunkConfig = {
  state: RootState;
  rejectValue: string;
};

export type CartStatus = "idle" | "loading" | "succeeded" | "failed";
export type CartMutationStatus = "idle" | "loading" | "succeeded" | "failed";

type CartState = {
  cart: ApiCart | null;
  selectedItemIds: string[];
  status: CartStatus;
  error: string | null;
  mutationStatus: CartMutationStatus;
  mutationError: string | null;
  updatingItemIds: string[];
};

const initialState: CartState = {
  cart: null,
  selectedItemIds: [],
  status: "idle",
  error: null,
  mutationStatus: "idle",
  mutationError: null,
  updatingItemIds: [],
};

function mergeCartThumbnails(
  previousItems: ApiCartLine[] | undefined,
  cart: ApiCart,
): ApiCart {
  if (!previousItems?.length) {
    return cart;
  }

  const thumbnailsByItemId = new Map(
    previousItems.map((item) => [item.id, item.thumbnail_base64]),
  );
  const thumbnailsByProductId = new Map(
    previousItems.map((item) => [item.product_id, item.thumbnail_base64]),
  );

  const items = cart.items.map((item) => {
    if (item.thumbnail_base64) {
      return item;
    }

    const fromItem = thumbnailsByItemId.get(item.id);
    if (fromItem) {
      return { ...item, thumbnail_base64: fromItem };
    }

    const fromProduct = thumbnailsByProductId.get(item.product_id);
    if (fromProduct) {
      return { ...item, thumbnail_base64: fromProduct };
    }

    return item;
  });

  return { ...cart, items };
}

function applyCartUpdate(state: CartState, cart: ApiCart) {
  state.cart = mergeCartThumbnails(state.cart?.items, cart);
  state.selectedItemIds = syncCartSelection(state.selectedItemIds, state.cart.items);
}

function reconcileCartTotals(state: CartState) {
  if (!state.cart) {
    return;
  }

  state.cart.item_count = state.cart.items.reduce(
    (sum, row) => sum + row.quantity,
    0,
  );
  state.cart.subtotal = state.cart.items
    .reduce((sum, row) => sum + Number.parseFloat(row.line_subtotal), 0)
    .toFixed(2);
}

function addUpdatingItemId(state: CartState, itemId: string) {
  if (!state.updatingItemIds.includes(itemId)) {
    state.updatingItemIds.push(itemId);
  }
}

function removeUpdatingItemId(state: CartState, itemId: string) {
  state.updatingItemIds = state.updatingItemIds.filter((id) => id !== itemId);
}

function getAccessToken(getState: () => RootState): string | null {
  return getState().auth.accessToken;
}

export const fetchCart = createAsyncThunk<ApiCart, void, CartThunkConfig>(
  "cart/fetchCart",
  async (_, { getState, rejectWithValue }) => {
    const token = getAccessToken(getState);
    if (!token) {
      return rejectWithValue("You must be signed in to view your cart.");
    }

    try {
      const response = await fetch(apiUrl("/api/user/cart"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }
      return (await response.json()) as ApiCart;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load cart.";
      return rejectWithValue(message);
    }
  },
);

export const addCartItem = createAsyncThunk<
  ApiCart,
  AddCartItemPayload,
  CartThunkConfig
>("cart/addCartItem", async (payload, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in to add items to your cart.");
  }

  try {
    const response = await fetch(apiUrl("/api/user/cart/items"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: payload.productId,
        variant_id: payload.variantId ?? null,
        quantity: payload.quantity ?? 1,
      }),
    });
    if (!response.ok) {
      throw new Error(await readApiError(response));
    }
    return (await response.json()) as ApiCart;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add item to cart.";
    return rejectWithValue(message);
  }
});

export const updateCartItem = createAsyncThunk<
  ApiCart,
  UpdateCartItemPayload,
  CartThunkConfig
>("cart/updateCartItem", async (payload, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in to update your cart.");
  }

  try {
    const response = await fetch(
      apiUrl(`/api/user/cart/items/${payload.itemId}`),
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: payload.quantity }),
      },
    );
    if (!response.ok) {
      throw new Error(await readApiError(response));
    }
    return (await response.json()) as ApiCart;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update cart item.";
    return rejectWithValue(message);
  }
});

export const removeCartItem = createAsyncThunk<
  ApiCart,
  string,
  CartThunkConfig
>("cart/removeCartItem", async (itemId, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in to update your cart.");
  }

  try {
    const response = await fetch(apiUrl(`/api/user/cart/items/${itemId}`), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(await readApiError(response));
    }
    return (await response.json()) as ApiCart;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove cart item.";
    return rejectWithValue(message);
  }
});

export const clearCart = createAsyncThunk<ApiCart, void, CartThunkConfig>(
  "cart/clearCart",
  async (_, { getState, rejectWithValue }) => {
    const token = getAccessToken(getState);
    if (!token) {
      return rejectWithValue("You must be signed in to clear your cart.");
    }

    try {
      const response = await fetch(apiUrl("/api/user/cart"), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(await readApiError(response));
      }
      return (await response.json()) as ApiCart;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to clear cart.";
      return rejectWithValue(message);
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCartState(state) {
      state.cart = null;
      state.selectedItemIds = [];
      state.status = "idle";
      state.error = null;
      state.mutationStatus = "idle";
      state.mutationError = null;
      state.updatingItemIds = [];
    },
    optimisticUpdateCartItemQuantity(
      state,
      action: { payload: { itemId: string; quantity: number } },
    ) {
      if (!state.cart) {
        return;
      }

      const item = state.cart.items.find((row) => row.id === action.payload.itemId);
      if (!item) {
        return;
      }

      const unitPrice = Number.parseFloat(item.unit_price);
      item.quantity = action.payload.quantity;
      item.line_subtotal = (unitPrice * action.payload.quantity).toFixed(2);
      item.is_available =
        item.is_available && action.payload.quantity <= item.max_quantity;
      reconcileCartTotals(state);
    },
    toggleCartItemSelected(state, action: { payload: string }) {
      const itemId = action.payload;
      const item = state.cart?.items.find((row) => row.id === itemId);
      if (!item?.is_available) {
        return;
      }

      if (state.selectedItemIds.includes(itemId)) {
        state.selectedItemIds = state.selectedItemIds.filter((id) => id !== itemId);
      } else {
        state.selectedItemIds = [...state.selectedItemIds, itemId];
      }
    },
    setAllAvailableCartItemsSelected(state, action: { payload: boolean }) {
      if (!state.cart) {
        return;
      }

      if (action.payload) {
        state.selectedItemIds = state.cart.items
          .filter((item) => item.is_available)
          .map((item) => item.id);
        return;
      }

      state.selectedItemIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        applyCartUpdate(state, action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load cart.";
      });

    builder
      .addCase(updateCartItem.pending, (state, action) => {
        addUpdatingItemId(state, action.meta.arg.itemId);
        state.mutationError = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        removeUpdatingItemId(state, action.meta.arg.itemId);
        applyCartUpdate(state, action.payload);
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        removeUpdatingItemId(state, action.meta.arg.itemId);
        state.mutationError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to update cart item.";
      });

    const mutationCases = [addCartItem, removeCartItem, clearCart] as const;

    for (const thunk of mutationCases) {
      builder
        .addCase(thunk.pending, (state) => {
          state.mutationStatus = "loading";
          state.mutationError = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.mutationStatus = "succeeded";
          applyCartUpdate(state, action.payload);
        })
        .addCase(thunk.rejected, (state, action) => {
          state.mutationStatus = "failed";
          state.mutationError =
            typeof action.payload === "string"
              ? action.payload
              : "Cart update failed.";
        });
    }

    builder.addCase(placeOrder.fulfilled, (state, action) => {
      if (!action.meta.arg.fromCart || !state.cart) {
        return;
      }

      const orderedIds = action.meta.arg.cartItemIds;
      if (orderedIds && orderedIds.length > 0) {
        const nextCart = pruneCartAfterOrder(state.cart, orderedIds);
        state.cart = nextCart;
        state.selectedItemIds = state.selectedItemIds.filter(
          (id) => !orderedIds.includes(id),
        );
        return;
      }

      state.cart = {
        ...state.cart,
        items: [],
        item_count: 0,
        subtotal: "0",
      };
      state.selectedItemIds = [];
    });
  },
});

export const {
  resetCartState,
  optimisticUpdateCartItemQuantity,
  toggleCartItemSelected,
  setAllAvailableCartItemsSelected,
} = cartSlice.actions;

export const selectCart = (state: RootState) => state.cart.cart;
export const selectCartItems = (state: RootState) => state.cart.cart?.items ?? [];
export const selectSelectedCartItemIds = (state: RootState) =>
  state.cart.selectedItemIds;
export const selectSelectedCartItems = (state: RootState): ApiCartLine[] => {
  const items = state.cart.cart?.items ?? [];
  const selected = new Set(state.cart.selectedItemIds);
  return items.filter((item) => selected.has(item.id));
};
export const selectCartItemCount = (state: RootState) =>
  state.cart.cart?.item_count ?? 0;
export const selectCartSubtotal = (state: RootState) => state.cart.cart?.subtotal ?? "0";
export const selectSelectedCartSubtotal = (state: RootState) =>
  selectedCartSubtotal(state.cart.cart?.items ?? [], state.cart.selectedItemIds);
export const selectSelectedCartItemCount = (state: RootState) =>
  selectedCartItemCount(state.cart.cart?.items ?? [], state.cart.selectedItemIds);
export const selectCartStatus = (state: RootState) => state.cart.status;
export const selectCartError = (state: RootState) => state.cart.error;
export const selectCartMutationStatus = (state: RootState) =>
  state.cart.mutationStatus;
export const selectCartMutationError = (state: RootState) =>
  state.cart.mutationError;
export const selectCartUpdatingItemIds = (state: RootState) =>
  state.cart.updatingItemIds;

export default cartSlice.reducer;
