"use client";

import { FormEvent, useState } from "react";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import { AnimateInView } from "@/components/common/animation/animate-in-view";
import { useToast } from "@/components/common/feedback/toast-provider";
import { SocialIconLinks } from "@/components/common/marketing/social-icon-links";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  clearSubscribeError,
  selectIsSubscribing,
  selectSubscribeError,
  subscribeToEmail,
} from "@/store/slices/subscriberSlice";
import { cn } from "@/lib/utils";

type EmailSubscribeSectionProps = {
  title?: string;
  showSocialLinks?: boolean;
  className?: string;
  inputClassName?: string;
};

export function EmailSubscribeSection({
  title = "Subscribe to our email",
  showSocialLinks = true,
  className,
  inputClassName,
}: EmailSubscribeSectionProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const isSubmitting = useAppSelector(selectIsSubscribing);
  const subscribeError = useAppSelector(selectSubscribeError);
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = await dispatch(subscribeToEmail(email));
    if (subscribeToEmail.fulfilled.match(result)) {
      toast.success(result.payload.message ?? "You're subscribed.");
      setEmail("");
      return;
    }
  };

  return (
    <section className={cn("border-t border-black/8 pt-10", className)}>
      <AnimateInView>
        <div className="mb-5 space-y-1">
          <h2 className="font-serif text-xl font-normal text-black sm:text-2xl">
            {title}
          </h2>
        </div>
      </AnimateInView>

      <AnimateInView delay={80}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="min-w-0 w-full flex-1"
          >
            <div className={cn("relative w-full max-w-sm", inputClassName)}>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (subscribeError) {
                    dispatch(clearSubscribeError());
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
            {subscribeError ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {subscribeError}
              </p>
            ) : null}
          </form>

          {showSocialLinks ? <SocialIconLinks className="sm:shrink-0" /> : null}
        </div>
      </AnimateInView>
    </section>
  );
}
