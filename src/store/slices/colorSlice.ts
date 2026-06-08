import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiUrl } from "@/lib/api-config";
import { readApiError } from "@/store/api-utils";
import type { AppDispatch, RootState } from "@/store";
import type {
  CreateColorPayload,
  UpdateColorPayload,
} from "@/types/catalog";
import type { ApiProductColor } from "@/types/product";
import type { PaginatedResponse } from "@/types/pagination";

type CatalogThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
};

export type CatalogMutationStatus = "idle" | "loading" | "succeeded" | "failed";

export type ColorState = {
  items: ApiProductColor[];
  listStatus: CatalogMutationStatus;
  listError: string | null;
  createStatus: CatalogMutationStatus;
  createError: string | null;
  updateStatus: CatalogMutationStatus;
  updateError: string | null;
  deleteStatus: CatalogMutationStatus;
  deleteError: string | null;
};

const initialState: ColorState = {
  items: [],
  listStatus: "idle",
  listError: null,
  createStatus: "idle",
  createError: null,
  updateStatus: "idle",
  updateError: null,
  deleteStatus: "idle",
  deleteError: null,
};

function getAccessToken(getState: () => RootState): string | null {
  return getState().auth.accessToken;
}

export const fetchColors = createAsyncThunk<
  ApiProductColor[],
  void,
  CatalogThunkConfig
>("colors/fetch", async (_, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  try {
    const response = await fetch(apiUrl("/api/colors?page=1&page_size=100"), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const data = (await response.json()) as PaginatedResponse<ApiProductColor>;
    return data.rows;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load colors.";
    return rejectWithValue(message);
  }
});

export const createColor = createAsyncThunk<
  ApiProductColor,
  CreateColorPayload,
  CatalogThunkConfig
>("colors/create", async (payload, { getState, rejectWithValue, dispatch }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  const body: CreateColorPayload = {
    color_name: payload.color_name.trim(),
  };
  if (payload.hex_code?.trim()) {
    body.hex_code = payload.hex_code.trim();
  }

  try {
    const response = await fetch(apiUrl("/api/admin/colors"), {
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

    const color = (await response.json()) as ApiProductColor;
    void dispatch(fetchColors());
    return color;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create color.";
    return rejectWithValue(message);
  }
});

export const updateColor = createAsyncThunk<
  ApiProductColor,
  { colorId: string; payload: UpdateColorPayload },
  CatalogThunkConfig
>("colors/update", async ({ colorId, payload }, { getState, rejectWithValue, dispatch }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  const body: UpdateColorPayload = {};
  if (payload.color_name !== undefined) {
    body.color_name = payload.color_name.trim();
  }
  if (payload.hex_code !== undefined) {
    body.hex_code = payload.hex_code?.trim() || null;
  }

  try {
    const response = await fetch(apiUrl(`/api/admin/colors/${colorId}`), {
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

    const color = (await response.json()) as ApiProductColor;
    void dispatch(fetchColors());
    return color;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update color.";
    return rejectWithValue(message);
  }
});

export const deleteColor = createAsyncThunk<string, string, CatalogThunkConfig>(
  "colors/delete",
  async (colorId, { getState, rejectWithValue, dispatch }) => {
    const token = getAccessToken(getState);
    if (!token) {
      return rejectWithValue("You must be signed in as an admin.");
    }

    try {
      const response = await fetch(apiUrl(`/api/admin/colors/${colorId}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      void dispatch(fetchColors());
      return colorId;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete color.";
      return rejectWithValue(message);
    }
  },
);

const colorSlice = createSlice({
  name: "colors",
  initialState,
  reducers: {
    clearColorErrors(state) {
      state.listError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    resetColorCreate(state) {
      state.createStatus = "idle";
      state.createError = null;
    },
    resetColorUpdate(state) {
      state.updateStatus = "idle";
      state.updateError = null;
    },
    resetColorDelete(state) {
      state.deleteStatus = "idle";
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchColors.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchColors.fulfilled, (state, action) => {
        state.items = action.payload;
        state.listStatus = "succeeded";
      })
      .addCase(fetchColors.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load colors.";
      })
      .addCase(createColor.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createColor.fulfilled, (state) => {
        state.createStatus = "succeeded";
        state.createError = null;
      })
      .addCase(createColor.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to create color.";
      })
      .addCase(updateColor.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateColor.fulfilled, (state) => {
        state.updateStatus = "succeeded";
        state.updateError = null;
      })
      .addCase(updateColor.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to update color.";
      })
      .addCase(deleteColor.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteColor.fulfilled, (state) => {
        state.deleteStatus = "succeeded";
        state.deleteError = null;
      })
      .addCase(deleteColor.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to delete color.";
      });
  },
});

export const {
  clearColorErrors,
  resetColorCreate,
  resetColorUpdate,
  resetColorDelete,
} = colorSlice.actions;

export const selectColors = (state: RootState) => state.colors.items;
export const selectColorsListStatus = (state: RootState) => state.colors.listStatus;
export const selectColorCreateStatus = (state: RootState) =>
  state.colors.createStatus;
export const selectColorCreateError = (state: RootState) =>
  state.colors.createError;
export const selectColorUpdateStatus = (state: RootState) =>
  state.colors.updateStatus;
export const selectColorUpdateError = (state: RootState) =>
  state.colors.updateError;
export const selectColorDeleteStatus = (state: RootState) =>
  state.colors.deleteStatus;
export const selectColorDeleteError = (state: RootState) =>
  state.colors.deleteError;

export default colorSlice.reducer;
