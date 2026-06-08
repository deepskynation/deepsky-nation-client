"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { AuthBackButton } from "@/components/(auth)/modules/auth-back-button";
import { authGlassInputClassName } from "@/components/(auth)/modules/auth-glass-styles";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { clearAuthError, selectAuthError, signup } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";

const initialForm = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone_number: "",
  home_address: "",
  city: "",
  region: "",
  country: "",
  postal_code: "",
};

const REQUIRED_ADDRESS_FIELDS = [
  { key: "phone_number" as const, label: "Phone Number" },
  { key: "home_address" as const, label: "Home Address" },
  { key: "city" as const, label: "City" },
  { key: "region" as const, label: "Region / State" },
  { key: "country" as const, label: "Country" },
  { key: "postal_code" as const, label: "Postal Code" },
];

type SignupStep = 1 | 2;

function validateAccountStep(form: typeof initialForm): string | null {
  if (form.username.trim().length < 3) {
    return "Username must be at least 3 characters.";
  }
  if (!form.email.trim()) {
    return "Please enter your email.";
  }
  if (form.password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (form.password !== form.confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
}

function validateAddressStep(form: typeof initialForm): string | null {
  const missing = REQUIRED_ADDRESS_FIELDS.find((field) => !form[field.key].trim());
  if (missing) {
    return `Please enter your ${missing.label.toLowerCase()}.`;
  }
  return null;
}

export default function Signup() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<SignupStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (localError) {
      setLocalError(null);
    }
    if (error) {
      dispatch(clearAuthError());
    }
  };

  const handleNext = () => {
    const message = validateAccountStep(form);
    if (message) {
      setLocalError(message);
      return;
    }
    setLocalError(null);
    setStep(2);
  };

  const handleBack = () => {
    setLocalError(null);
    dispatch(clearAuthError());
    setStep(1);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step === 1) {
      handleNext();
      return;
    }

    const accountError = validateAccountStep(form);
    if (accountError) {
      setLocalError(accountError);
      setStep(1);
      return;
    }

    const addressError = validateAddressStep(form);
    if (addressError) {
      setLocalError(addressError);
      return;
    }

    setIsSubmitting(true);

    const result = await dispatch(
      signup({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        phone_number: form.phone_number.trim(),
        home_address: form.home_address.trim(),
        city: form.city.trim(),
        region: form.region.trim(),
        country: form.country.trim(),
        postal_code: form.postal_code.trim(),
      }),
    );

    if (signup.fulfilled.match(result)) {
      const email = encodeURIComponent(form.email.trim());
      router.push(`/verify-email?email=${email}`);
      return;
    }

    setIsSubmitting(false);
  };

  const displayError = localError ?? error;
  const inputClassName = authGlassInputClassName;
  const textareaClassName = cn(inputClassName, "min-h-[88px] resize-none py-2.5 h-auto");

  const primaryButtonClassName =
    "h-10 w-full rounded-md bg-black text-sm font-medium text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-4">
        <AuthBackButton />

        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-5">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold text-black sm:text-3xl">
                Create Your Account
              </h1>
              <p className="text-xs text-black/45">
                Step {step} of 2 —{" "}
                {step === 1 ? "Account Details" : "Contact & Delivery"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 ? (
                  <fieldset className="space-y-3.5">
                    <legend className="sr-only">Account</legend>

                    <div className="space-y-1.5">
                      <label htmlFor="username" className="text-xs text-black/70">
                        Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={form.username}
                        onChange={handleChange}
                        autoComplete="username"
                        required
                        minLength={3}
                        className={inputClassName}
                      />
                    </div>

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
                        autoComplete="email"
                        required
                        className={inputClassName}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="password" className="text-xs text-black/70">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={handleChange}
                          autoComplete="new-password"
                          required
                          minLength={8}
                          className={`${inputClassName} pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-black/45 transition-colors hover:text-black"
                          aria-label={
                            showPassword ? "Hide Password" : "Show Password"
                          }
                        >
                          {showPassword ? (
                            <EyeOffIcon className="size-4" />
                          ) : (
                            <EyeIcon className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="confirmPassword"
                        className="text-xs text-black/70"
                      >
                        Confirm password
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                        className={inputClassName}
                      />
                    </div>
                  </fieldset>
                ) : (
                  <fieldset className="space-y-3.5">
                    <legend className="sr-only">Contact And Delivery</legend>
                    <p className="text-xs leading-relaxed text-black/45">
                      Saved to your profile for faster checkout.
                    </p>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="phone_number"
                        className="text-xs text-black/70"
                      >
                        Phone Number
                      </label>
                      <input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        value={form.phone_number}
                        onChange={handleChange}
                        autoComplete="tel"
                        required
                        className={inputClassName}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="home_address"
                        className="text-xs text-black/70"
                      >
                        Home Address
                      </label>
                      <textarea
                        id="home_address"
                        name="home_address"
                        rows={3}
                        value={form.home_address}
                        onChange={handleChange}
                        autoComplete="street-address"
                        required
                        placeholder="Street, building, unit"
                        className={textareaClassName}
                      />
                    </div>

                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label htmlFor="city" className="text-xs text-black/70">
                          City
                        </label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          value={form.city}
                          onChange={handleChange}
                          autoComplete="address-level2"
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="region" className="text-xs text-black/70">
                          Region / State
                        </label>
                        <input
                          id="region"
                          name="region"
                          type="text"
                          value={form.region}
                          onChange={handleChange}
                          autoComplete="address-level1"
                          required
                          className={inputClassName}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3.5 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label htmlFor="country" className="text-xs text-black/70">
                          Country
                        </label>
                        <input
                          id="country"
                          name="country"
                          type="text"
                          value={form.country}
                          onChange={handleChange}
                          autoComplete="country-name"
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="postal_code"
                          className="text-xs text-black/70"
                        >
                          Postal Code
                        </label>
                        <input
                          id="postal_code"
                          name="postal_code"
                          type="text"
                          value={form.postal_code}
                          onChange={handleChange}
                          autoComplete="postal-code"
                          required
                          className={inputClassName}
                        />
                      </div>
                    </div>
                  </fieldset>
                )}

                {displayError ? (
                  <p className="text-sm text-red-600" role="alert">
                    {displayError}
                  </p>
                ) : null}

                {step === 1 ? (
                  <button type="submit" className={primaryButtonClassName}>
                    Next
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="h-10 w-full rounded-md border border-black/15 bg-white/60 text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(primaryButtonClassName, "sm:flex-1")}
                    >
                      {isSubmitting ? "Creating account…" : "Create Account"}
                    </button>
                  </div>
                )}
              </form>

              <p className="text-center text-sm text-black/70">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-black hover:underline"
                >
                  Log In
                </Link>
              </p>

              <p className="text-center text-xs leading-relaxed text-black/45">
                By creating your account, you agree to the{" "}
                <Link href="#" className="underline hover:text-black">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="underline hover:text-black">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}
