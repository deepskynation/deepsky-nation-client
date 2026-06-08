"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2Icon,
  InfoIcon,
  Loader2Icon,
  MailIcon,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AuthBackButton } from "@/components/(auth)/modules/auth-back-button";
import { AuthGlassFormPanel } from "@/components/(auth)/modules/auth-glass-form-panel";
import { authGlassInputClassName } from "@/components/(auth)/modules/auth-glass-styles";
import { apiUrl } from "@/lib/api-config";
import { cn } from "@/lib/utils";

type VerifyStatus =
  | "loading"
  | "pending"
  | "missing_token"
  | "success"
  | "already_verified"
  | "error";

type ApiMessageResponse = {
  message?: string;
};

type ApiErrorBody = {
  detail?: string | { msg?: string }[];
  message?: string;
};

function messageFromErrorBody(body: ApiErrorBody): string {
  if (typeof body.detail === "string") {
    return body.detail;
  }
  if (Array.isArray(body.detail)) {
    const parts = body.detail
      .map((item) => item.msg)
      .filter((msg): msg is string => Boolean(msg));
    if (parts.length > 0) {
      return parts.join(", ");
    }
  }
  if (body.message) {
    return body.message;
  }
  return "Something went wrong. Please try again.";
}

function isAlreadyVerifiedMessage(message: string): boolean {
  return message.toLowerCase().includes("already verified");
}

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email")?.trim() ?? "";

  const initialStatus: VerifyStatus = token
    ? "loading"
    : emailParam
      ? "pending"
      : "missing_token";

  const [status, setStatus] = useState<VerifyStatus>(initialStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState(emailParam);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  const verifyStartedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      if (emailParam) {
        setStatus("pending");
      } else {
        setStatus("missing_token");
        setShowResend(false);
      }
      setMessage(null);
      return;
    }

    if (verifyStartedRef.current) {
      return;
    }
    verifyStartedRef.current = true;

    const controller = new AbortController();

    void (async () => {
      try {
        const response = await fetch(apiUrl("/api/auth/verify-email"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          signal: controller.signal,
        });

        const body = (await response.json()) as ApiMessageResponse & ApiErrorBody;

        if (response.ok) {
          const responseMessage =
            body.message ?? "Verification completed.";
          if (isAlreadyVerifiedMessage(responseMessage)) {
            setStatus("already_verified");
            setMessage(responseMessage);
          } else {
            setStatus("success");
            setMessage(responseMessage);
          }
          return;
        }

        setStatus("error");
        setMessage(messageFromErrorBody(body));
        setShowResend(response.status === 400 || response.status === 404);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setStatus("error");
        setMessage(
          "Could not reach the server. Check your connection and try again.",
        );
        setShowResend(true);
      }
    })();

    return () => controller.abort();
  }, [token, emailParam]);

  const handleResend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResendLoading(true);
    setResendFeedback(null);

    try {
      const response = await fetch(apiUrl("/api/auth/resend-verification"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail.trim() }),
      });

      const body = (await response.json()) as ApiMessageResponse & ApiErrorBody;
      if (response.ok) {
        setResendFeedback(
          body.message ??
            "If that email is registered and not verified, a new link was sent.",
        );
      } else {
        setResendFeedback(messageFromErrorBody(body));
      }
    } catch {
      setResendFeedback(
        "Could not reach the server. Check your connection and try again.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  const statusIcon = (() => {
    switch (status) {
      case "loading":
        return (
          <Loader2Icon
            className="size-12 text-black/40 motion-safe:animate-spin"
            aria-hidden
          />
        );
      case "success":
        return (
          <CheckCircle2Icon className="size-12 text-emerald-600" aria-hidden />
        );
      case "already_verified":
        return <InfoIcon className="size-12 text-sky-600" aria-hidden />;
      case "pending":
        return <MailIcon className="size-12 text-sky-600" aria-hidden />;
      case "missing_token":
      case "error":
        return <XCircleIcon className="size-12 text-red-600" aria-hidden />;
      default:
        return null;
    }
  })();

  const title = (() => {
    switch (status) {
      case "loading":
        return "Verifying Your Email";
      case "success":
        return "Email Verified";
      case "already_verified":
        return "Already Verified";
      case "pending":
        return "Check Your Email";
      case "missing_token":
        return "Invalid Verification Link";
      case "error":
        return "Verification Failed";
      default:
        return "Email Verification";
    }
  })();

  const description = (() => {
    switch (status) {
      case "loading":
        return "Hang tight while we confirm your address…";
      case "pending":
        return emailParam
          ? `We sent a confirmation link to ${emailParam}. Open it to verify your account, then log in.`
          : "We sent a confirmation link to your inbox. Open it to verify your account, then log in.";
      case "missing_token":
        return "This link is missing a verification token. Open the link from your confirmation email, or request a new one below.";
      case "success":
      case "already_verified":
      case "error":
        return message;
      default:
        return null;
    }
  })();

  const showLoginLink =
    status === "success" || status === "already_verified";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-4">

        <div className="overflow-hidden rounded-xl border border-black/10 bg-white/80 shadow-sm backdrop-blur-sm">
          <AuthGlassFormPanel>
            <div className="space-y-6 text-center">
              <div className="flex justify-center">{statusIcon}</div>

              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-black sm:text-3xl">
                  {title}
                </h1>
                {description ? (
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      status === "error" || status === "missing_token"
                        ? "text-red-600/90"
                        : "text-black/60",
                    )}
                    role={status === "error" ? "alert" : undefined}
                  >
                    {description}
                  </p>
                ) : null}
              </div>

              {showLoginLink ? (
                <Link
                  href="/login"
                  className="inline-flex h-10 w-full items-center justify-center rounded-md bg-black text-sm font-medium text-white transition-colors hover:bg-black/90"
                >
                  Continue To Log In
                </Link>
              ) : null}

              {(showResend || status === "missing_token" || status === "pending") &&
              !showLoginLink ? (
                <div className="space-y-3 border-t border-black/8 pt-5 text-left">
                  <div className="flex items-center gap-2 text-sm font-medium text-black">
                    <MailIcon className="size-4 text-black/50" aria-hidden />
                    Resend Verification Email
                  </div>
                  <form onSubmit={handleResend} className="space-y-3">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="resend-email"
                        className="text-xs text-black/70"
                      >
                        Email
                      </label>
                      <input
                        id="resend-email"
                        name="email"
                        type="email"
                        value={resendEmail}
                        onChange={(event) => setResendEmail(event.target.value)}
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        className={authGlassInputClassName}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={resendLoading}
                      className="h-10 w-full rounded-md border border-black/15 bg-white/60 text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {resendLoading ? "Sending…" : "Send New Link"}
                    </button>
                  </form>
                  {resendFeedback ? (
                    <p className="text-center text-xs text-black/55">
                      {resendFeedback}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {status !== "success" && status !== "already_verified" ? (
                <p className="text-sm text-black/55">
                  <Link href="/" className="font-medium text-black hover:underline">
                    Back To Home
                  </Link>
                </p>
              ) : null}
            </div>
          </AuthGlassFormPanel>
        </div>
      </div>
    </div>
  );
}
