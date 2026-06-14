"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2Icon, PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { readFileAsDataUrl, toImagePreviewSrc } from "@/lib/read-image-base64";

export type ProductImageSlotVariant = "hero" | "wide" | "tile";

type ProductImageSlotProps = {
  id?: string;
  label: string;
  hint?: string;
  required?: boolean;
  hasError?: boolean;
  /** When true, label is screen-reader only (use a section label above the group). */
  hideLabel?: boolean;
  value: string | null;
  onChange: (base64: string | null) => void;
  disabled?: boolean;
  className?: string;
  /** hero = full-width; wide = 2-col span (placeholder); tile = 1-col square (gallery/sizing) */
  variant?: ProductImageSlotVariant;
};

const emptyFrameClass: Record<ProductImageSlotVariant, string> = {
  hero: "aspect-[16/10] min-h-[140px]",
  wide: "aspect-[2/1] min-h-[120px]",
  tile: "aspect-square min-h-[88px]",
};

const frameBaseClass =
  "relative w-full overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-neutral-50/90 transition-colors";

export function ProductImageSlot({
  id,
  label,
  hint,
  required = false,
  hideLabel = false,
  value,
  onChange,
  disabled = false,
  hasError = false,
  variant = "hero",
  className,
}: ProductImageSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    setLocalError(null);
    setReading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onChange(dataUrl);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setReading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const isTile = variant === "tile";
  const showLabelAbove = !hideLabel;

  return (
    <div id={id} className={cn("flex flex-col gap-2", className)}>
      {showLabelAbove ? (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <span
              className={cn(
                "text-xs font-medium text-neutral-800",
                hasError && "text-red-700",
              )}
            >
              {label}
              {required && <span className="text-destructive"> *</span>}
            </span>
            {/* {value && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-neutral-900"
                disabled={disabled || reading}
                onClick={() => {
                  setLocalError(null);
                  onChange(null);
                }}
              >
                Clear
              </button>
            )} */}
          </div>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          {hasError && !value ? (
            <p className="text-xs text-red-600">Placeholder 1 is required.</p>
          ) : null}
        </>
      ) : null}

      <div
        className={cn(
          frameBaseClass,
          hasError &&
            !value &&
            "border-red-500 ring-2 ring-red-200 hover:border-red-500 hover:bg-red-50/40",
          value
            ? "border-solid border-neutral-200 bg-white shadow-sm"
            : cn(
                emptyFrameClass[variant],
                "flex flex-col items-center justify-center hover:border-neutral-400 hover:bg-neutral-100/80",
              ),
        )}
      >
        {!showLabelAbove ? (
          <span className="sr-only">
            {label}
            {required ? " (required)" : ""}
          </span>
        ) : null}
        {value ? (
          <>
            <img
              src={toImagePreviewSrc(value)}
              alt=""
              className="block h-auto w-full"
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent p-2">
              <Button
                type="button"
                size="xs"
                variant="secondary"
                disabled={disabled || reading}
                onClick={() => inputRef.current?.click()}
              >
                Replace
              </Button>
              <Button
                type="button"
                size="xs"
                variant="secondary"
                disabled={disabled || reading}
                onClick={() => onChange(null)}
                aria-label="Remove Image"
              >
                <XIcon className="size-3.5" />
              </Button>
            </div>
          </>
        ) : (
          <button
            type="button"
            disabled={disabled || reading}
            onClick={() => inputRef.current?.click()}
            className="flex size-full flex-col items-center justify-center gap-2 p-4 text-muted-foreground transition-colors hover:bg-neutral-100/80 disabled:pointer-events-none disabled:opacity-50"
          >
            {reading ? (
              <Loader2Icon
                className={cn("animate-spin", isTile ? "size-6" : "size-8")}
              />
            ) : isTile ? (
              <PlusIcon className="size-7 opacity-50" strokeWidth={1.5} />
            ) : (
              <ImageIcon className="size-8 opacity-60" />
            )}
            {!isTile && (
              <span className="text-xs font-medium">
                {reading ? "Reading…" : "Upload Image"}
              </span>
            )}
          </button>
        )}
      </div>

      {localError && (
        <p className="text-xs text-destructive" role="alert">
          {localError}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled || reading}
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
