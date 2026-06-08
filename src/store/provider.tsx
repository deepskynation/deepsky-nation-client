"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { AuthHydrator } from "@/components/(auth)/modules/auth-hydrator";
import { CartHydrator } from "@/components/cart/cart-hydrator";
import { makeStore, type AppStore } from "@/store";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <AuthHydrator>
        <CartHydrator />
        {children}
      </AuthHydrator>
    </Provider>
  );
}
