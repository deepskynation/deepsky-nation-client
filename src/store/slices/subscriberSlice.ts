import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiUrl } from "@/lib/api-config";
import { readApiError } from "@/store/api-utils";
import type { RootState } from "@/store";
import type {
  SubscriberSubscribeResponse,
  SubscriberUnsubscribeResponse,
} from "@/types/subscriber";

type SubscribeThunkConfig = {
  rejectValue: string;
};

export type SubscriberSubscribeStatus = "idle" | "loading" | "succeeded" | "failed";
export type SubscriberUnsubscribeStatus = "idle" | "loading" | "succeeded" | "failed";

export type SubscriberState = {
  subscribeStatus: SubscriberSubscribeStatus;
  subscribeError: string | null;
  unsubscribeStatus: SubscriberUnsubscribeStatus;
  unsubscribeError: string | null;
  unsubscribeMessage: string | null;
};

const initialState: SubscriberState = {
  subscribeStatus: "idle",
  subscribeError: null,
  unsubscribeStatus: "idle",
  unsubscribeError: null,
  unsubscribeMessage: null,
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

export const unsubscribeFromEmail = createAsyncThunk<
  SubscriberUnsubscribeResponse,
  string,
  SubscribeThunkConfig
>("subscriber/unsubscribe", async (token, { rejectWithValue }) => {
  const trimmed = token.trim();
  if (!trimmed) {
    return rejectWithValue("This unsubscribe link is invalid.");
  }

  const response = await fetch(
    apiUrl(`/api/subscribers/unsubscribe?token=${encodeURIComponent(trimmed)}`),
  );

  if (!response.ok) {
    return rejectWithValue(await readApiError(response));
  }

  return (await response.json()) as SubscriberUnsubscribeResponse;
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
    resetUnsubscribeState(state) {
      state.unsubscribeStatus = "idle";
      state.unsubscribeError = null;
      state.unsubscribeMessage = null;
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
      })
      .addCase(unsubscribeFromEmail.pending, (state) => {
        state.unsubscribeStatus = "loading";
        state.unsubscribeError = null;
        state.unsubscribeMessage = null;
      })
      .addCase(unsubscribeFromEmail.fulfilled, (state, action) => {
        state.unsubscribeStatus = "succeeded";
        state.unsubscribeError = null;
        state.unsubscribeMessage =
          action.payload.message ?? "You've been unsubscribed.";
      })
      .addCase(unsubscribeFromEmail.rejected, (state, action) => {
        state.unsubscribeStatus = "failed";
        state.unsubscribeError =
          action.payload ?? "Could not unsubscribe. Please try again.";
        state.unsubscribeMessage = null;
      });
  },
});

export const { clearSubscribeError, resetSubscribeState, resetUnsubscribeState } =
  subscriberSlice.actions;

export const selectSubscribeStatus = (state: RootState) =>
  state.subscriber.subscribeStatus;
export const selectSubscribeError = (state: RootState) =>
  state.subscriber.subscribeError;
export const selectIsSubscribing = (state: RootState) =>
  state.subscriber.subscribeStatus === "loading";
export const selectUnsubscribeStatus = (state: RootState) =>
  state.subscriber.unsubscribeStatus;
export const selectUnsubscribeError = (state: RootState) =>
  state.subscriber.unsubscribeError;
export const selectUnsubscribeMessage = (state: RootState) =>
  state.subscriber.unsubscribeMessage;

export default subscriberSlice.reducer;
