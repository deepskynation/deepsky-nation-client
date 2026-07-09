"use client";

import {
  Loader2Icon,
  MailXIcon,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { GlassMessagePanel } from "@/components/common/feedback/glass-message-panel";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  resetUnsubscribeState,
  selectUnsubscribeError,
  selectUnsubscribeMessage,
  selectUnsubscribeStatus,
  unsubscribeFromEmail,
} from "@/store/slices/subscriberSlice";

export function UnsubscribeEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectUnsubscribeStatus);
  const error = useAppSelector(selectUnsubscribeError);
  const message = useAppSelector(selectUnsubscribeMessage);
  const unsubscribeStartedRef = useRef(false);

  useEffect(() => {
    return () => {
      dispatch(resetUnsubscribeState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (unsubscribeStartedRef.current) {
      return;
    }
    unsubscribeStartedRef.current = true;

    void dispatch(unsubscribeFromEmail(token));
  }, [dispatch, token]);

  if (!token) {
    return (
      <GlassMessagePanel
        title="Invalid Unsubscribe Link"
        description="This link is missing a token. Open the unsubscribe link from your email, or contact us if you need help."
        icon={<XCircleIcon className="size-12 text-red-600" aria-hidden />}
        action={{ href: "/", label: "Back To Shop", variant: "button" }}
      />
    );
  }

  if (status === "idle" || status === "loading") {
    return (
      <GlassMessagePanel
        title="Unsubscribing"
        description="Hang tight while we update your email preferences…"
        icon={
          <Loader2Icon
            className="size-12 text-black/40 motion-safe:animate-spin"
            aria-hidden
          />
        }
      />
    );
  }

  if (status === "failed") {
    return (
      <GlassMessagePanel
        title="Unsubscribe Failed"
        description={
          error ??
          "We could not process this unsubscribe link. It may have expired or already been used."
        }
        icon={<XCircleIcon className="size-12 text-red-600" aria-hidden />}
        action={{ href: "/", label: "Back To Shop", variant: "button" }}
      />
    );
  }

  return (
    <GlassMessagePanel
      title="You're Unsubscribed"
      description={
        message ??
        "You will no longer receive new release or sale emails from Deepsky Nation. Changed your mind? You can subscribe again from any shop page."
      }
      icon={<MailXIcon className="size-12 text-emerald-600" aria-hidden />}
      action={{ href: "/", label: "Back To Shop", variant: "button" }}
    />
  );
}
