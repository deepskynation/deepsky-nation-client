import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiUrl } from "@/lib/api-config";
import { readApiError } from "@/store/api-utils";
import type { AppDispatch, RootState } from "@/store";
import type {
  AdminSubscribersListResponse,
  AdminSubscribersQuery,
} from "@/types/admin-subscriber";

type AdminSubscribersThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
};

export type AdminSubscribersListStatus = "idle" | "loading" | "succeeded" | "failed";

export type AdminSubscribersState = {
  rows: AdminSubscribersListResponse["rows"];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  listStatus: AdminSubscribersListStatus;
  listError: string | null;
  listQuery: AdminSubscribersQuery;
};

const initialListQuery: AdminSubscribersQuery = {
  page: 1,
  page_size: 15,
};

const initialState: AdminSubscribersState = {
  rows: [],
  total: 0,
  page: 1,
  page_size: 15,
  total_pages: 0,
  has_next: false,
  has_previous: false,
  listStatus: "idle",
  listError: null,
  listQuery: initialListQuery,
};

function getAccessToken(getState: () => RootState): string | null {
  return getState().auth.accessToken;
}

function buildAdminSubscribersUrl(query: AdminSubscribersQuery): string {
  const params = new URLSearchParams();
  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }
  if (query.page_size !== undefined) {
    params.set("page_size", String(query.page_size));
  }
  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.created_from?.trim()) {
    params.set("created_from", query.created_from.trim());
  }
  if (query.created_to?.trim()) {
    params.set("created_to", query.created_to.trim());
  }
  const qs = params.toString();
  return apiUrl(`/api/admin/subscribers${qs ? `?${qs}` : ""}`);
}

export const fetchAdminSubscribersList = createAsyncThunk<
  { data: AdminSubscribersListResponse; query: AdminSubscribersQuery },
  AdminSubscribersQuery | undefined,
  AdminSubscribersThunkConfig
>("adminSubscribers/fetchList", async (query, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in.");
  }

  const state = getState().adminSubscribers;
  const mergedQuery: AdminSubscribersQuery = {
    ...state.listQuery,
    ...query,
  };

  const response = await fetch(buildAdminSubscribersUrl(mergedQuery), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return rejectWithValue(await readApiError(response));
  }

  const data = (await response.json()) as AdminSubscribersListResponse;
  return { data, query: mergedQuery };
});

const adminSubscriberSlice = createSlice({
  name: "adminSubscribers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminSubscribersList.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchAdminSubscribersList.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.rows = action.payload.data.rows;
        state.total = action.payload.data.total;
        state.page = action.payload.data.page;
        state.page_size = action.payload.data.page_size;
        state.total_pages = action.payload.data.total_pages;
        state.has_next = action.payload.data.has_next;
        state.has_previous = action.payload.data.has_previous;
        state.listQuery = action.payload.query;
      })
      .addCase(fetchAdminSubscribersList.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload ?? "Failed to load subscribers.";
      });
  },
});

export const selectAdminSubscribers = (state: RootState) => state.adminSubscribers.rows;
export const selectAdminSubscribersPagination = (state: RootState) => ({
  total: state.adminSubscribers.total,
  page: state.adminSubscribers.page,
  page_size: state.adminSubscribers.page_size,
  total_pages: state.adminSubscribers.total_pages,
  has_next: state.adminSubscribers.has_next,
  has_previous: state.adminSubscribers.has_previous,
});
export const selectAdminSubscribersListQuery = (state: RootState) =>
  state.adminSubscribers.listQuery;
export const selectAdminSubscribersListStatus = (state: RootState) =>
  state.adminSubscribers.listStatus;
export const selectAdminSubscribersListError = (state: RootState) =>
  state.adminSubscribers.listError;

export default adminSubscriberSlice.reducer;
