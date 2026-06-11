import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiUrl } from "@/lib/api-config";
import { readApiError } from "@/store/api-utils";
import type { RootState } from "@/store";
import type { SubscriberSubscribeResponse } from "@/types/subscriber";

type SubscribeThunkConfig = {
  rejectValue: string;
};

export type SubscriberSubscribeStatus = "idle" | "loading" | "succeeded" | "failed";

export type SubscriberState = {
  subscribeStatus: SubscriberSubscribeStatus;
  subscribeError: string | null;
};

const initialState: SubscriberState = {
  subscribeStatus: "idle",
  subscribeError: null,
};

export const subscribeToEmail = createAsyncThunk<
  SubscriberSubscribeResponse,
  string,
  SubscribeThunkConfig
>("subscriber/subscribe", async (email, { rejectWithValue }) => {
  const trimmed = email.trim();
  if (!trimmed) {
    return rejectWithValue("Enter your email address.");
  }

  const response = await fetch(apiUrl("/api/subscribers"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: trimmed }),
  });

  if (!response.ok) {
    return rejectWithValue(await readApiError(response));
  }

  return (await response.json()) as SubscriberSubscribeResponse;
});

const subscriberSlice = createSlice({
  name: "subscriber",
  initialState,
  reducers: {
    clearSubscribeError(state) {
      state.subscribeError = null;
      if (state.subscribeStatus === "failed") {
        state.subscribeStatus = "idle";
      }
    },
    resetSubscribeState(state) {
      state.subscribeStatus = "idle";
      state.subscribeError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(subscribeToEmail.pending, (state) => {
        state.subscribeStatus = "loading";
        state.subscribeError = null;
      })
      .addCase(subscribeToEmail.fulfilled, (state) => {
        state.subscribeStatus = "succeeded";
        state.subscribeError = null;
      })
      .addCase(subscribeToEmail.rejected, (state, action) => {
        state.subscribeStatus = "failed";
        state.subscribeError =
          action.payload ?? "Could not subscribe. Please try again.";
      });
  },
});

export const { clearSubscribeError, resetSubscribeState } = subscriberSlice.actions;

export const selectSubscribeStatus = (state: RootState) =>
  state.subscriber.subscribeStatus;
export const selectSubscribeError = (state: RootState) =>
  state.subscriber.subscribeError;
export const selectIsSubscribing = (state: RootState) =>
  state.subscriber.subscribeStatus === "loading";

export default subscriberSlice.reducer;
