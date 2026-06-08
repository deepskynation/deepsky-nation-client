import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiUrl } from "@/lib/api-config";
import { readApiError } from "@/store/api-utils";
import type { AppDispatch, RootState } from "@/store";
import type {
  AdminUserDetail,
  AdminUsersListResponse,
  AdminUsersQuery,
  CreateAdminAccountPayload,
  CreateAdminAccountResponse,
} from "@/types/admin-user";

type AdminUsersThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
};

export type AdminUsersListStatus = "idle" | "loading" | "succeeded" | "failed";

export type AdminUsersState = {
  rows: AdminUsersListResponse["users"];
  statistics: AdminUsersListResponse["statistics"] | null;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  listStatus: AdminUsersListStatus;
  listError: string | null;
  listQuery: AdminUsersQuery;
  detailUser: AdminUserDetail | null;
  detailStatus: AdminUsersListStatus;
  detailError: string | null;
  createStatus: AdminUsersListStatus;
  createError: string | null;
};

const initialListQuery: AdminUsersQuery = {
  page: 1,
  page_size: 15,
};

const initialState: AdminUsersState = {
  rows: [],
  statistics: null,
  total: 0,
  page: 1,
  page_size: 15,
  total_pages: 0,
  has_next: false,
  has_previous: false,
  listStatus: "idle",
  listError: null,
  listQuery: initialListQuery,
  detailUser: null,
  detailStatus: "idle",
  detailError: null,
  createStatus: "idle",
  createError: null,
};

function getAccessToken(getState: () => RootState): string | null {
  return getState().auth.accessToken;
}

function buildAdminUsersUrl(query: AdminUsersQuery): string {
  const params = new URLSearchParams();
  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }
  if (query.page_size !== undefined) {
    params.set("page_size", String(query.page_size));
  }
  if (query.status) {
    params.set("status", query.status);
  }
  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.role) {
    params.set("role", query.role);
  }
  if (query.created_from?.trim()) {
    params.set("created_from", query.created_from.trim());
  }
  if (query.created_to?.trim()) {
    params.set("created_to", query.created_to.trim());
  }
  const qs = params.toString();
  return apiUrl(`/api/admin/users${qs ? `?${qs}` : ""}`);
}

export const fetchAdminUsersList = createAsyncThunk<
  { data: AdminUsersListResponse; query: AdminUsersQuery },
  AdminUsersQuery | undefined,
  AdminUsersThunkConfig
>("adminUsers/fetchList", async (query, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  const mergedQuery = { ...getState().adminUsers.listQuery, ...query };

  try {
    const response = await fetch(buildAdminUsersUrl(mergedQuery), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const data = (await response.json()) as AdminUsersListResponse;
    return { data, query: mergedQuery };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load users.";
    return rejectWithValue(message);
  }
});

export const fetchAdminUserDetail = createAsyncThunk<
  AdminUserDetail,
  string,
  AdminUsersThunkConfig
>("adminUsers/fetchDetail", async (userId, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  try {
    const response = await fetch(apiUrl(`/api/admin/users/${userId}`), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    return (await response.json()) as AdminUserDetail;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load user details.";
    return rejectWithValue(message);
  }
});

export const createAdminAccount = createAsyncThunk<
  CreateAdminAccountResponse,
  CreateAdminAccountPayload,
  AdminUsersThunkConfig
>("adminUsers/createAccount", async (payload, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  try {
    const response = await fetch(apiUrl("/api/auth/admin/users"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: payload.username.trim(),
        email: payload.email.trim(),
        password: payload.password,
        role: payload.role,
      }),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    return (await response.json()) as CreateAdminAccountResponse;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create account.";
    return rejectWithValue(message);
  }
});

const adminUserSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {
    setAdminUsersListQuery(state, action: { payload: AdminUsersQuery }) {
      state.listQuery = action.payload;
    },
    clearAdminUserDetail(state) {
      state.detailUser = null;
      state.detailStatus = "idle";
      state.detailError = null;
    },
    resetCreateAdminAccount(state) {
      state.createStatus = "idle";
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsersList.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchAdminUsersList.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.listQuery = action.payload.query;
        state.rows = action.payload.data.users;
        state.statistics = action.payload.data.statistics;
        state.total = action.payload.data.total;
        state.page = action.payload.data.page;
        state.page_size = action.payload.data.page_size;
        state.total_pages = action.payload.data.total_pages;
        state.has_next = action.payload.data.has_next;
        state.has_previous = action.payload.data.has_previous;
      })
      .addCase(fetchAdminUsersList.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load users.";
      })
      .addCase(fetchAdminUserDetail.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchAdminUserDetail.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.detailUser = action.payload;
      })
      .addCase(fetchAdminUserDetail.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load user details.";
      })
      .addCase(createAdminAccount.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createAdminAccount.fulfilled, (state) => {
        state.createStatus = "succeeded";
        state.createError = null;
      })
      .addCase(createAdminAccount.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to create account.";
      });
  },
});

export const { setAdminUsersListQuery, clearAdminUserDetail, resetCreateAdminAccount } =
  adminUserSlice.actions;

export const selectAdminUsers = (state: RootState) => state.adminUsers.rows;
export const selectAdminUserStatistics = (state: RootState) =>
  state.adminUsers.statistics;
export const selectAdminUsersListStatus = (state: RootState) =>
  state.adminUsers.listStatus;
export const selectAdminUsersListError = (state: RootState) =>
  state.adminUsers.listError;
export const selectAdminUsersListQuery = (state: RootState) =>
  state.adminUsers.listQuery;
export const selectAdminUsersPagination = (state: RootState) => ({
  total: state.adminUsers.total,
  page: state.adminUsers.page,
  page_size: state.adminUsers.page_size,
  total_pages: state.adminUsers.total_pages,
  has_next: state.adminUsers.has_next,
  has_previous: state.adminUsers.has_previous,
});
export const selectAdminUserDetail = (state: RootState) =>
  state.adminUsers.detailUser;
export const selectAdminUserDetailStatus = (state: RootState) =>
  state.adminUsers.detailStatus;
export const selectAdminUserDetailError = (state: RootState) =>
  state.adminUsers.detailError;
export const selectCreateAdminAccountStatus = (state: RootState) =>
  state.adminUsers.createStatus;
export const selectCreateAdminAccountError = (state: RootState) =>
  state.adminUsers.createError;

export default adminUserSlice.reducer;
