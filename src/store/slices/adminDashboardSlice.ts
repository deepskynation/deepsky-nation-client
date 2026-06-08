import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiUrl } from "@/lib/api-config";
import { readApiError } from "@/store/api-utils";
import type { AppDispatch, RootState } from "@/store";
import type {
  DashboardDateQuery,
  DashboardStatistics,
  FsnAnalysis,
  SalesAnalytics,
} from "@/types/admin-dashboard";

type DashboardThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
};

export type DashboardFetchStatus = "idle" | "loading" | "succeeded" | "failed";

export type AdminDashboardState = {
  statistics: DashboardStatistics | null;
  statisticsStatus: DashboardFetchStatus;
  statisticsError: string | null;
  salesAnalytics: SalesAnalytics | null;
  salesStatus: DashboardFetchStatus;
  salesError: string | null;
  fsnAnalysis: FsnAnalysis | null;
  fsnStatus: DashboardFetchStatus;
  fsnError: string | null;
  dateQuery: DashboardDateQuery;
  salesFetchedForQuery: string | null;
  fsnFetchedForQuery: string | null;
};

const initialState: AdminDashboardState = {
  statistics: null,
  statisticsStatus: "idle",
  statisticsError: null,
  salesAnalytics: null,
  salesStatus: "idle",
  salesError: null,
  fsnAnalysis: null,
  fsnStatus: "idle",
  fsnError: null,
  dateQuery: {},
  salesFetchedForQuery: null,
  fsnFetchedForQuery: null,
};

function getAccessToken(getState: () => RootState): string | null {
  return getState().auth.accessToken;
}

function serializeDateQuery(query: DashboardDateQuery): string {
  return JSON.stringify({ from: query.from ?? null, to: query.to ?? null });
}

function buildDashboardUrl(path: string, query: DashboardDateQuery): string {
  const params = new URLSearchParams();
  if (query.from) {
    params.set("from", query.from);
  }
  if (query.to) {
    params.set("to", query.to);
  }
  const qs = params.toString();
  return apiUrl(`/api/admin/dashboard/${path}${qs ? `?${qs}` : ""}`);
}

export const fetchDashboardStatistics = createAsyncThunk<
  DashboardStatistics,
  DashboardDateQuery | void,
  DashboardThunkConfig
>("adminDashboard/fetchStatistics", async (queryArg, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  const query = queryArg ?? getState().adminDashboard.dateQuery;
  const response = await fetch(buildDashboardUrl("statistics", query), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return rejectWithValue(await readApiError(response));
  }

  return (await response.json()) as DashboardStatistics;
});

export const fetchSalesAnalytics = createAsyncThunk<
  SalesAnalytics,
  DashboardDateQuery | void,
  DashboardThunkConfig
>("adminDashboard/fetchSalesAnalytics", async (queryArg, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  const query = queryArg ?? getState().adminDashboard.dateQuery;
  const response = await fetch(buildDashboardUrl("sales-analytics", query), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return rejectWithValue(await readApiError(response));
  }

  return (await response.json()) as SalesAnalytics;
});

export const fetchFsnAnalysis = createAsyncThunk<
  FsnAnalysis,
  DashboardDateQuery | void,
  DashboardThunkConfig
>("adminDashboard/fetchFsnAnalysis", async (queryArg, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  const query = queryArg ?? getState().adminDashboard.dateQuery;
  const response = await fetch(buildDashboardUrl("fsn-analysis", query), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return rejectWithValue(await readApiError(response));
  }

  return (await response.json()) as FsnAnalysis;
});

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    setDashboardDateQuery(state, action: { payload: DashboardDateQuery }) {
      state.dateQuery = action.payload;
      state.salesFetchedForQuery = null;
      state.fsnFetchedForQuery = null;
    },
    invalidateDashboardAnalytics(state) {
      state.salesFetchedForQuery = null;
      state.fsnFetchedForQuery = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStatistics.pending, (state) => {
        state.statisticsStatus = "loading";
        state.statisticsError = null;
      })
      .addCase(fetchDashboardStatistics.fulfilled, (state, action) => {
        state.statisticsStatus = "succeeded";
        state.statistics = action.payload;
      })
      .addCase(fetchDashboardStatistics.rejected, (state, action) => {
        state.statisticsStatus = "failed";
        state.statisticsError = action.payload ?? "Failed to load dashboard statistics.";
      })
      .addCase(fetchSalesAnalytics.pending, (state) => {
        state.salesStatus = "loading";
        state.salesError = null;
      })
      .addCase(fetchSalesAnalytics.fulfilled, (state, action) => {
        state.salesStatus = "succeeded";
        state.salesAnalytics = action.payload;
        state.salesFetchedForQuery = serializeDateQuery(state.dateQuery);
      })
      .addCase(fetchSalesAnalytics.rejected, (state, action) => {
        state.salesStatus = "failed";
        state.salesError = action.payload ?? "Failed to load sales analytics.";
      })
      .addCase(fetchFsnAnalysis.pending, (state) => {
        state.fsnStatus = "loading";
        state.fsnError = null;
      })
      .addCase(fetchFsnAnalysis.fulfilled, (state, action) => {
        state.fsnStatus = "succeeded";
        state.fsnAnalysis = action.payload;
        state.fsnFetchedForQuery = serializeDateQuery(state.dateQuery);
      })
      .addCase(fetchFsnAnalysis.rejected, (state, action) => {
        state.fsnStatus = "failed";
        state.fsnError = action.payload ?? "Failed to load FSN analysis.";
      });
  },
});

export const { setDashboardDateQuery, invalidateDashboardAnalytics } =
  adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;

export const selectDashboardStatistics = (state: RootState) =>
  state.adminDashboard.statistics;
export const selectDashboardStatisticsStatus = (state: RootState) =>
  state.adminDashboard.statisticsStatus;
export const selectDashboardStatisticsError = (state: RootState) =>
  state.adminDashboard.statisticsError;
export const selectSalesAnalytics = (state: RootState) =>
  state.adminDashboard.salesAnalytics;
export const selectSalesAnalyticsStatus = (state: RootState) =>
  state.adminDashboard.salesStatus;
export const selectSalesAnalyticsError = (state: RootState) =>
  state.adminDashboard.salesError;
export const selectFsnAnalysis = (state: RootState) => state.adminDashboard.fsnAnalysis;
export const selectFsnAnalysisStatus = (state: RootState) => state.adminDashboard.fsnStatus;
export const selectFsnAnalysisError = (state: RootState) => state.adminDashboard.fsnError;
export const selectDashboardDateQuery = (state: RootState) =>
  state.adminDashboard.dateQuery;
export const selectSalesFetchedForQuery = (state: RootState) =>
  state.adminDashboard.salesFetchedForQuery;
export const selectFsnFetchedForQuery = (state: RootState) =>
  state.adminDashboard.fsnFetchedForQuery;
