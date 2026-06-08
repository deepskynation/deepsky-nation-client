"use client";

import { ToastProvider } from "@/components/common/feedback/toast-provider";

export function UserToastShell({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
