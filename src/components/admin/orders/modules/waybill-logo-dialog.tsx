"use client";

import { XIcon } from "lucide-react";
import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { alertErrorClassName, segmentListClassName, segmentTabClassName } from "@/lib/panel-styles";
import { cn } from "@/lib/utils";

export type WaybillLogoChoice =
  | { kind: "jt" }
  | { kind: "lalamove" }
  | { kind: "custom"; dataUrl: string; fileName: string };

const LOGO_KINDS = [
  { id: "jt" as const, label: "J&T Express" },
  { id: "lalamove" as const, label: "Lalamove" },
  { id: "custom" as const, label: "Custom logo" },
];

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

type WaybillLogoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: WaybillLogoChoice;
  onConfirm: (choice: WaybillLogoChoice) => void;
  /** When true, confirm label emphasizes printing after apply. */
  confirmForPrint?: boolean;
};

export function WaybillLogoDialog({
  open,
  onOpenChange,
  value,
  onConfirm,
  confirmForPrint = false,
}: WaybillLogoDialogProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<"jt" | "lalamove" | "custom">(value.kind);
  const [customDataUrl, setCustomDataUrl] = useState(
    value.kind === "custom" ? value.dataUrl : "",
  );
  const [customFileName, setCustomFileName] = useState(
    value.kind === "custom" ? value.fileName : "",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setKind(value.kind);
    setCustomDataUrl(value.kind === "custom" ? value.dataUrl : "");
    setCustomFileName(value.kind === "custom" ? value.fileName : "");
    setError(null);
  }, [open, value]);

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
      setCustomDataUrl(dataUrl);
      setCustomFileName(file.name);
      setKind("custom");
      setError(null);
    } catch {
      setError("Failed to read the selected file.");
    }
  };

  const handleConfirm = () => {
    if (kind === "custom") {
      if (!customDataUrl) {
        setError("Upload a JPG, PNG, WEBP, or SVG logo to continue.");
        return;
      }
      onConfirm({
        kind: "custom",
        dataUrl: customDataUrl,
        fileName: customFileName || "custom-logo",
      });
      return;
    }
    onConfirm({ kind });
  };

  const previewSrc =
    kind === "jt"
      ? "/j%26t-logo.svg?v=2"
      : kind === "lalamove"
        ? "/lalamove-logo.webp"
        : customDataUrl || null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="no-print sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose waybill logo</DialogTitle>
          <DialogDescription>
            Select J&amp;T Express, Lalamove, or upload a custom logo. Custom
            uploads allow JPG, PNG, WEBP, and SVG only.
          </DialogDescription>
        </DialogHeader>

        <div
          role="tablist"
          aria-label="Waybill logo options"
          className={cn(segmentListClassName, "flex-wrap")}
        >
          {LOGO_KINDS.map((option) => {
            const isActive = kind === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setKind(option.id);
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
              setKind("custom");
              setError(null);
              fileInputRef.current?.click();
            }}
            aria-label={
              kind === "custom" && customDataUrl
                ? "Replace custom logo"
                : "Upload a custom logo"
            }
          >
            {previewSrc && kind !== "custom" ? (
              // eslint-disable-next-line @next/next/no-img-element -- preview of static logo
              <img
                src={previewSrc}
                alt="Selected waybill logo preview"
                className="pointer-events-none max-h-14 max-w-full object-contain"
              />
            ) : customDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- preview of uploaded logo
              <img
                src={customDataUrl}
                alt="Uploaded custom logo preview"
                className="pointer-events-none max-h-14 max-w-full object-contain"
              />
            ) : (
              <p className="text-xs text-black/45">
                Click to upload JPG, PNG, WEBP, or SVG
              </p>
            )}
            {kind === "custom" && customFileName ? (
              <p className="max-w-full truncate text-[11px] text-black/50">
                {customFileName}
              </p>
            ) : null}
          </button>

          {kind === "custom" && customDataUrl ? (
            <button
              type="button"
              className="absolute top-2 right-2 z-20 inline-flex size-7 items-center justify-center rounded-md border border-black/10 bg-white text-black shadow-sm hover:bg-neutral-100"
              aria-label="Remove uploaded logo"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setCustomDataUrl("");
                setCustomFileName("");
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

        {error ? (
          <p className={alertErrorClassName} role="alert">
            {error}
          </p>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose
            nativeButton={false}
            render={<Button type="button" variant="outline" />}
          >
            Cancel
          </DialogClose>
          <Button type="button" onClick={handleConfirm}>
            {confirmForPrint ? "Apply & print" : "Apply logo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
