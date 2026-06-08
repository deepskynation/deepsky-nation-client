"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { fetchCart, resetCartState } from "@/store/slices/cartSlice";
import {
  selectAuthInitialized,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";

const LEGACY_CART_KEY = "deepsky-cart";

export function CartHydrator() {
  const dispatch = useAppDispatch();
  const authInitialized = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LEGACY_CART_KEY);
    }
  }, []);

  useEffect(() => {
    if (!authInitialized) {
      return;
    }

    if (isAuthenticated) {
      void dispatch(fetchCart());
      return;
    }

    dispatch(resetCartState());
  }, [authInitialized, dispatch, isAuthenticated]);

  return null;
}
