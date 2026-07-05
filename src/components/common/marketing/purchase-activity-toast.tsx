"use client";

import Image from "next/image";
import { XIcon } from "lucide-react";
import { formatRelativeTime } from "@/lib/purchase-activity-display";
import { toImagePreviewSrc } from "@/lib/read-image-base64";
import type { PurchaseActivityToastItem } from "@/types/purchase-activity";
import { cn } from "@/lib/utils";

type PurchaseActivityToastProps = {
  item: PurchaseActivityToastItem;
  onDismiss: (toastId: string) => void;
};

export function PurchaseActivityToast({
  item,
  onDismiss,
}: PurchaseActivityToastProps) {
  const imageSrc = item.product_image_base64
    ? toImagePreviewSrc(item.product_image_base64)
    : null;

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.14)] motion-safe:animate-hero-fade-up",
      )}
    >
      <div className="relative size-24 shrink-0 bg-neutral-100 sm:size-28">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={item.product_name}
            fill
            unoptimized
            className="object-cover"
            sizes="112px"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-neutral-400">
            No image
          </div>
        )}
      </div>

      <div className="relative min-w-0 flex-1 bg-black px-3 py-3 text-white sm:px-4">
        <button
          type="button"
          onClick={() => onDismiss(item.toastId)}
          className="absolute top-2 right-2 rounded-md p-1 text-white/45 transition-colors hover:bg-white/10 hover:text-white/75"
          aria-label="Dismiss notification"
        >
          <XIcon className="size-4" />
        </button>

        <p className="pr-6 text-sm leading-snug text-white/90">
          <span className="font-medium text-white">{item.buyer_display_name}</span>{" "}
          from {item.region} purchased
        </p>
        <p className="mt-1 pr-4 text-sm font-semibold leading-snug">
          {item.product_name}
        </p>
        <p className="mt-1 text-xs text-white/55">
          {formatRelativeTime(item.purchased_at)}
        </p>
      </div>
    </div>
  );
}
