import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiUrl } from "@/lib/api-config";
import { readApiError } from "@/store/api-utils";
import type { RootState } from "@/store";
import type { RecentPurchaseActivityResponse } from "@/types/purchase-activity";

type PurchaseActivityThunkConfig = {
  state: RootState;
  rejectValue: string;
};

export type FetchRecentPurchasesArg = {
  since?: string | null;
  limit?: number;
};

export type PurchaseActivityFetchStatus = "idle" | "loading" | "succeeded" | "failed";

export type PurchaseActivityState = {
  fetchStatus: PurchaseActivityFetchStatus;
  fetchError: string | null;
  lastFetchedAt: string | null;
};

const initialState: PurchaseActivityState = {
  fetchStatus: "idle",
  fetchError: null,
  lastFetchedAt: null,
};

function getAccessToken(getState: () => RootState): string | null {
  return getState().auth.accessToken;
}

export const fetchRecentPurchases = createAsyncThunk<
  RecentPurchaseActivityResponse,
  FetchRecentPurchasesArg | void,
  PurchaseActivityThunkConfig
>(
  "purchaseActivity/fetchRecentPurchases",
  async (arg, { getState, rejectWithValue }) => {
    const options = arg ?? {};
    const params = new URLSearchParams();

    if (options.since) {
      params.set("since", options.since);
    }
    if (options.limit) {
      params.set("limit", String(options.limit));
    }

    const query = params.toString();
    const url = apiUrl(`/api/public/recent-purchases${query ? `?${query}` : ""}`);
    const headers: HeadersInit = {};
    const token = getAccessToken(getState);

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers, cache: "no-store" });
    if (!response.ok) {
      return rejectWithValue(await readApiError(response));
    }

    return (await response.json()) as RecentPurchaseActivityResponse;
  },
);

const purchaseActivitySlice = createSlice({
  name: "purchaseActivity",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentPurchases.pending, (state) => {
        state.fetchStatus = "loading";
        state.fetchError = null;
      })
      .addCase(fetchRecentPurchases.fulfilled, (state) => {
        state.fetchStatus = "succeeded";
        state.fetchError = null;
        state.lastFetchedAt = new Date().toISOString();
      })
      .addCase(fetchRecentPurchases.rejected, (state, action) => {
        state.fetchStatus = "failed";
        state.fetchError =
          action.payload ?? "Failed to load purchase activity.";
      });
  },
});

export const selectPurchaseActivityFetchStatus = (state: RootState) =>
  state.purchaseActivity.fetchStatus;
export const selectPurchaseActivityFetchError = (state: RootState) =>
  state.purchaseActivity.fetchError;
export const selectPurchaseActivityLastFetchedAt = (state: RootState) =>
  state.purchaseActivity.lastFetchedAt;

export default purchaseActivitySlice.reducer;
