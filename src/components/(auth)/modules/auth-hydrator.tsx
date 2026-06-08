"use client";

import { useEffect } from "react";
import { initializeAuth } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/hooks";

export function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(initializeAuth());
  }, [dispatch]);

  return children;
}
