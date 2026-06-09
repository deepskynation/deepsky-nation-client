import { configureStore } from "@reduxjs/toolkit";
import adminDashboardReducer from "@/store/slices/adminDashboardSlice";
import adminSubscribersReducer from "@/store/slices/adminSubscriberSlice";
import adminUsersReducer from "@/store/slices/adminUserSlice";
import appReducer from "@/store/slices/appSlice";
import authReducer from "@/store/slices/authSlice";
import categoryReducer from "@/store/slices/categorySlice";
import colorReducer from "@/store/slices/colorSlice";
import cartReducer from "@/store/slices/cartSlice";
import ordersReducer from "@/store/slices/orderSlice";
import productsReducer from "@/store/slices/productSlice";
import settingsReducer from "@/store/slices/settingsSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      app: appReducer,
      adminDashboard: adminDashboardReducer,
      adminSubscribers: adminSubscribersReducer,
      adminUsers: adminUsersReducer,
      auth: authReducer,
      cart: cartReducer,
      orders: ordersReducer,
      categories: categoryReducer,
      colors: colorReducer,
      products: productsReducer,
      settings: settingsReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
