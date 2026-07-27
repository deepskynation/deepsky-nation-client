"use client";

import { XIcon } from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import PrintOrderDetails from "@/components/admin/orders/modules/print-order-details";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildWaybillDraftPreview } from "@/lib/order-to-waybill";
import {
  alertErrorClassName,
  fieldClassName,
  labelClassName,
  segmentListClassName,
  segmentTabClassName,
} from "@/lib/panel-styles";
import { cn } from "@/lib/utils";
import type {
  AdminShipOrderDetails,
  ApiOrder,
  WaybillLogoType,
} from "@/types/order";

export type WaybillDialogMode = "create" | "edit";

type ShipOrderDialogProps = {
  order: ApiOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
  mode?: WaybillDialogMode;
  initialValues?: Partial<AdminShipOrderDetails> | null;
  onConfirm: (details: AdminShipOrderDetails) => void;
};

const LOGO_KINDS = [
  { id: "jt" as const, label: "J&T Express" },
  { id: "lalamove" as const, label: "Lalamove" },
  { id: "custom" as const, label: "Custom logo" },
];

const COURIER_BY_LOGO: Record<Exclude<WaybillLogoType, "custom">, string> = {
  jt: "J&T Express",
  lalamove: "Lalamove",
};

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "svg"]);
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

function getExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? (parts.at(-1) ?? "") : "";
}

function isAllowedLogoFile(file: File): boolean {
  const ext = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return false;
  }
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    return false;
  }
  return true;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Could not read file."));
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

function isWaybillLogoType(value: string | null | undefined): value is WaybillLogoType {
  return value === "jt" || value === "lalamove" || value === "custom";
}

function formStateFromInitial(
  initialValues?: Partial<AdminShipOrderDetails> | null,
) {
  const logoType = isWaybillLogoType(initialValues?.waybillLogoType)
    ? initialValues.waybillLogoType
    : ("jt" as WaybillLogoType);
  const customLogoUrl =
    logoType === "custom" ? (initialValues?.waybillLogoUrl ?? "") : "";

  return {
    logoType,
    customLogoUrl,
    customLogoFileName: customLogoUrl ? "custom-logo" : "",
    trackingNumber: initialValues?.trackingNumber ?? "",
    packageWeightKg: initialValues?.packageWeightKg ?? "",
    customCourier:
      logoType === "custom" ? (initialValues?.courier ?? "") : "",
    error: null as string | null,
  };
}

export function ShipOrderDialog({
  order,
  open,
  onOpenChange,
  isSubmitting = false,
  mode = "create",
  initialValues = null,
  onConfirm,
}: ShipOrderDialogProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const orderId = order.id;

  const [logoType, setLogoType] = useState<WaybillLogoType>("jt");
  const [customLogoUrl, setCustomLogoUrl] = useState("");
  const [customLogoFileName, setCustomLogoFileName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [packageWeightKg, setPackageWeightKg] = useState("");
  const [customCourier, setCustomCourier] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const next = formStateFromInitial(initialValues);
    setLogoType(next.logoType);
    setCustomLogoUrl(next.customLogoUrl);
    setCustomLogoFileName(next.customLogoFileName);
    setTrackingNumber(next.trackingNumber);
    setPackageWeightKg(next.packageWeightKg);
    setCustomCourier(next.customCourier);
    setError(next.error);
  }, [open, initialValues]);

  const draftCourier =
    logoType === "custom"
      ? customCourier.trim() || "Custom courier"
      : COURIER_BY_LOGO[logoType];

  const livePreview = useMemo(
    () =>
      buildWaybillDraftPreview(order, {
        courier: draftCourier,
        trackingNumber,
        packageWeightKg,
        waybillLogoType: logoType,
        waybillLogoUrl: logoType === "custom" ? customLogoUrl : null,
      }),
    [
      order,
      draftCourier,
      trackingNumber,
      packageWeightKg,
      logoType,
      customLogoUrl,
    ],
  );

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      const next = formStateFromInitial(null);
      setLogoType(next.logoType);
      setCustomLogoUrl(next.customLogoUrl);
      setCustomLogoFileName(next.customLogoFileName);
      setTrackingNumber(next.trackingNumber);
      setPackageWeightKg(next.packageWeightKg);
      setCustomCourier(next.customCourier);
      setError(next.error);
    }
    onOpenChange(nextOpen);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (!isAllowedLogoFile(file)) {
      setError("Only JPG, PNG, WEBP, or SVG files are allowed.");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCustomLogoUrl(dataUrl);
      setCustomLogoFileName(file.name);
      setLogoType("custom");
      setError(null);
    } catch {
      setError("Failed to read the selected file.");
    }
  };

  const handleConfirm = () => {
    const trimmedTracking = trackingNumber.trim();
    const trimmedWeight = packageWeightKg.trim();
    const weightValue = Number(trimmedWeight);

    if (!trimmedTracking) {
      setError("Tracking number is required.");
      return;
    }
    if (!trimmedWeight || Number.isNaN(weightValue) || weightValue <= 0) {
      setError("Package weight must be a positive number.");
      return;
    }
    if (logoType === "custom" && !customLogoUrl) {
      setError("Upload a custom logo to continue.");
      return;
    }

    const courier =
      logoType === "custom"
        ? customCourier.trim() || "Custom courier"
        : COURIER_BY_LOGO[logoType];

    setError(null);
    onConfirm({
      courier,
      trackingNumber: trimmedTracking,
      packageWeightKg: trimmedWeight,
      waybillLogoType: logoType,
      waybillLogoUrl: logoType === "custom" ? customLogoUrl : null,
    });
    handleClose(false);
  };

  const previewSrc =
    logoType === "jt"
      ? "/j%26t-logo.svg?v=2"
      : logoType === "lalamove"
        ? "/lalamove-logo.webp"
        : customLogoUrl || null;

  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b border-black/5 px-6 py-4">
          <DialogTitle>{isEdit ? "Edit waybill" : "Set up waybill"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update courier, tracking, weight, and logo. Preview updates as you type."
              : "Fill in shipping details. The label preview on the right updates live."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div className="space-y-4 overflow-y-auto border-b border-black/5 px-6 py-4 lg:border-r lg:border-b-0">
            <div className="space-y-2">
              <p className={labelClassName}>Courier logo</p>
              <div
                role="tablist"
                aria-label="Waybill logo options"
                className={cn(segmentListClassName, "flex-wrap")}
              >
                {LOGO_KINDS.map((option) => {
                  const isActive = logoType === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setLogoType(option.id);
                        setError(null);
                      }}
                      className={segmentTabClassName(isActive)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <input
                ref={fileInputRef}
                id={fileInputId}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
                className="sr-only"
                onChange={(event) => {
                  void handleFileChange(event);
                }}
              />

              <div className="relative">
                <button
                  type="button"
                  className={cn(
                    "flex h-20 w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-black/15 bg-neutral-50 px-4 pr-10 text-center transition-colors",
                    "hover:border-black/30 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:outline-none",
                  )}
                  onClick={() => {
                    if (logoType === "custom") {
                      fileInputRef.current?.click();
                      return;
                    }
                    setLogoType("custom");
                    setError(null);
                    fileInputRef.current?.click();
                  }}
                  aria-label={
                    logoType === "custom" && customLogoUrl
                      ? "Replace custom logo"
                      : "Upload a custom logo"
                  }
                >
                  {previewSrc && logoType !== "custom" ? (
                    // eslint-disable-next-line @next/next/no-img-element -- preview of static logo
                    <img
                      src={previewSrc}
                      alt="Selected courier logo preview"
                      className="pointer-events-none max-h-14 max-w-full object-contain"
                    />
                  ) : customLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- preview of uploaded logo
                    <img
                      src={customLogoUrl}
                      alt="Uploaded custom logo preview"
                      className="pointer-events-none max-h-14 max-w-full object-contain"
                    />
                  ) : (
                    <p className="text-xs text-black/45">
                      Click to upload JPG, PNG, WEBP, or SVG
                    </p>
                  )}
                  {logoType === "custom" && customLogoFileName ? (
                    <p className="max-w-full truncate text-[11px] text-black/50">
                      {customLogoFileName}
                    </p>
                  ) : null}
                </button>

                {logoType === "custom" && customLogoUrl ? (
                  <button
                    type="button"
                    className="absolute top-2 right-2 z-20 inline-flex size-7 items-center justify-center rounded-md border border-black/10 bg-white text-black shadow-sm hover:bg-neutral-100"
                    aria-label="Remove uploaded logo"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setCustomLogoUrl("");
                      setCustomLogoFileName("");
                      setError(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <XIcon className="size-3.5" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor={`ship-tracking-${orderId}`} className={labelClassName}>
                Tracking number
              </label>
              <input
                id={`ship-tracking-${orderId}`}
                className={fieldClassName}
                value={trackingNumber}
                onChange={(event) => {
                  setTrackingNumber(event.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. DSN971234567890"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={`ship-weight-${orderId}`} className={labelClassName}>
                Package weight (kg)
              </label>
              <input
                id={`ship-weight-${orderId}`}
                type="number"
                min="0"
                step="0.001"
                className={fieldClassName}
                value={packageWeightKg}
                onChange={(event) => {
                  setPackageWeightKg(event.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. 1.250"
              />
            </div>

            {logoType === "custom" ? (
              <div className="space-y-2">
                <label htmlFor={`ship-courier-${orderId}`} className={labelClassName}>
                  Courier name
                </label>
                <input
                  id={`ship-courier-${orderId}`}
                  className={fieldClassName}
                  value={customCourier}
                  onChange={(event) => {
                    setCustomCourier(event.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. Flash Express"
                />
              </div>
            ) : null}

            {error ? (
              <p className={alertErrorClassName} role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden bg-neutral-50/80">
            <p className="no-print shrink-0 px-4 pt-3 text-xs font-medium tracking-wide text-neutral-500 uppercase">
              Live preview
            </p>
            <div className="flex min-h-0 flex-1 justify-center overflow-auto px-4 py-3">
              <div className="origin-top scale-[0.85] sm:scale-90 lg:scale-[0.78] xl:scale-90">
                <PrintOrderDetails data={livePreview} />
              </div>
            </div>
            <p className="no-print shrink-0 px-4 pb-3 text-[11px] text-neutral-500">
              Sorting / hub codes update after you save the waybill.
            </p>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-black/5 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={handleConfirm}>
            Save waybill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
