"use client";

import { useEffect, useState } from "react";
import { Loader2Icon, PackageXIcon, PrinterIcon } from "lucide-react";
import PrintOrderDetails from "@/components/admin/orders/modules/print-order-details";
import { GlassMessagePanel } from "@/components/common/feedback/glass-message-panel";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-config";
import {
  publicWaybillToPrintData,
  type PublicWaybillApiResponse,
} from "@/lib/order-to-waybill";
import type { WaybillPrintData } from "@/mock/waybill";

type PublicWaybillViewProps = {
  orderNumber: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: WaybillPrintData };

export function PublicWaybillView({ orderNumber }: PublicWaybillViewProps) {
  const trimmed = orderNumber.trim().replace(/^#/, "");
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!trimmed) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(
          apiUrl(`/api/public/waybill/${encodeURIComponent(trimmed)}`),
          { signal: controller.signal },
        );
        if (!response.ok) {
          if (cancelled) return;
          setState({
            status: "error",
            message:
              response.status === 404
                ? "No waybill was found for this order."
                : "Could not load this waybill. Try again later.",
          });
          return;
        }
        const payload = (await response.json()) as PublicWaybillApiResponse;
        if (cancelled) return;
        setState({
          status: "ready",
          data: publicWaybillToPrintData(payload),
        });
      } catch (error) {
        if (cancelled || controller.signal.aborted) return;
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Could not load this waybill. Try again later.",
        });
      }
    }

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [trimmed]);

  if (!trimmed) {
    return (
      <GlassMessagePanel
        title="Waybill not found"
        description="Missing order number."
        icon={<PackageXIcon className="size-12 text-red-600" aria-hidden />}
        action={{ href: "/", label: "Back To Shop", variant: "button" }}
      />
    );
  }

  if (state.status === "loading") {
    return (
      <GlassMessagePanel
        title="Loading waybill"
        description="Fetching shipping label details…"
        icon={
          <Loader2Icon
            className="size-12 text-black/40 motion-safe:animate-spin"
            aria-hidden
          />
        }
      />
    );
  }

  if (state.status === "error") {
    return (
      <GlassMessagePanel
        title="Waybill not found"
        description={state.message}
        icon={<PackageXIcon className="size-12 text-red-600" aria-hidden />}
        action={{ href: "/", label: "Back To Shop", variant: "button" }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-8">
      <div className="no-print flex w-full max-w-[105mm] justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.print()}
        >
          <PrinterIcon className="size-4" aria-hidden />
          Print
        </Button>
      </div>
      <PrintOrderDetails data={state.data} />
    </div>
  );
}
