"use client";

import type { ReactNode } from "react";
import { Loader2Icon } from "lucide-react";
import {
  GlassMessagePanel,
  type GlassMessageAction,
} from "@/components/common/feedback/glass-message-panel";
import { cn } from "@/lib/utils";

export type PageStateGateProps = {
  children: ReactNode;
  /** Centered loading spinner; checked first. */
  loading?: boolean;
  loadingMessage?: string;
  loadingClassName?: string;
  /** Error / not-found panel via GlassMessagePanel. */
  error?: boolean;
  errorTitle?: string;
  errorDescription?: string;
  errorAction?: GlassMessageAction;
  errorFullPage?: boolean;
  /** Session/auth bootstrap in progress. */
  authChecking?: boolean;
  authCheckingMessage?: string;
  /** User must sign in. */
  authRequired?: boolean;
  authRequiredTitle?: string;
  authRequiredDescription?: string;
  authRequiredAction?: GlassMessageAction;
  /**
   * `centered` — full-page gradient with centered panel (checkout-style).
   * `inline` — GlassMessagePanel only (embed in your own layout).
   */
  authRequiredLayout?: "centered" | "inline";
  className?: string;
};

const centeredPageClassName =
  "min-h-full bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black";

export function CenteredLoading({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] items-center justify-center gap-2 text-sm text-black/50",
        className,
      )}
    >
      <Loader2Icon className="size-5 animate-spin" aria-hidden />
      {message}
    </div>
  );
}

export function AuthRequiredPage({
  title,
  description,
  action,
  layout,
}: {
  title: string;
  description: string;
  action: GlassMessageAction;
  layout: "centered" | "inline";
}) {
  const panel = (
    <GlassMessagePanel
      variant="flat"
      fullPage={false}
      title={title}
      description={description}
      action={{ ...action, variant: action.variant ?? "button" }}
      className="max-w-none"
    />
  );

  if (layout === "inline") {
    return panel;
  }

  return (
    <div className={centeredPageClassName}>
      <div className="mx-auto max-w-lg px-6 py-16 lg:px-12">{panel}</div>
    </div>
  );
}

/**
 * Renders loading, error, or auth fallbacks before `children`.
 * Use on pages that need data + authenticated access (checkout, cart, etc.).
 */
export function PageStateGate({
  children,
  loading = false,
  loadingMessage = "Loading…",
  loadingClassName,
  error = false,
  errorTitle = "Something went wrong",
  errorDescription,
  errorAction,
  errorFullPage = false,
  authChecking = false,
  authCheckingMessage = "Checking your session…",
  authRequired = false,
  authRequiredTitle = "Sign In Required",
  authRequiredDescription = "You need to be signed in to continue.",
  authRequiredAction,
  authRequiredLayout = "centered",
  className,
}: PageStateGateProps) {
  if (loading) {
    return (
      <CenteredLoading message={loadingMessage} className={loadingClassName} />
    );
  }

  if (error) {
    return (
      <GlassMessagePanel
        variant="flat"
        fullPage={errorFullPage}
        title={errorTitle}
        description={errorDescription}
        action={errorAction}
        className={className}
      />
    );
  }

  if (authChecking) {
    return (
      <CenteredLoading
        message={authCheckingMessage}
        className={loadingClassName}
      />
    );
  }

  if (authRequired && authRequiredAction) {
    return (
      <AuthRequiredPage
        title={authRequiredTitle}
        description={authRequiredDescription}
        action={authRequiredAction}
        layout={authRequiredLayout}
      />
    );
  }

  return <>{children}</>;
}
