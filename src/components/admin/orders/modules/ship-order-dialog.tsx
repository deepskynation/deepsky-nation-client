"use client";

import { XIcon } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
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
} from "@/lib/panel-styles";
import { cn } from "@/lib/utils";
import type {
  AdminShipOrderDetails,
  ApiOrder,
  WaybillLogoType,
  WaybillPaymentMethod,
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
  { id: "jt" as const, label: "J&T" },
  { id: "lalamove" as const, label: "Lalamove" },
  { id: "deepsky" as const, label: "Deepsky" },
  { id: "custom" as const, label: "Custom" },
];

const COURIER_BY_LOGO: Record<Exclude<WaybillLogoType, "custom">, string> = {
  jt: "J&T Express",
  lalamove: "Lalamove",
  deepsky: "Deepsky Clothing",
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
  return (
    value === "jt" ||
    value === "lalamove" ||
    value === "deepsky" ||
    value === "custom"
  );
}

function isWaybillPaymentMethod(
  value: string | null | undefined,
): value is WaybillPaymentMethod {
  return value === "cod" || value === "online_transfer";
}

function formStateFromInitial(
  order: ApiOrder,
  initialValues?: Partial<AdminShipOrderDetails> | null,
) {
  const logoType = isWaybillLogoType(initialValues?.waybillLogoType)
    ? initialValues.waybillLogoType
    : ("jt" as WaybillLogoType);
  const customLogoUrl =
    logoType === "custom" ? (initialValues?.waybillLogoUrl ?? "") : "";
  const paymentFromOrder = isWaybillPaymentMethod(order.payment.payment_method)
    ? order.payment.payment_method
    : ("cod" as WaybillPaymentMethod);
  const paymentMethod = isWaybillPaymentMethod(initialValues?.waybillPaymentMethod)
    ? initialValues.waybillPaymentMethod
    : paymentFromOrder;

  return {
    logoType,
    customLogoUrl,
    customLogoFileName: customLogoUrl ? "custom-logo" : "",
    trackingNumber: initialValues?.trackingNumber ?? "",
    packageWeightKg: initialValues?.packageWeightKg ?? "",
    customCourier:
      logoType === "custom" ? (initialValues?.courier ?? "") : "",
    paymentMethod,
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
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const previewSheetRef = useRef<HTMLDivElement>(null);
  const orderId = order.id;

  const [logoType, setLogoType] = useState<WaybillLogoType>("jt");
  const [customLogoUrl, setCustomLogoUrl] = useState("");
  const [customLogoFileName, setCustomLogoFileName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [packageWeightKg, setPackageWeightKg] = useState("");
  const [customCourier, setCustomCourier] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<WaybillPaymentMethod>("cod");
  const [error, setError] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

  // Only hydrate when the dialog opens. Re-running on `order` / `initialValues`
  // identity changes resets fields mid-typing (courier name especially).
  useEffect(() => {
    if (!open) {
      return;
    }
    const next = formStateFromInitial(order, initialValues);
    setLogoType(next.logoType);
    setCustomLogoUrl(next.customLogoUrl);
    setCustomLogoFileName(next.customLogoFileName);
    setTrackingNumber(next.trackingNumber);
    setPackageWeightKg(next.packageWeightKg);
    setCustomCourier(next.customCourier);
    setPaymentMethod(next.paymentMethod);
    setError(next.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once per open
  }, [open]);

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
        waybillPaymentMethod: paymentMethod,
      }),
    [
      order,
      draftCourier,
      trackingNumber,
      packageWeightKg,
      logoType,
      customLogoUrl,
      paymentMethod,
    ],
  );

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const viewport = previewViewportRef.current;
    const sheet = previewSheetRef.current;
    if (!viewport || !sheet) {
      return;
    }

    const updateScale = () => {
      const availableWidth = viewport.clientWidth;
      const availableHeight = viewport.clientHeight;
      const naturalWidth = sheet.scrollWidth;
      const naturalHeight = sheet.scrollHeight;
      if (naturalWidth <= 0 || naturalHeight <= 0) {
        return;
      }
      const next = Math.min(
        availableWidth / naturalWidth,
        availableHeight / naturalHeight,
        1,
      );
      const scale = Number.isFinite(next) && next > 0 ? next * 0.96 : 1;
      setPreviewScale((prev) => (prev === scale ? prev : scale));
      setPreviewSize((prev) => {
        const width = naturalWidth * scale;
        const height = naturalHeight * scale;
        if (prev.width === width && prev.height === height) {
          return prev;
        }
        return { width, height };
      });
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(viewport);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [open, logoType, customLogoUrl]);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      const next = formStateFromInitial(order, null);
      setLogoType(next.logoType);
      setCustomLogoUrl(next.customLogoUrl);
      setCustomLogoFileName(next.customLogoFileName);
      setTrackingNumber(next.trackingNumber);
      setPackageWeightKg(next.packageWeightKg);
      setCustomCourier(next.customCourier);
      setPaymentMethod(next.paymentMethod);
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
      waybillPaymentMethod: paymentMethod,
    });
    handleClose(false);
  };

  const previewSrc =
    logoType === "jt"
      ? "/j%26t-logo.svg?v=2"
      : logoType === "lalamove"
        ? "/lalamove-logo.webp"
        : logoType === "deepsky"
          ? "/deepsky-logo.png"
          : customLogoUrl || null;

  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton
        className={cn(
          "fixed inset-3 top-3 left-3 right-3 bottom-3 flex h-auto max-h-[calc(100dvh-1.5rem)] w-auto max-w-none",
          "translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-xl p-0",
          "sm:max-w-none data-open:zoom-in-100 data-closed:zoom-out-100",
        )}
      >
        <DialogHeader className="shrink-0 border-b border-black/5 px-6 py-3 pr-12">
          <DialogTitle>{isEdit ? "(Edit Waybill)" : "(Set up Waybill)"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update courier, weight, and logo. Preview updates as you type."
              : "Fill in shipping details. The label preview on the right updates live."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-0 lg:grid-rows-1 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
          <div className="space-y-3 overflow-y-auto border-b border-black/5 px-6 py-4 lg:overflow-visible lg:border-r lg:border-b-0">
            <div className="space-y-2">
              <p className={labelClassName}>Courier logo</p>
              <div
                role="tablist"
                aria-label="Waybill logo options"
                className="flex w-full flex-nowrap gap-1 rounded-lg bg-neutral-100/90 p-1"
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
                      className={cn(
                        "min-w-0 flex-1 rounded-md px-1.5 py-2 text-center text-xs font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-neutral-300",
                        isActive
                          ? "bg-white text-neutral-900 shadow-sm"
                          : "text-neutral-600 hover:text-neutral-900",
                      )}
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
                onWheel={(event) => {
                  // Prevent scroll from changing the number while the field is focused.
                  event.currentTarget.blur();
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
            <div
              ref={previewViewportRef}
              className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-2"
            >
              <div
                className="shrink-0 overflow-hidden"
                style={{
                  width: previewSize.width || undefined,
                  height: previewSize.height || undefined,
                }}
              >
                <div
                  ref={previewSheetRef}
                  className="origin-top-left"
                  style={{
                    transform: `scale(${previewScale})`,
                    width: "105mm",
                  }}
                >
                  <PrintOrderDetails data={livePreview} />
                </div>
              </div>
            </div>
            <p className="no-print shrink-0 px-4 pb-2 text-[11px] text-neutral-500">
              Sorting / hub codes update after you save the waybill.
            </p>
          </div>
        </div>

        <DialogFooter className="mb-3 shrink-0 gap-2 border-t border-black/5 px-6 pt-3 pb-4 sm:justify-end">
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
