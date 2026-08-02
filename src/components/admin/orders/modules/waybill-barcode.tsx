"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { cn } from "@/lib/utils";

type WaybillBarcodeProps = {
  value: string;
  className?: string;
  /** Stretch SVG across the container (main tracking barcode). */
  fullWidth?: boolean;
  /** Bar height in SVG user units (JsBarcode `height`). */
  barHeight?: number;
};

/** Scannable Code128 barcode. */
export function WaybillBarcode({
  value,
  className,
  fullWidth = false,
  barHeight = 40,
}: WaybillBarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const trimmed = value.trim();

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !trimmed) {
      return;
    }

    try {
      JsBarcode(svg, trimmed, {
        format: "CODE128",
        displayValue: false,
        margin: 0,
        height: barHeight,
        width: fullWidth ? 1.6 : 1.2,
        background: "#ffffff",
        lineColor: "#000000",
      });
    } catch {
      // Invalid characters for Code128 — leave empty SVG.
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
    }
  }, [trimmed, fullWidth, barHeight]);

  if (!trimmed) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex w-full items-center overflow-hidden bg-white",
        fullWidth ? "justify-stretch px-3" : "justify-center",
        className,
      )}
      aria-hidden
    >
      <svg
        ref={svgRef}
        className={cn(
          "max-h-full",
          fullWidth ? "h-full w-full" : "h-full w-auto max-w-full",
        )}
      />
    </div>
  );
}
