"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { EmailCodeInput } from "@/components/(auth)/email-code-input";
import {
  GoogleAuthProvider,
  isGoogleSignInEnabled,
} from "@/components/(auth)/modules/google-auth-provider";
import { GoogleContinueButton } from "@/components/(auth)/modules/google-continue-button";
import { VerifyEmailIllustration } from "@/components/(auth)/modules/verify-email-illustration";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { getDashboardPathForRole } from "@/lib/auth-session";
import {
  clearAuthError,
  selectAuthError,
  sendEmailCode,
  sendGoogleCode,
  verifyEmailCode,
  verifyGoogleCode,
} from "@/store/slices/authSlice";

type LoginStep = "signin" | "code";

const LAST_AUTH_METHOD_KEY = "deepsky-last-auth-method";
const LAST_EMAIL_KEY = "deepsky-last-email";

function safeRedirectPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  return value;
}

function OrDivider() {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-black/10" />
      <span className="text-sm text-black/40">or</span>
      <div className="h-px flex-1 bg-black/10" />
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectAfterLogin = safeRedirectPath(searchParams.get("redirect"));
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const googleEnabled = isGoogleSignInEnabled();

  const [step, setStep] = useState<LoginStep>("signin");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [lastUsedMethod, setLastUsedMethod] = useState<"google" | "email" | null>(
    null,
  );
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);
  const verifyingRef = useRef(false);

  useEffect(() => {
    const storedMethod = window.localStorage.getItem(LAST_AUTH_METHOD_KEY);
    if (storedMethod === "google" || storedMethod === "email") {
      setLastUsedMethod(storedMethod);
    }
    const storedEmail = window.localStorage.getItem(LAST_EMAIL_KEY);
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const finishLogin = (role: "user" | "admin") => {
    router.push(redirectAfterLogin ?? getDashboardPathForRole(role));
  };

  const handleGoogleSuccess = async (credential: string) => {
    dispatch(clearAuthError());
    window.localStorage.setItem(LAST_AUTH_METHOD_KEY, "google");
    setIsSubmitting(true);
    const result = await dispatch(sendGoogleCode(credential));
    setIsSubmitting(false);

    if (sendGoogleCode.fulfilled.match(result)) {
      setGoogleCredential(credential);
      setEmail(result.payload.email);
      window.localStorage.setItem(LAST_EMAIL_KEY, result.payload.email);
      setStep("code");
      setCode("");
      return;
    }
  };

  const sendCodeForEmail = async (rawEmail: string) => {
    const trimmed = rawEmail.trim();
    if (!trimmed) {
      setEmailHint("Enter your email to continue.");
      emailInputRef.current?.focus();
      return false;
    }

    setEmailHint(null);
    window.localStorage.setItem(LAST_AUTH_METHOD_KEY, "email");
    window.localStorage.setItem(LAST_EMAIL_KEY, trimmed);
    setIsSubmitting(true);
    const result = await dispatch(sendEmailCode(trimmed));
    setIsSubmitting(false);

    if (sendEmailCode.fulfilled.match(result)) {
      setGoogleCredential(null);
      setEmail(trimmed);
      setStep("code");
      setCode("");
      return true;
    }

    return false;
  };

  const handleEmailFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(clearAuthError());
    await sendCodeForEmail(email);
  };

  const submitCode = useCallback(
    async (nextCode: string) => {
      if (nextCode.length !== 6 || verifyingRef.current) {
        return;
      }

      verifyingRef.current = true;
      setIsSubmitting(true);

      if (googleCredential) {
        const result = await dispatch(
          verifyGoogleCode({ credential: googleCredential, code: nextCode }),
        );
        if (verifyGoogleCode.fulfilled.match(result)) {
          finishLogin(result.payload.user.role);
          return;
        }
      } else {
        const result = await dispatch(
          verifyEmailCode({ email: email.trim(), code: nextCode }),
        );
        if (verifyEmailCode.fulfilled.match(result)) {
          finishLogin(result.payload.user.role);
          return;
        }
      }
      verifyingRef.current = false;
      setIsSubmitting(false);
    },
    [dispatch, email, googleCredential, redirectAfterLogin, router],
  );

  const handleResendCode = async () => {
    dispatch(clearAuthError());
    setIsSubmitting(true);

    if (googleCredential) {
      const result = await dispatch(sendGoogleCode(googleCredential));
      setIsSubmitting(false);
      if (!sendGoogleCode.fulfilled.match(result)) {
        return;
      }
      setCode("");
      return;
    }

    const result = await dispatch(sendEmailCode(email.trim()));
    setIsSubmitting(false);
    if (sendEmailCode.fulfilled.match(result)) {
      setCode("");
    }
  };

  if (step === "code") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
        <div className="w-full max-w-[420px] space-y-8 text-center">
          <VerifyEmailIllustration />

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-black">
              Verify your email
            </h1>
            <div className="space-y-1 text-base text-black/55">
              <p>Enter code sent to</p>
              <p className="font-semibold text-black">{email.trim()}</p>
            </div>
          </div>

          <div className="space-y-6">
            <EmailCodeInput
              value={code}
              onChange={(value) => {
                setCode(value);
                if (error) {
                  dispatch(clearAuthError());
                }
              }}
              onComplete={submitCode}
              disabled={isSubmitting}
            />

            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            {isSubmitting ? (
              <p className="text-sm text-black/45">Verifying…</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isSubmitting}
              className="text-sm text-black/55 transition-colors hover:text-black disabled:opacity-50"
            >
              Resend code
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("signin");
                setCode("");
                setGoogleCredential(null);
                verifyingRef.current = false;
                dispatch(clearAuthError());
              }}
              className="text-base font-semibold text-black transition-opacity hover:opacity-70"
            >
              Change email address
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
      <div className="w-full max-w-[420px] space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-black">Sign in</h1>
          <p className="text-base text-black/55">Sign in or create an account</p>
        </div>

        <div className="space-y-5">
          {googleEnabled ? (
            <div className="relative pb-3">
              <GoogleContinueButton
                onSuccess={handleGoogleSuccess}
                onError={() => setIsSubmitting(false)}
                disabled={isSubmitting}
                label={isSubmitting ? "Sending code…" : "Continue with shop"}
              />
              {lastUsedMethod === "google" ? (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-md border border-black/10 bg-[#f3f3f3] px-2 py-0.5 text-[11px] font-medium text-black/55">
                  Last used
                </span>
              ) : null}
            </div>
          ) : (
            <p className="rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-center text-sm text-black/55">
              Google Sign-In is not configured. Use your email below.
            </p>
          )}

          <OrDivider />

          <form onSubmit={handleEmailFormSubmit} className="space-y-4">
            <div className="relative pb-3">
              <input
                ref={emailInputRef}
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailHint(null);
                  if (error) {
                    dispatch(clearAuthError());
                  }
                }}
                autoComplete="email"
                placeholder="Email"
                className="h-14 w-full rounded-2xl border border-black/15 bg-white px-4 pr-14 text-base text-black outline-none transition-colors placeholder:text-black/35 focus:border-black/30"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-black transition-opacity hover:opacity-70 disabled:opacity-30"
                aria-label="Continue with email"
              >
                <ArrowRightIcon className="size-5" strokeWidth={2} />
              </button>

              {lastUsedMethod === "email" ? (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-md border border-black/10 bg-[#f3f3f3] px-2 py-0.5 text-[11px] font-medium text-black/55">
                  Last used
                </span>
              ) : null}
            </div>

            {emailHint ? (
              <p className="text-sm text-black/55" role="status">
                {emailHint}
              </p>
            ) : null}

            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
          </form>

          <label className="flex items-center gap-3 text-sm text-black/80">
            <input
              type="checkbox"
              className="size-4 rounded border-black/20 accent-black"
            />
            Email me with news and offers
          </label>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block text-xs text-black/40 transition-colors hover:text-black/70"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <GoogleAuthProvider>
      <LoginContent />
    </GoogleAuthProvider>
  );
}
