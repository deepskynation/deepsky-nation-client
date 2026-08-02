"use client";

import { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getWaybillPublicUrl } from "@/lib/waybill-public-url";
import { cn } from "@/lib/utils";

type WaybillQrCodeProps = {
  orderNumber: string;
  className?: string;
};

/** Scannable QR encoding the public waybill URL for this order number. */
export function WaybillQrCode({
  orderNumber,
  className,
}: WaybillQrCodeProps) {
  const trimmed = orderNumber.trim().replace(/^#/, "");
  const url = useMemo(() => getWaybillPublicUrl(trimmed), [trimmed]);

  if (!trimmed) {
    return null;
  }

  return (
    <div
      className={cn(
        "aspect-square w-full border border-black bg-white p-[2px]",
        className,
      )}
      aria-label={`QR code linking to ${url}`}
    >
      <QRCodeSVG
        value={url}
        size={128}
        level="M"
        includeMargin={false}
        bgColor="#ffffff"
        fgColor="#000000"
        className="h-full w-full"
      />
    </div>
  );
}
