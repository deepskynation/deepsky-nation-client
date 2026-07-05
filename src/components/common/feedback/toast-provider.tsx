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
import {
  AlertTriangleIcon,
  CheckIcon,
  LightbulbIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "info" | "warning" | "error";

type ToastInput = string | { title?: string; message: string };

type ToastItem = {
  id: string;
  title: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  success: (input: ToastInput) => void;
  info: (input: ToastInput) => void;
  warning: (input: ToastInput) => void;
  error: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4500;

const VARIANT_CONFIG = {
  success: {
    defaultTitle: "Success!",
    container: "border-emerald-200 bg-emerald-50/95",
    iconBg: "bg-emerald-500",
    Icon: CheckIcon,
  },
  info: {
    defaultTitle: "Did you know?",
    container: "border-sky-200 bg-sky-50/95",
    iconBg: "bg-sky-500",
    Icon: LightbulbIcon,
  },
  warning: {
    defaultTitle: "Warning!",
    container: "border-amber-200 bg-amber-50/95",
    iconBg: "bg-amber-500",
    Icon: AlertTriangleIcon,
  },
  error: {
    defaultTitle: "Something went wrong!",
    container: "border-red-200 bg-red-50/95",
    iconBg: "bg-red-500",
    Icon: XIcon,
  },
} as const;

function normalizeToastInput(
  input: ToastInput,
  defaultTitle: string,
): Pick<ToastItem, "title" | "message"> {
  if (typeof input === "string") {
    return { title: defaultTitle, message: input };
  }

  return {
    title: input.title ?? defaultTitle,
    message: input.message,
  };
}

function ToastViewport({
  toasts,
  dismiss,
}: {
  toasts: ToastItem[];
  dismiss: (id: string) => void;
}) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-0 top-20 z-[10000] flex flex-col items-center gap-3 px-4 md:top-24 sm:items-end sm:pr-6"
    >
      {toasts.map((toast) => {
        const config = VARIANT_CONFIG[toast.variant];
        const { Icon } = config;

        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.08)] motion-safe:animate-hero-fade-up",
              config.container,
            )}
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full text-white",
                config.iconBg,
              )}
            >
              <Icon className="size-4" strokeWidth={2.5} aria-hidden />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight text-foreground">
                {toast.title}
              </p>
              <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded-md p-1.5 text-foreground/45 transition-colors hover:bg-black/5 hover:text-foreground/70"
              aria-label="Dismiss notification"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        );
      })}
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
    (variant: ToastVariant, input: ToastInput) => {
      const { title, message } = normalizeToastInput(
        input,
        VARIANT_CONFIG[variant].defaultTitle,
      );
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setToasts((current) => [...current, { id, title, message, variant }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (input) => push("success", input),
      info: (input) => push("info", input),
      warning: (input) => push("warning", input),
      error: (input) => push("error", input),
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
