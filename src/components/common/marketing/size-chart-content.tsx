"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckoutImagePreviewDialog } from "@/components/user/checkout/modules/checkout-image-preview-dialog";
import { cn } from "@/lib/utils";

const SIZE_CHART_BANNER_SRC = "/deepsky_logo_v2.jpg";
const SIZE_CHART_BANNER_ALT = "Deepsky size chart banner";
const SIZE_CHART_DESCRIPTION =
  "Use this guide to find the right fit for our tees and tops. Tap the chart to zoom in.";
const SIZE_CHART_IMAGE_SRC = "/tshirt-sizing.jpg";
const SIZE_CHART_IMAGE_ALT = "T-shirt size chart";

export type SizeChartHeroBannerProps = {
  bannerImageSrc?: string;
  bannerImageAlt?: string;
  className?: string;
};

export function SizeChartHeroBanner({
  bannerImageSrc = SIZE_CHART_BANNER_SRC,
  bannerImageAlt = SIZE_CHART_BANNER_ALT,
  className,
}: SizeChartHeroBannerProps) {
  return (
    <section
      className={cn(
        "relative h-[140px] w-full overflow-hidden sm:h-[160px] md:h-[180px]",
        className,
      )}
    >
      <Image
        src={bannerImageSrc}
        alt={bannerImageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
    </section>
  );
}

export type SizeChartContentProps = {
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

export function SizeChartContent({
  description = SIZE_CHART_DESCRIPTION,
  imageSrc = SIZE_CHART_IMAGE_SRC,
  imageAlt = SIZE_CHART_IMAGE_ALT,
  className,
}: SizeChartContentProps) {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  return (
    <>
      <div className={className}>
        <p className="mb-8 text-sm text-black/55">{description}</p>

        <button
          type="button"
          onClick={() => setImagePreviewOpen(true)}
          aria-label="View size chart full size"
          className="relative mx-auto block aspect-[2048/1448] w-full max-w-2xl cursor-zoom-in overflow-hidden rounded-lg border border-black/10 bg-white/50 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40"
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1000}
            height={1000}
            sizes="(max-width: 768px) 100vw, 672px"
            className="h-full w-full object-contain"
          />
        </button>
      </div>

      <CheckoutImagePreviewDialog
        open={imagePreviewOpen}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        onOpenChange={setImagePreviewOpen}
      />
    </>
  );
}
