import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiUrl } from "@/lib/api-config";
import { readApiError } from "@/store/api-utils";
import type {
  ShippingFeeResponse,
  ShopSettings,
  UpdateShopSettingsPayload,
} from "@/types/settings";

type SettingsRootState = {
  settings: SettingsState;
  auth: { accessToken: string | null };
};

type SettingsState = {
  shippingFee: number | null;
  shippingFeeStatus: "idle" | "loading" | "succeeded" | "failed";
  shippingFeeError: string | null;
  shopSettings: ShopSettings | null;
  shopSettingsStatus: "idle" | "loading" | "succeeded" | "failed";
  shopSettingsError: string | null;
  updateShopSettingsStatus: "idle" | "loading" | "succeeded" | "failed";
  updateShopSettingsError: string | null;
};

const initialState: SettingsState = {
  shippingFee: null,
  shippingFeeStatus: "idle",
  shippingFeeError: null,
  shopSettings: null,
  shopSettingsStatus: "idle",
  shopSettingsError: null,
  updateShopSettingsStatus: "idle",
  updateShopSettingsError: null,
};

function getAccessToken(state: SettingsRootState): string | null {
  return state.auth.accessToken;
}

function parseFee(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export const fetchShippingFee = createAsyncThunk<
  number,
  void,
  { state: SettingsRootState; rejectValue: string }
>("settings/fetchShippingFee", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(apiUrl("/api/settings/shipping-fee"));
    if (!response.ok) {
      throw new Error(await readApiError(response));
    }
    const body = (await response.json()) as ShippingFeeResponse;
    return parseFee(body.shipping_fee);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load shipping fee.";
    return rejectWithValue(message);
  }
});

export const fetchShopSettings = createAsyncThunk<
  ShopSettings,
  void,
  { state: SettingsRootState; rejectValue: string }
>("settings/fetchShopSettings", async (_, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState());
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  try {
    const response = await fetch(apiUrl("/api/admin/settings"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(await readApiError(response));
    }
    return (await response.json()) as ShopSettings;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load shop settings.";
    return rejectWithValue(message);
  }
});

export const updateShopSettings = createAsyncThunk<
  ShopSettings,
  UpdateShopSettingsPayload,
  { state: SettingsRootState; rejectValue: string }
>("settings/updateShopSettings", async (payload, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState());
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  try {
    const response = await fetch(apiUrl("/api/admin/settings"), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(await readApiError(response));
    }
    return (await response.json()) as ShopSettings;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update shop settings.";
    return rejectWithValue(message);
  }
});

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    resetUpdateShopSettings(state) {
      state.updateShopSettingsStatus = "idle";
      state.updateShopSettingsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShippingFee.pending, (state) => {
        state.shippingFeeStatus = "loading";
        state.shippingFeeError = null;
      })
      .addCase(fetchShippingFee.fulfilled, (state, action) => {
        state.shippingFeeStatus = "succeeded";
        state.shippingFee = action.payload;
      })
      .addCase(fetchShippingFee.rejected, (state, action) => {
        state.shippingFeeStatus = "failed";
        state.shippingFeeError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load shipping fee.";
      })
      .addCase(fetchShopSettings.pending, (state) => {
        state.shopSettingsStatus = "loading";
        state.shopSettingsError = null;
      })
      .addCase(fetchShopSettings.fulfilled, (state, action) => {
        state.shopSettingsStatus = "succeeded";
        state.shopSettings = action.payload;
        state.shippingFee = parseFee(action.payload.default_shipping_fee);
      })
      .addCase(fetchShopSettings.rejected, (state, action) => {
        state.shopSettingsStatus = "failed";
        state.shopSettingsError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load shop settings.";
      })
      .addCase(updateShopSettings.pending, (state) => {
        state.updateShopSettingsStatus = "loading";
        state.updateShopSettingsError = null;
      })
      .addCase(updateShopSettings.fulfilled, (state, action) => {
        state.updateShopSettingsStatus = "succeeded";
        state.shopSettings = action.payload;
        state.shippingFee = parseFee(action.payload.default_shipping_fee);
      })
      .addCase(updateShopSettings.rejected, (state, action) => {
        state.updateShopSettingsStatus = "failed";
        state.updateShopSettingsError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to update shop settings.";
      });
  },
});

export const { resetUpdateShopSettings } = settingsSlice.actions;

export const selectShippingFee = (state: SettingsRootState) => state.settings.shippingFee;
export const selectShippingFeeStatus = (state: SettingsRootState) =>
  state.settings.shippingFeeStatus;
export const selectShopSettings = (state: SettingsRootState) => state.settings.shopSettings;
export const selectShopSettingsStatus = (state: SettingsRootState) =>
  state.settings.shopSettingsStatus;
export const selectShopSettingsError = (state: SettingsRootState) =>
  state.settings.shopSettingsError;
export const selectUpdateShopSettingsStatus = (state: SettingsRootState) =>
  state.settings.updateShopSettingsStatus;
export const selectUpdateShopSettingsError = (state: SettingsRootState) =>
  state.settings.updateShopSettingsError;

export default settingsSlice.reducer;
