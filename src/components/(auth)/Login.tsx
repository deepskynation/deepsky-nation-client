"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { AuthBackButton } from "@/components/(auth)/modules/auth-back-button";
import { authGlassInputClassName } from "@/components/(auth)/modules/auth-glass-styles";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { getDashboardPathForRole } from "@/lib/auth-session";
import { clearAuthError, login, selectAuthError } from "@/store/slices/authSlice";

function safeRedirectPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  return value;
}

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectAfterLogin = safeRedirectPath(searchParams.get("redirect"));
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) {
      dispatch(clearAuthError());
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await dispatch(
      login({ email: form.email.trim(), password: form.password }),
    );

    if (login.fulfilled.match(result)) {
      router.push(
        redirectAfterLogin ?? getDashboardPathForRole(result.payload.user.role),
      );
      return;
    }

    setIsSubmitting(false);
  };

  const inputClassName = authGlassInputClassName;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-md space-y-4">
        <AuthBackButton />

        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-5">
            <h1 className="text-center text-2xl font-semibold text-black sm:text-3xl">
              Welcome Back
            </h1>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs text-black/70">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className={inputClassName}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs text-black/70">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-black/55 hover:text-black hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className={`${inputClassName} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-black/45 transition-colors hover:text-black"
                    aria-label={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full rounded-md bg-black text-sm font-medium text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in…" : "Log In"}
              </button>
            </form>

            <p className="text-center text-sm text-black/70">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-black hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
