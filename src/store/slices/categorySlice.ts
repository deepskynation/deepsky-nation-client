import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiUrl } from "@/lib/api-config";
import { readApiError } from "@/store/api-utils";
import type { AppDispatch, RootState } from "@/store";
import type {
  ApiProductCategory,
  CreateCategoryPayload,
  PaginatedCategories,
  UpdateCategoryPayload,
} from "@/types/catalog";

type CatalogThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
};

export type CatalogMutationStatus = "idle" | "loading" | "succeeded" | "failed";

export type CategoryState = {
  items: ApiProductCategory[];
  shopItems: ApiProductCategory[];
  listStatus: CatalogMutationStatus;
  listError: string | null;
  shopListStatus: CatalogMutationStatus;
  shopListError: string | null;
  createStatus: CatalogMutationStatus;
  createError: string | null;
  updateStatus: CatalogMutationStatus;
  updateError: string | null;
  deleteStatus: CatalogMutationStatus;
  deleteError: string | null;
};

const initialState: CategoryState = {
  items: [],
  shopItems: [],
  listStatus: "idle",
  listError: null,
  shopListStatus: "idle",
  shopListError: null,
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

export const fetchCategories = createAsyncThunk<
  ApiProductCategory[],
  void,
  CatalogThunkConfig
>("categories/fetch", async (_, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  try {
    const response = await fetch(
      apiUrl("/api/categories?page=1&page_size=100"),
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const data = (await response.json()) as PaginatedCategories;
    return data.rows;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load categories.";
    return rejectWithValue(message);
  }
});

export const fetchShopCategories = createAsyncThunk<
  ApiProductCategory[],
  void,
  CatalogThunkConfig
>("categories/fetchShop", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(apiUrl("/api/categories?page=1&page_size=100"));

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const data = (await response.json()) as PaginatedCategories;
    return data.rows;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load categories.";
    return rejectWithValue(message);
  }
});

export const createCategory = createAsyncThunk<
  ApiProductCategory,
  CreateCategoryPayload,
  CatalogThunkConfig
>("categories/create", async (payload, { getState, rejectWithValue, dispatch }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  try {
    const response = await fetch(apiUrl("/api/admin/categories"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const category = (await response.json()) as ApiProductCategory;
    void dispatch(fetchCategories());
    return category;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create category.";
    return rejectWithValue(message);
  }
});

export const updateCategory = createAsyncThunk<
  ApiProductCategory,
  { categoryId: string; payload: UpdateCategoryPayload },
  CatalogThunkConfig
>(
  "categories/update",
  async ({ categoryId, payload }, { getState, rejectWithValue, dispatch }) => {
    const token = getAccessToken(getState);
    if (!token) {
      return rejectWithValue("You must be signed in as an admin.");
    }

    try {
      const response = await fetch(apiUrl(`/api/admin/categories/${categoryId}`), {
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

      const category = (await response.json()) as ApiProductCategory;
      void dispatch(fetchCategories());
      return category;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update category.";
      return rejectWithValue(message);
    }
  },
);

export const deleteCategory = createAsyncThunk<
  string,
  string,
  CatalogThunkConfig
>("categories/delete", async (categoryId, { getState, rejectWithValue, dispatch }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  try {
    const response = await fetch(apiUrl(`/api/admin/categories/${categoryId}`), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    void dispatch(fetchCategories());
    return categoryId;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete category.";
    return rejectWithValue(message);
  }
});

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoryErrors(state) {
      state.listError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    resetCategoryCreate(state) {
      state.createStatus = "idle";
      state.createError = null;
    },
    resetCategoryUpdate(state) {
      state.updateStatus = "idle";
      state.updateError = null;
    },
    resetCategoryDelete(state) {
      state.deleteStatus = "idle";
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.items = action.payload;
        state.listStatus = "succeeded";
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load categories.";
      })
      .addCase(fetchShopCategories.pending, (state) => {
        state.shopListStatus = "loading";
        state.shopListError = null;
      })
      .addCase(fetchShopCategories.fulfilled, (state, action) => {
        state.shopItems = action.payload;
        state.shopListStatus = "succeeded";
        state.shopListError = null;
      })
      .addCase(fetchShopCategories.rejected, (state, action) => {
        state.shopListStatus = "failed";
        state.shopListError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load categories.";
      })
      .addCase(createCategory.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.createStatus = "succeeded";
        state.createError = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to create category.";
      })
      .addCase(updateCategory.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.updateStatus = "succeeded";
        state.updateError = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to update category.";
      })
      .addCase(deleteCategory.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteCategory.fulfilled, (state) => {
        state.deleteStatus = "succeeded";
        state.deleteError = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to delete category.";
      });
  },
});

export const {
  clearCategoryErrors,
  resetCategoryCreate,
  resetCategoryUpdate,
  resetCategoryDelete,
} = categorySlice.actions;

export const selectCategories = (state: RootState) => state.categories.items;
export const selectShopCategories = (state: RootState) => state.categories.shopItems;
export const selectShopCategoriesListStatus = (state: RootState) =>
  state.categories.shopListStatus;
export const selectCategoriesListStatus = (state: RootState) =>
  state.categories.listStatus;
export const selectCategoryCreateStatus = (state: RootState) =>
  state.categories.createStatus;
export const selectCategoryCreateError = (state: RootState) =>
  state.categories.createError;
export const selectCategoryUpdateStatus = (state: RootState) =>
  state.categories.updateStatus;
export const selectCategoryUpdateError = (state: RootState) =>
  state.categories.updateError;
export const selectCategoryDeleteStatus = (state: RootState) =>
  state.categories.deleteStatus;
export const selectCategoryDeleteError = (state: RootState) =>
  state.categories.deleteError;

export default categorySlice.reducer;
