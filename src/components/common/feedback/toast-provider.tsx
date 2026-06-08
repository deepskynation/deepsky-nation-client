"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2Icon, XCircleIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error";

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4500;

function ToastViewport({ toasts, dismiss }: { toasts: ToastItem[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-0 top-20 z-[10000] flex flex-col items-center gap-2 px-4 md:top-24 sm:items-end sm:pr-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg",
            toast.variant === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : "border-red-200 bg-red-50 text-red-950",
          )}
        >
          {toast.variant === "success" ? (
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          ) : (
            <XCircleIcon className="mt-0.5 size-4 shrink-0 text-red-600" />
          )}
          <p className="flex-1 text-sm leading-snug">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="rounded-md p-1 text-current/60 transition-colors hover:bg-black/5 hover:text-current"
            aria-label="Dismiss Notification"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message: string) => push("success", message),
      error: (message: string) => push("error", message),
    }),
    [push],
  );

  const toastViewport = <ToastViewport toasts={toasts} dismiss={dismiss} />;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted ? createPortal(toastViewport, document.body) : toastViewport}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }
  return context;
}
