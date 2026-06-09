"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import { AnimateInView } from "@/components/common/animation/animate-in-view";
import { useToast } from "@/components/common/feedback/toast-provider";
import { FacebookIcon, InstagramIcon } from "@/components/common/icons/social-icons";
import { contactUsContent } from "@/mock/contact-us";
import { apiUrl } from "@/lib/api-config";
import { readApiError } from "@/store/api-utils";

const socialLinkClassName =
  "flex size-11 shrink-0 items-center justify-center text-black transition-opacity hover:opacity-70";

export function ProductDetailEmailSubscribe() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(apiUrl("/api/subscribers"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const body = (await response.json()) as { message?: string };
      toast.success(body.message ?? "You're subscribed.");
      setEmail("");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Could not subscribe. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-10 border-t border-black/8 pt-10">
      <AnimateInView>
        <div className="mb-5 space-y-1">
          <h2 className="font-serif text-xl font-normal text-black sm:text-2xl">
            Subscribe to our email
          </h2>
        </div>
      </AnimateInView>

      <AnimateInView delay={80}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form onSubmit={(event) => void handleSubmit(event)} className="min-w-0 w-full flex-1">
            <div className="relative w-full max-w-sm">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) {
                    setError(null);
                  }
                }}
                autoComplete="email"
                placeholder="Email"
                disabled={isSubmitting}
                className="h-11 w-full border border-black/15 bg-white/70 px-4 pr-12 text-sm text-black outline-none transition-colors placeholder:text-black/35 focus:border-black/30 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-black transition-opacity hover:opacity-70 disabled:opacity-30"
                aria-label="Subscribe"
              >
                {isSubmitting ? (
                  <Loader2Icon className="size-4 animate-spin" aria-hidden />
                ) : (
                  <ArrowRightIcon className="size-4" strokeWidth={2} />
                )}
              </button>
            </div>
            {error ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
          </form>

          <div className="flex items-center gap-2 sm:shrink-0">
            <Link
              href={contactUsContent.facebook.href}
              target="_blank"
              rel="noopener noreferrer"
              className={socialLinkClassName}
              aria-label={contactUsContent.facebook.label}
            >
              <FacebookIcon />
            </Link>
            <Link
              href={contactUsContent.instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              className={socialLinkClassName}
              aria-label={contactUsContent.instagram.label}
            >
              <InstagramIcon />
            </Link>
          </div>
        </div>
      </AnimateInView>
    </section>
  );
}
