"use client";

import { useCallback, useEffect, useState } from "react";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

type CheckoutImagePreviewDialogProps = {
  open: boolean;
  imageSrc: string | null;
  imageAlt?: string;
  onOpenChange: (open: boolean) => void;
};

export function CheckoutImagePreviewDialog({
  open,
  imageSrc,
  imageAlt = "Product Image Preview",
  onOpenChange,
}: CheckoutImagePreviewDialogProps) {
  const [zoom, setZoom] = useState(MIN_ZOOM);

  const resetZoom = useCallback(() => {
    setZoom(MIN_ZOOM);
  }, []);

  useEffect(() => {
    if (!open) {
      resetZoom();
    }
  }, [open, resetZoom]);

  const zoomIn = () => {
    setZoom((current) => Math.min(MAX_ZOOM, current + ZOOM_STEP));
  };

  const zoomOut = () => {
    setZoom((current) => Math.max(MIN_ZOOM, current - ZOOM_STEP));
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.deltaY < 0) {
      zoomIn();
      return;
    }
    zoomOut();
  };

  return (
    <Dialog open={open && Boolean(imageSrc)} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className={cn(
          "flex w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden",
          "max-h-[calc(100dvh-0.5rem)] border border-black/10 bg-neutral-950/95 p-0 shadow-2xl ring-0",
          "sm:h-auto sm:max-h-[min(92vh,820px)] sm:w-full sm:max-w-[min(96vw,56rem)]",
        )}
      >
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <DialogDescription className="sr-only">
          Enlarged product image. Use zoom controls or scroll to zoom in and out.
        </DialogDescription>

        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
          <p className="min-w-0 flex-1 truncate text-xs text-white/70">{imageAlt}</p>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= MIN_ZOOM}
              className="inline-flex size-8 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Zoom Out"
            >
              <ZoomOut className="size-4" aria-hidden />
            </button>
            <span className="min-w-[3rem] text-center text-xs tabular-nums text-white/70">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= MAX_ZOOM}
              className="inline-flex size-8 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Zoom In"
            >
              <ZoomIn className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              disabled={zoom === MIN_ZOOM}
              className="inline-flex size-8 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Reset Zoom"
            >
              <RotateCcw className="size-4" aria-hidden />
            </button>
          </div>
        </div>

        {imageSrc ? (
          <div
            className="flex min-h-0 flex-1 touch-pan-x touch-pan-y items-center justify-center overflow-auto overscroll-contain p-2 sm:p-4"
            onWheel={handleWheel}
          >
            <img
              src={imageSrc}
              alt={imageAlt}
              draggable={false}
              className="h-auto max-h-[min(calc(100dvh-7rem),680px)] w-auto max-w-full origin-center object-contain transition-transform duration-150 sm:max-h-[min(calc(100vh-8rem),680px)]"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
