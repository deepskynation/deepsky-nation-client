import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { apiUrl } from "@/lib/api-config";
import { readApiError } from "@/store/api-utils";
import type { AppDispatch, RootState } from "@/store";
import type {
  AdminProductsQuery,
  ApiProduct,
  CreateProductPayload,
  PaginatedApiProducts,
  ShopProductsQuery,
  UpdateProductPayload,
} from "@/types/product";

type ProductsThunkConfig = {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
};

export type ProductsListStatus = "idle" | "loading" | "succeeded" | "failed";
export type ProductMutationStatus = "idle" | "loading" | "succeeded" | "failed";

export type ProductDetailStatus = "idle" | "loading" | "succeeded" | "failed";

export type ProductsState = {
  adminList: PaginatedApiProducts | null;
  listStatus: ProductsListStatus;
  listError: string | null;
  listQuery: AdminProductsQuery;
  createStatus: ProductMutationStatus;
  createError: string | null;
  lastCreated: ApiProduct | null;
  updateStatus: ProductMutationStatus;
  updateError: string | null;
  deleteStatus: ProductMutationStatus;
  deleteError: string | null;
  detailProduct: ApiProduct | null;
  detailStatus: ProductDetailStatus;
  detailError: string | null;
  shopList: PaginatedApiProducts | null;
  shopListStatus: ProductsListStatus;
  shopListError: string | null;
  shopListQuery: ShopProductsQuery;
  dashboardFeatured: PaginatedApiProducts | null;
  dashboardFeaturedStatus: ProductsListStatus;
  dashboardFeaturedError: string | null;
  dashboardModelGallery: PaginatedApiProducts | null;
  dashboardModelGalleryStatus: ProductsListStatus;
  dashboardModelGalleryError: string | null;
};

const initialListQuery: AdminProductsQuery = {
  page: 1,
  page_size: 15,
};

const initialShopListQuery: ShopProductsQuery = {
  page: 1,
  page_size: 15,
  include_gallery_images: true,
};

const initialState: ProductsState = {
  adminList: null,
  listStatus: "idle",
  listError: null,
  listQuery: initialListQuery,
  createStatus: "idle",
  createError: null,
  lastCreated: null,
  updateStatus: "idle",
  updateError: null,
  deleteStatus: "idle",
  deleteError: null,
  detailProduct: null,
  detailStatus: "idle",
  detailError: null,
  shopList: null,
  shopListStatus: "idle",
  shopListError: null,
  shopListQuery: initialShopListQuery,
  dashboardFeatured: null,
  dashboardFeaturedStatus: "idle",
  dashboardFeaturedError: null,
  dashboardModelGallery: null,
  dashboardModelGalleryStatus: "idle",
  dashboardModelGalleryError: null,
};

function getAccessToken(getState: () => RootState): string | null {
  return getState().auth.accessToken;
}

export const fetchAdminProducts = createAsyncThunk<
  { data: PaginatedApiProducts; query: AdminProductsQuery },
  AdminProductsQuery | undefined,
  ProductsThunkConfig
>("products/fetchAdminProducts", async (query, { getState, rejectWithValue }) => {
    const token = getAccessToken(getState);
    if (!token) {
      return rejectWithValue("You must be signed in as an admin.");
    }

    const state = getState().products;
    const mergedQuery = { ...state.listQuery, ...query };

    try {
      const params = new URLSearchParams();
      if (mergedQuery.page !== undefined) {
        params.set("page", String(mergedQuery.page));
      }
      if (mergedQuery.page_size !== undefined) {
        params.set("page_size", String(mergedQuery.page_size));
      }
      if (mergedQuery.visibility) {
        params.set("visibility", mergedQuery.visibility);
      }
      if (mergedQuery.category_id) {
        params.set("category_id", mergedQuery.category_id);
      }
      const search = mergedQuery.search?.trim();
      if (search) {
        params.set("search", search);
      }
      const productCode = mergedQuery.product_code?.trim();
      if (productCode) {
        params.set("product_code", productCode);
      }
      if (mergedQuery.min_price != null && !Number.isNaN(mergedQuery.min_price)) {
        params.set("min_price", String(mergedQuery.min_price));
      }
      if (mergedQuery.max_price != null && !Number.isNaN(mergedQuery.max_price)) {
        params.set("max_price", String(mergedQuery.max_price));
      }
      if (mergedQuery.min_stock != null && !Number.isNaN(mergedQuery.min_stock)) {
        params.set("min_stock", String(mergedQuery.min_stock));
      }
      if (mergedQuery.max_stock != null && !Number.isNaN(mergedQuery.max_stock)) {
        params.set("max_stock", String(mergedQuery.max_stock));
      }
      if (mergedQuery.created_from) {
        params.set("created_from", mergedQuery.created_from);
      }
      if (mergedQuery.created_to) {
        params.set("created_to", mergedQuery.created_to);
      }
      const suffix = params.toString();
      const url = apiUrl(
        suffix ? `/api/admin/products?${suffix}` : "/api/admin/products",
      );

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const data = (await response.json()) as PaginatedApiProducts;
      return { data, query: mergedQuery };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load products.";
      return rejectWithValue(message);
    }
  },
);

export const createAdminProduct = createAsyncThunk<
  ApiProduct,
  CreateProductPayload,
  ProductsThunkConfig
>("products/createAdminProduct", async (payload, { getState, rejectWithValue, dispatch }) => {
    const token = getAccessToken(getState);
    if (!token) {
      return rejectWithValue("You must be signed in as an admin.");
    }

    try {
      const response = await fetch(apiUrl("/api/admin/products"), {
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

      const product = (await response.json()) as ApiProduct;
      const listQuery = getState().products.listQuery;
      void dispatch(fetchAdminProducts(listQuery));
      return product;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create product.";
      return rejectWithValue(message);
    }
  },
);

export const fetchAdminProduct = createAsyncThunk<
  ApiProduct,
  string,
  ProductsThunkConfig
>("products/fetchAdminProduct", async (productId, { getState, rejectWithValue }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  try {
    const response = await fetch(apiUrl(`/api/admin/products/${productId}`), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    return (await response.json()) as ApiProduct;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load product details.";
    return rejectWithValue(message);
  }
});

export const updateAdminProduct = createAsyncThunk<
  ApiProduct,
  { productId: string; payload: UpdateProductPayload },
  ProductsThunkConfig
>(
  "products/updateAdminProduct",
  async ({ productId, payload }, { getState, rejectWithValue, dispatch }) => {
    const token = getAccessToken(getState);
    if (!token) {
      return rejectWithValue("You must be signed in as an admin.");
    }

    try {
      const response = await fetch(apiUrl(`/api/admin/products/${productId}`), {
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

      const product = (await response.json()) as ApiProduct;
      const listQuery = getState().products.listQuery;
      void dispatch(fetchAdminProducts(listQuery));
      return product;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update product.";
      return rejectWithValue(message);
    }
  },
);

export const deleteAdminProduct = createAsyncThunk<
  string,
  string,
  ProductsThunkConfig
>("products/deleteAdminProduct", async (productId, { getState, rejectWithValue, dispatch }) => {
  const token = getAccessToken(getState);
  if (!token) {
    return rejectWithValue("You must be signed in as an admin.");
  }

  try {
    const response = await fetch(apiUrl(`/api/admin/products/${productId}`), {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const listQuery = getState().products.listQuery;
    void dispatch(fetchAdminProducts(listQuery));
    return productId;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete product.";
    return rejectWithValue(message);
  }
});

function buildReleasedProductsUrl(query: ShopProductsQuery): string {
  const params = new URLSearchParams();
  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }
  if (query.page_size !== undefined) {
    params.set("page_size", String(query.page_size));
  }
  if (query.category_id) {
    params.set("category_id", query.category_id);
  }
  if (query.featured === true) {
    params.set("featured", "true");
  }
  if (query.include_model_images === true) {
    params.set("include_model_images", "true");
  }
  if (query.include_gallery_images === true) {
    params.set("include_gallery_images", "true");
  }
  const suffix = params.toString();
  return apiUrl(suffix ? `/api/products?${suffix}` : "/api/products");
}

export const fetchReleasedProducts = createAsyncThunk<
  { data: PaginatedApiProducts; query: ShopProductsQuery },
  ShopProductsQuery | undefined,
  ProductsThunkConfig
>("products/fetchReleasedProducts", async (query, { getState, rejectWithValue }) => {
  const state = getState().products;
  const mergedQuery = { ...state.shopListQuery, ...query };

  try {
    const response = await fetch(buildReleasedProductsUrl(mergedQuery));

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    const data = (await response.json()) as PaginatedApiProducts;
    return { data, query: mergedQuery };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load products.";
    return rejectWithValue(message);
  }
});

export const fetchDashboardFeaturedProducts = createAsyncThunk<
  PaginatedApiProducts,
  ShopProductsQuery | undefined,
  ProductsThunkConfig
>(
  "products/fetchDashboardFeaturedProducts",
  async (query, { rejectWithValue }) => {
    const mergedQuery = {
      page: 1,
      page_size: 6,
      featured: true,
      include_gallery_images: true,
      ...query,
    };

    try {
      const response = await fetch(buildReleasedProductsUrl(mergedQuery));

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const data = (await response.json()) as PaginatedApiProducts;
      if (data.rows.length > 0 || mergedQuery.featured !== true) {
        return data;
      }

      const fallbackResponse = await fetch(
        buildReleasedProductsUrl({
          page: mergedQuery.page,
          page_size: mergedQuery.page_size,
          include_gallery_images: mergedQuery.include_gallery_images,
        }),
      );

      if (!fallbackResponse.ok) {
        throw new Error(await readApiError(fallbackResponse));
      }

      return (await fallbackResponse.json()) as PaginatedApiProducts;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load featured products.";
      return rejectWithValue(message);
    }
  },
);

export const fetchDashboardModelGalleryProducts = createAsyncThunk<
  PaginatedApiProducts,
  ShopProductsQuery | undefined,
  ProductsThunkConfig
>(
  "products/fetchDashboardModelGalleryProducts",
  async (query, { rejectWithValue }) => {
    const mergedQuery = {
      page: 1,
      page_size: 12,
      include_model_images: true,
      ...query,
    };

    try {
      const response = await fetch(buildReleasedProductsUrl(mergedQuery));

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      return (await response.json()) as PaginatedApiProducts;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load model gallery.";
      return rejectWithValue(message);
    }
  },
);

export const fetchReleasedProduct = createAsyncThunk<
  ApiProduct,
  string,
  ProductsThunkConfig
>("products/fetchReleasedProduct", async (productId, { rejectWithValue }) => {
  try {
    const response = await fetch(apiUrl(`/api/products/${productId}`));

    if (!response.ok) {
      throw new Error(await readApiError(response));
    }

    return (await response.json()) as ApiProduct;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load product details.";
    return rejectWithValue(message);
  }
});

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setAdminListQuery(state, action: PayloadAction<AdminProductsQuery>) {
      state.listQuery = { ...state.listQuery, ...action.payload };
    },
    clearProductErrors(state) {
      state.listError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      if (state.listStatus === "failed") {
        state.listStatus = "idle";
      }
      if (state.createStatus === "failed") {
        state.createStatus = "idle";
      }
      if (state.updateStatus === "failed") {
        state.updateStatus = "idle";
      }
      if (state.deleteStatus === "failed") {
        state.deleteStatus = "idle";
      }
    },
    resetCreateProduct(state) {
      state.createStatus = "idle";
      state.createError = null;
      state.lastCreated = null;
    },
    resetUpdateProduct(state) {
      state.updateStatus = "idle";
      state.updateError = null;
    },
    resetDeleteProduct(state) {
      state.deleteStatus = "idle";
      state.deleteError = null;
    },
    clearProductDetail(state) {
      state.detailProduct = null;
      state.detailStatus = "idle";
      state.detailError = null;
    },
    setShopListQuery(state, action: PayloadAction<ShopProductsQuery>) {
      state.shopListQuery = { ...state.shopListQuery, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.adminList = action.payload.data;
        state.listQuery = action.payload.query;
        state.listStatus = "succeeded";
        state.listError = null;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load products.";
      })
      .addCase(createAdminProduct.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createAdminProduct.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.createError = null;
        state.lastCreated = action.payload;
      })
      .addCase(createAdminProduct.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to create product.";
      })
      .addCase(updateAdminProduct.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateAdminProduct.fulfilled, (state) => {
        state.updateStatus = "succeeded";
        state.updateError = null;
      })
      .addCase(updateAdminProduct.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to update product.";
      })
      .addCase(deleteAdminProduct.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteAdminProduct.fulfilled, (state) => {
        state.deleteStatus = "succeeded";
        state.deleteError = null;
      })
      .addCase(deleteAdminProduct.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to delete product.";
      })
      .addCase(fetchAdminProduct.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchAdminProduct.fulfilled, (state, action) => {
        state.detailProduct = action.payload;
        state.detailStatus = "succeeded";
        state.detailError = null;
      })
      .addCase(fetchAdminProduct.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load product details.";
      })
      .addCase(fetchReleasedProducts.pending, (state) => {
        state.shopListStatus = "loading";
        state.shopListError = null;
      })
      .addCase(fetchReleasedProducts.fulfilled, (state, action) => {
        state.shopList = action.payload.data;
        state.shopListQuery = action.payload.query;
        state.shopListStatus = "succeeded";
        state.shopListError = null;
      })
      .addCase(fetchReleasedProducts.rejected, (state, action) => {
        state.shopListStatus = "failed";
        state.shopListError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load products.";
      })
      .addCase(fetchDashboardFeaturedProducts.pending, (state) => {
        state.dashboardFeaturedStatus = "loading";
        state.dashboardFeaturedError = null;
      })
      .addCase(fetchDashboardFeaturedProducts.fulfilled, (state, action) => {
        state.dashboardFeaturedStatus = "succeeded";
        state.dashboardFeatured = action.payload;
        state.dashboardFeaturedError = null;
      })
      .addCase(fetchDashboardFeaturedProducts.rejected, (state, action) => {
        state.dashboardFeaturedStatus = "failed";
        state.dashboardFeaturedError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load featured products.";
      })
      .addCase(fetchDashboardModelGalleryProducts.pending, (state) => {
        state.dashboardModelGalleryStatus = "loading";
        state.dashboardModelGalleryError = null;
      })
      .addCase(fetchDashboardModelGalleryProducts.fulfilled, (state, action) => {
        state.dashboardModelGalleryStatus = "succeeded";
        state.dashboardModelGallery = action.payload;
        state.dashboardModelGalleryError = null;
      })
      .addCase(fetchDashboardModelGalleryProducts.rejected, (state, action) => {
        state.dashboardModelGalleryStatus = "failed";
        state.dashboardModelGalleryError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load model gallery.";
      })
      .addCase(fetchReleasedProduct.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchReleasedProduct.fulfilled, (state, action) => {
        state.detailProduct = action.payload;
        state.detailStatus = "succeeded";
        state.detailError = null;
      })
      .addCase(fetchReleasedProduct.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load product details.";
      });
  },
});

export const {
  setAdminListQuery,
  clearProductErrors,
  resetCreateProduct,
  resetUpdateProduct,
  resetDeleteProduct,
  clearProductDetail,
  setShopListQuery,
} = productSlice.actions;

export const selectProductsState = (state: RootState) => state.products;
export const selectAdminProducts = (state: RootState) =>
  state.products.adminList?.rows ?? [];
export const selectAdminProductsPagination = (state: RootState) => {
  const list = state.products.adminList;
  if (!list) {
    return null;
  }
  return {
    total: list.total,
    page: list.page,
    pageSize: list.page_size,
    totalPages: list.total_pages,
    hasNext: list.has_next,
    hasPrevious: list.has_previous,
  };
};
export const selectAdminProductsListStatus = (state: RootState) =>
  state.products.listStatus;
export const selectAdminProductsListError = (state: RootState) =>
  state.products.listError;
export const selectAdminProductsListQuery = (state: RootState) =>
  state.products.listQuery;
export const selectCreateProductStatus = (state: RootState) =>
  state.products.createStatus;
export const selectCreateProductError = (state: RootState) =>
  state.products.createError;
export const selectLastCreatedProduct = (state: RootState) =>
  state.products.lastCreated;
export const selectUpdateProductStatus = (state: RootState) =>
  state.products.updateStatus;
export const selectUpdateProductError = (state: RootState) =>
  state.products.updateError;
export const selectDeleteProductStatus = (state: RootState) =>
  state.products.deleteStatus;
export const selectDeleteProductError = (state: RootState) =>
  state.products.deleteError;
export const selectAdminProductDetail = (state: RootState) =>
  state.products.detailProduct;
export const selectAdminProductDetailStatus = (state: RootState) =>
  state.products.detailStatus;
export const selectAdminProductDetailError = (state: RootState) =>
  state.products.detailError;
export const selectShopProducts = (state: RootState) =>
  state.products.shopList?.rows ?? [];
export const selectShopProductsListStatus = (state: RootState) =>
  state.products.shopListStatus;
export const selectShopProductsListError = (state: RootState) =>
  state.products.shopListError;
export const selectShopProductsListQuery = (state: RootState) =>
  state.products.shopListQuery;
export const selectShopProductsPagination = (state: RootState) => {
  const list = state.products.shopList;
  if (!list) {
    return null;
  }
  return {
    total: list.total,
    page: list.page,
    pageSize: list.page_size,
    totalPages: list.total_pages,
    hasNext: list.has_next,
    hasPrevious: list.has_previous,
  };
};
export const selectProductDetail = (state: RootState) =>
  state.products.detailProduct;
export const selectProductDetailStatus = (state: RootState) =>
  state.products.detailStatus;
export const selectProductDetailError = (state: RootState) =>
  state.products.detailError;
export const selectDashboardFeaturedProducts = (state: RootState) =>
  state.products.dashboardFeatured?.rows ?? [];
export const selectDashboardFeaturedProductsStatus = (state: RootState) =>
  state.products.dashboardFeaturedStatus;
export const selectDashboardFeaturedProductsError = (state: RootState) =>
  state.products.dashboardFeaturedError;
export const selectDashboardModelGalleryProducts = (state: RootState) =>
  state.products.dashboardModelGallery?.rows ?? [];
export const selectDashboardModelGalleryProductsStatus = (state: RootState) =>
  state.products.dashboardModelGalleryStatus;
export const selectDashboardModelGalleryProductsError = (state: RootState) =>
  state.products.dashboardModelGalleryError;

export default productSlice.reducer;
