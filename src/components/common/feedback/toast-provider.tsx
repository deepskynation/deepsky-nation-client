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
  InfoIcon,
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
    iconWrap: "border-emerald-400 text-emerald-500",
    Icon: CheckIcon,
  },
  info: {
    defaultTitle: "Did you know?",
    iconWrap: "border-sky-400 text-sky-500",
    Icon: InfoIcon,
  },
  warning: {
    defaultTitle: "Warning!",
    iconWrap: "border-amber-400 text-amber-500",
    Icon: AlertTriangleIcon,
  },
  error: {
    defaultTitle: "Something went wrong!",
    iconWrap: "border-red-400 text-red-500",
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
      className="pointer-events-none fixed right-4 bottom-4 z-[10000] flex w-[min(100%-2rem,22rem)] flex-col-reverse gap-3 sm:right-6 sm:bottom-6"
    >
      {toasts.map((toast) => {
        const config = VARIANT_CONFIG[toast.variant];
        const { Icon } = config;

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-neutral-200/80 bg-white px-4 py-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.08)] motion-safe:animate-hero-fade-up"
          >
            {/* <div
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-transparent",
                config.iconWrap,
              )}
            >
              <Icon className="size-3.5" strokeWidth={2.5} aria-hidden />
            </div> */}

            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold leading-tight text-neutral-800">
                {toast.title}
              </p>
              <p className="mt-1 text-sm leading-snug text-neutral-500">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Dismiss notification"
            >
              <XIcon className="size-4" strokeWidth={2} />
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
