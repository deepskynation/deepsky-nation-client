import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { apiUrl } from "@/lib/api-config";
import { readApiError } from "@/store/api-utils";
import type { AppDispatch, RootState } from "@/store";
import type {
  AdminSubscriberTab,
  AdminSubscribersListResponse,
  AdminSubscribersQuery,
  AdminUnsubscribersListResponse,
  AdminUnsubscribersQuery,
} from "@/types/admin-subscriber";

type AdminSubscribersThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
};

export type AdminSubscribersListStatus = "idle" | "loading" | "succeeded" | "failed";

type PaginatedListState<TQuery> = {
  rows: AdminSubscribersListResponse["rows"] | AdminUnsubscribersListResponse["rows"];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  listStatus: AdminSubscribersListStatus;
  listError: string | null;
  listQuery: TQuery;
};

export type AdminSubscribersState = {
  activeTab: AdminSubscriberTab;
  subscribers: PaginatedListState<AdminSubscribersQuery> & {
    rows: AdminSubscribersListResponse["rows"];
  };
  unsubscribers: PaginatedListState<AdminUnsubscribersQuery> & {
    rows: AdminUnsubscribersListResponse["rows"];
  };
};

const initialSubscribersQuery: AdminSubscribersQuery = {
  page: 1,
  page_size: 15,
};

const initialUnsubscribersQuery: AdminUnsubscribersQuery = {
  page: 1,
  page_size: 15,
};

const initialPaginatedState = {
  rows: [],
  total: 0,
  page: 1,
  page_size: 15,
  total_pages: 0,
  has_next: false,
  has_previous: false,
  listStatus: "idle" as AdminSubscribersListStatus,
  listError: null,
};

const initialState: AdminSubscribersState = {
  activeTab: "subscribers",
  subscribers: {
    ...initialPaginatedState,
    rows: [],
    listQuery: initialSubscribersQuery,
  },
  unsubscribers: {
    ...initialPaginatedState,
    rows: [],
    listQuery: initialUnsubscribersQuery,
  },
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

function buildAdminUnsubscribersUrl(query: AdminUnsubscribersQuery): string {
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
  if (query.unsubscribed_from?.trim()) {
    params.set("unsubscribed_from", query.unsubscribed_from.trim());
  }
  if (query.unsubscribed_to?.trim()) {
    params.set("unsubscribed_to", query.unsubscribed_to.trim());
  }
  const qs = params.toString();
  return apiUrl(`/api/admin/unsubscribers${qs ? `?${qs}` : ""}`);
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

  const state = getState().adminSubscribers.subscribers;
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

export const fetchAdminUnsubscribersList = createAsyncThunk<
  { data: AdminUnsubscribersListResponse; query: AdminUnsubscribersQuery },
  AdminUnsubscribersQuery | undefined,
  AdminSubscribersThunkConfig
>("adminSubscribers/fetchUnsubscribersList", async (query, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in.");
  }

  const state = getState().adminSubscribers.unsubscribers;
  const mergedQuery: AdminUnsubscribersQuery = {
    ...state.listQuery,
    ...query,
  };

  const response = await fetch(buildAdminUnsubscribersUrl(mergedQuery), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return rejectWithValue(await readApiError(response));
  }

  const data = (await response.json()) as AdminUnsubscribersListResponse;
  return { data, query: mergedQuery };
});

const adminSubscriberSlice = createSlice({
  name: "adminSubscribers",
  initialState,
  reducers: {
    setAdminSubscriberTab(state, action: PayloadAction<AdminSubscriberTab>) {
      state.activeTab = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminSubscribersList.pending, (state) => {
        state.subscribers.listStatus = "loading";
        state.subscribers.listError = null;
      })
      .addCase(fetchAdminSubscribersList.fulfilled, (state, action) => {
        state.subscribers.listStatus = "succeeded";
        state.subscribers.rows = action.payload.data.rows;
        state.subscribers.total = action.payload.data.total;
        state.subscribers.page = action.payload.data.page;
        state.subscribers.page_size = action.payload.data.page_size;
        state.subscribers.total_pages = action.payload.data.total_pages;
        state.subscribers.has_next = action.payload.data.has_next;
        state.subscribers.has_previous = action.payload.data.has_previous;
        state.subscribers.listQuery = action.payload.query;
      })
      .addCase(fetchAdminSubscribersList.rejected, (state, action) => {
        state.subscribers.listStatus = "failed";
        state.subscribers.listError =
          action.payload ?? "Failed to load subscribers.";
      })
      .addCase(fetchAdminUnsubscribersList.pending, (state) => {
        state.unsubscribers.listStatus = "loading";
        state.unsubscribers.listError = null;
      })
      .addCase(fetchAdminUnsubscribersList.fulfilled, (state, action) => {
        state.unsubscribers.listStatus = "succeeded";
        state.unsubscribers.rows = action.payload.data.rows;
        state.unsubscribers.total = action.payload.data.total;
        state.unsubscribers.page = action.payload.data.page;
        state.unsubscribers.page_size = action.payload.data.page_size;
        state.unsubscribers.total_pages = action.payload.data.total_pages;
        state.unsubscribers.has_next = action.payload.data.has_next;
        state.unsubscribers.has_previous = action.payload.data.has_previous;
        state.unsubscribers.listQuery = action.payload.query;
      })
      .addCase(fetchAdminUnsubscribersList.rejected, (state, action) => {
        state.unsubscribers.listStatus = "failed";
        state.unsubscribers.listError =
          action.payload ?? "Failed to load unsubscribers.";
      });
  },
});

export const { setAdminSubscriberTab } = adminSubscriberSlice.actions;

export const selectAdminSubscriberTab = (state: RootState) =>
  state.adminSubscribers.activeTab;

export const selectAdminSubscribers = (state: RootState) =>
  state.adminSubscribers.subscribers.rows;
export const selectAdminSubscribersPagination = (state: RootState) => ({
  total: state.adminSubscribers.subscribers.total,
  page: state.adminSubscribers.subscribers.page,
  page_size: state.adminSubscribers.subscribers.page_size,
  total_pages: state.adminSubscribers.subscribers.total_pages,
  has_next: state.adminSubscribers.subscribers.has_next,
  has_previous: state.adminSubscribers.subscribers.has_previous,
});
export const selectAdminSubscribersListQuery = (state: RootState) =>
  state.adminSubscribers.subscribers.listQuery;
export const selectAdminSubscribersListStatus = (state: RootState) =>
  state.adminSubscribers.subscribers.listStatus;
export const selectAdminSubscribersListError = (state: RootState) =>
  state.adminSubscribers.subscribers.listError;

export const selectAdminUnsubscribers = (state: RootState) =>
  state.adminSubscribers.unsubscribers.rows;
export const selectAdminUnsubscribersPagination = (state: RootState) => ({
  total: state.adminSubscribers.unsubscribers.total,
  page: state.adminSubscribers.unsubscribers.page,
  page_size: state.adminSubscribers.unsubscribers.page_size,
  total_pages: state.adminSubscribers.unsubscribers.total_pages,
  has_next: state.adminSubscribers.unsubscribers.has_next,
  has_previous: state.adminSubscribers.unsubscribers.has_previous,
});
export const selectAdminUnsubscribersListQuery = (state: RootState) =>
  state.adminSubscribers.unsubscribers.listQuery;
export const selectAdminUnsubscribersListStatus = (state: RootState) =>
  state.adminSubscribers.unsubscribers.listStatus;
export const selectAdminUnsubscribersListError = (state: RootState) =>
  state.adminSubscribers.unsubscribers.listError;

export default adminSubscriberSlice.reducer;
