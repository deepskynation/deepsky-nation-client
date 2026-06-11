"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { buildLoginRedirectPath } from "@/lib/auth-redirect";
import type { RootState } from "@/store";
import {
  selectAuthInitialized,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";

/**
 * Guards purchase actions (add to cart, buy now).
 * Returns true when the user is signed in and the caller may proceed.
 */
const useAppSelector = useSelector.withTypes<RootState>();

export function usePurchaseAuth() {
  const router = useRouter();
  const authReady = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const requireAuth = useCallback(
    (returnPath: string): boolean => {
      if (!authReady) {
        return false;
      }

      if (!isAuthenticated) {
        router.push(buildLoginRedirectPath(returnPath));
        return false;
      }

      return true;
    },
    [authReady, isAuthenticated, router],
  );

  return { authReady, isAuthenticated, requireAuth };
}
