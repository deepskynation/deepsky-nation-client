"use client";

import { useRef, useState } from "react";
import { Banknote, Check, ImagePlus, Upload, X } from "lucide-react";
import { glassHighlightFlatClassName, glassInputFlatClassName } from "@/lib/glass-styles";
import {
  NON_COD_PAYMENT_INSTRUCTIONS,
  type CheckoutPaymentMethod,
} from "@/lib/checkout-payment";
import { readFileAsDataUrl } from "@/lib/read-image-base64";
import { cn } from "@/lib/utils";

function paymentOptionClass(selected: boolean) {
  return cn(
    "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
    selected
      ? "border-neutral-400 bg-neutral-200 ring-1 ring-neutral-300/80"
      : "border-black/15 bg-white/60 hover:bg-neutral-50",
  );
}

type CheckoutPaymentMethodProps = {
  method: CheckoutPaymentMethod;
  proofPreview: string | null;
  onMethodChange: (method: CheckoutPaymentMethod) => void;
  onProofChange: (dataUrl: string | null) => void;
};

export function CheckoutPaymentMethodSection({
  method,
  proofPreview,
  onMethodChange,
  onProofChange,
}: CheckoutPaymentMethodProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      onProofChange(dataUrl);
      setUploadError(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not read image.");
    }
  };

  const clearProof = () => {
    onProofChange(null);
    setUploadError(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-black/80">Payment Method</p>

      <div className="space-y-2" role="radiogroup" aria-label="Payment Method">
        <button
          type="button"
          role="radio"
          aria-checked={method === "cod"}
          onClick={() => onMethodChange("cod")}
          className={paymentOptionClass(method === "cod")}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-black text-white">
            <Banknote className="size-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-black">COD</span>
            <span className="block text-xs text-black/55">
              Cash on Delivery — pay when your order arrives
            </span>
          </span>
          {method === "cod" && <Check className="size-4 shrink-0 text-black" aria-hidden />}
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={method === "non-cod"}
          onClick={() => onMethodChange("non-cod")}
          className={paymentOptionClass(method === "non-cod")}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-600 text-white">
            <Upload className="size-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-black">Non-COD</span>
            <span className="block text-xs text-black/55">
              Pay first (GCash / bank) — upload receipt to checkout
            </span>
          </span>
          {method === "non-cod" && (
            <Check className="size-4 shrink-0 text-black" aria-hidden />
          )}
        </button>
      </div>

      {method === "non-cod" && (
        <div className="space-y-4 rounded-xl border border-black/10 bg-neutral-50/80 p-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-black">
              {NON_COD_PAYMENT_INSTRUCTIONS.title}
            </p>
            <p className="text-xs leading-relaxed text-black/60">
              {NON_COD_PAYMENT_INSTRUCTIONS.intro}
            </p>
            <ol className="list-decimal space-y-1.5 pl-4 text-xs text-black/70">
              {NON_COD_PAYMENT_INSTRUCTIONS.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div className={cn(glassHighlightFlatClassName, "flex-col items-stretch gap-2")}>
            {NON_COD_PAYMENT_INSTRUCTIONS.accounts.map((row) => (
              <div
                key={row.label}
                className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-sm"
              >
                <span className="text-black/55">{row.label}</span>
                <span className="font-medium text-black">{row.value}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-black/55">{NON_COD_PAYMENT_INSTRUCTIONS.note}</p>

          <div className="space-y-2">
            <p className="text-sm font-medium text-black">Payment Receipt *</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />
            {!proofPreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  glassInputFlatClassName,
                  "flex min-h-[120px] w-full flex-col items-center justify-center gap-2 border-dashed text-black/55 hover:bg-white",
                )}
              >
                <ImagePlus className="size-8 text-black/35" aria-hidden />
                <span className="text-sm font-medium">Upload Payment Screenshot</span>
                <span className="text-xs">PNG, JPG, or WEBP · max 5 MB</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="relative overflow-hidden rounded-lg border border-black/10 bg-white">
                  <img
                    src={proofPreview}
                    alt="Payment Receipt preview"
                    className="max-h-48 w-full object-contain"
                  />
                  <ButtonRemoveProof onClick={clearProof} />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-medium text-black/70 underline-offset-2 hover:text-black hover:underline"
                >
                  Replace image
                </button>
              </div>
            )}
            {uploadError && (
              <p className="text-sm text-red-600" role="alert">
                {uploadError}
              </p>
            )}
            {!proofPreview && (
              <p className="text-xs text-amber-800">
                Upload your receipt to enable checkout.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ButtonRemoveProof({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
      aria-label="Remove Payment Receipt"
    >
      <X className="size-4" />
    </button>
  );
}
