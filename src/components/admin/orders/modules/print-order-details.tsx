"use client";

import { WaybillBarcode } from "@/components/admin/orders/modules/waybill-barcode";
import { WaybillQrCode } from "@/components/admin/orders/modules/waybill-qr-code";
import { cn } from "@/lib/utils";
import type { WaybillPrintData } from "@/mock/waybill";

type PrintOrderDetailsProps = {
  data: WaybillPrintData;
  className?: string;
};

function formatSendDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatCodAmount(total: string): string {
  const amount = Number.parseFloat(total);
  if (!Number.isFinite(amount)) {
    return total;
  }
  return amount.toFixed(1);
}

function VerticalLabel({ children }: { children: string }) {
  return (
    <div className="flex w-5 shrink-0 items-center justify-center border-r border-black bg-white">
      <span className="rotate-180 text-[9px] font-bold tracking-[0.2em] uppercase [writing-mode:vertical-rl]">
        {children}
      </span>
    </div>
  );
}

/** Blank courier checklist boxes — static on printed AWB. */
function AttemptBoxes({ label }: { label: string }) {
  return (
    <div className="min-w-0 flex-1 border-l border-black">
      <p className="border-b border-black px-1 py-0.5 text-center text-[7px] font-semibold">
        {label}
      </p>
      <div className="grid grid-cols-2">
        <div className="border-r border-black py-1.5 text-center text-[10px] font-bold">
          1
        </div>
        <div className="py-1.5 text-center text-[10px] font-bold">2</div>
      </div>
    </div>
  );
}

function resolveWaybillLogo(data: WaybillPrintData): {
  src: string;
  alt: string;
} | null {
  if (data.isCustomize) {
    const customSrc = data.custom_logo_url?.trim();
    if (!customSrc) {
      return null;
    }
    return {
      src: customSrc,
      alt: "Custom courier logo",
    };
  }
  if (data.isJT) {
    return { src: "/j%26t-logo.svg?v=2", alt: "J&T Express" };
  }
  if (data.isLalamove) {
    return { src: "/lalamove-logo.webp", alt: "Lalamove" };
  }
  return { src: "/deepsky-logo.png", alt: "Deepsky Nation" };
}

function WaybillHeaderLogo({ data }: { data: WaybillPrintData }) {
  const logo = resolveWaybillLogo(data);
  if (!logo) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static public assets for print
    <img
      src={logo.src}
      alt={logo.alt}
      width={240}
      height={62}
      className="mx-auto h-auto w-[75%] object-contain object-center"
    />
  );
}

/**
 * Printable shipping waybill (A6 / 105×148 mm).
 * Logo follows `isJT` / `isLalamove` / `isCustomize` on mock/live data.
 */
export default function PrintOrderDetails({
  data,
  className,
}: PrintOrderDetailsProps) {
  const isCod = data.payment_method === "cod";
  const itemCount = data.items.reduce((sum, item) => sum + item.quantity, 0);
  const sendDate = formatSendDate(data.shipped_at);
  const expectedDate = data.expected_delivery_date
    ? formatSendDate(`${data.expected_delivery_date}T00:00:00`)
    : sendDate;
  const buyerArea = data.consignee.area ?? data.consignee.city;
  const sellerArea = data.shipper.area ?? data.shipper.city;
  const addressType = data.consignee.address_type ?? "HOME";

  return (
    <>
      <style>{`
        #waybill-print-root {
          position: fixed;
          left: -10000px;
          top: 0;
          visibility: hidden;
          pointer-events: none;
        }
        @media print {
          @page {
            size: 105mm 148mm;
            margin: 0;
          }
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print,
          [data-slot="dialog-overlay"],
          [data-slot="dialog-close"] {
            display: none !important;
          }
          [data-slot="dialog-content"] {
            position: static !important;
            inset: auto !important;
            top: auto !important;
            left: auto !important;
            transform: none !important;
            width: auto !important;
            max-width: none !important;
            max-height: none !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          /* Dialog flow: print the detached root, not the modal or app shell. */
          body:has(#waybill-print-root) > *:not(#waybill-print-root) {
            display: none !important;
          }
          body:has(#waybill-print-root) #waybill-print-root {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            left: auto !important;
            pointer-events: auto !important;
          }
          /* Original inline print flow (component visual, etc.). */
          body * {
            visibility: hidden !important;
          }
          .waybill-print-sheet,
          .waybill-print-sheet * {
            visibility: visible !important;
          }
          .waybill-print-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <article
        className={cn(
          "waybill-print-sheet box-border flex w-[105mm] flex-col border-2 border-black bg-white text-black shadow-sm",
          "font-[Arial,Helvetica,sans-serif]",
          className,
        )}
        aria-label={`Waybill ${data.tracking_number}`}
      >
        {/* Header: logo + order id | destination / hub / sorting */}
        <header className="grid grid-cols-[38%_62%] border-b-2 border-black">
          <div className="flex flex-col border-r-2 border-black">
            <div className="flex h-[40px] items-center justify-center overflow-hidden px-1 py-0.5">
              <WaybillHeaderLogo data={data} />
            </div>
            <div className="border-t border-black px-1.5 py-1">
              <p className="text-[8px] leading-tight">
                <span className="font-bold">Order ID</span>{" "}
                <span className="font-semibold break-all">
                  {data.order_number.replace(/^#/, "")}
                </span>
              </p>
            </div>
          </div>
          <div className="relative flex min-h-[64px] flex-col px-2 py-1">
            <div className="flex items-start justify-between gap-1">
              <p className="text-[11px] leading-none font-bold">
                {data.consignee.city}
              </p>
              <p className="text-[18px] leading-none font-black tracking-tight">
                {data.hub_code}
              </p>
            </div>
            <p className="mt-1 text-[9px] leading-none">
              Send Date: {sendDate}
            </p>
            <p className="mt-auto pt-1 text-center text-[22px] leading-none font-black tracking-tight">
              {data.sorting_code}
            </p>
          </div>
        </header>

        {/* Main barcode — full-width band like PH J&T AWB */}
        <section className="border-b-2 border-black px-0 py-2">
          <WaybillBarcode
            value={data.tracking_number}
            className="h-10"
            fullWidth
            barHeight={40}
          />
          <p className="mt-1 text-center text-[15px] leading-none font-bold tracking-wider">
            {data.tracking_number}
          </p>
        </section>

        {/* BUYER + SELLER with COD watermark */}
        <section className="relative">
          {isCod ? (
            <div
              className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
              aria-hidden
            >
              <span className="text-[56px] leading-none font-black tracking-widest text-black/10 select-none">
                COD
              </span>
            </div>
          ) : null}

          <div className="relative z-10 flex border-b border-black">
            <VerticalLabel>BUYER</VerticalLabel>
            <div className="min-w-0 flex-1 px-1.5 py-1">
              <p className="text-[10px] leading-snug font-bold">
                {data.consignee.name}{" "}
                <span className="font-semibold">{data.consignee.phone}</span>
              </p>
              <p className="mt-0.5 text-[9px] leading-snug">
                {data.consignee.address_line}, {data.consignee.city},{" "}
                {data.consignee.region}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[8px] font-semibold">
                <span>{data.consignee.city}</span>
                <span>{data.consignee.region}</span>
                <span>{addressType}</span>
                <span>{buyerArea}</span>
                <span>{data.consignee.region}</span>
                <span>{data.consignee.postal_code}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex">
            <VerticalLabel>SELLER</VerticalLabel>
            <div className="min-w-0 flex-1 px-1.5 py-1">
              <p className="text-[10px] leading-snug font-bold">
                {data.shipper.phone?.trim() ? (
                  <>
                    {" "}
                    <span className="font-semibold">{data.shipper.phone}</span>
                  </>
                ) : null}
                <span className="font-semibold">{data.shipper.phone}</span>
              </p>
              <p className="mt-0.5 text-[9px] leading-snug">
                {data.shipper.address_line}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[8px] font-semibold">
                <span>{data.shipper.city}</span>
                <span>{data.shipper.region}</span>
                <span>SBD</span>
                <span>{sellerArea}</span>
                <span>{data.shipper.region}</span>
                <span>{expectedDate}</span>
                <span>{data.shipper.postal_code}</span>
              </div>
            </div>
          </div>
        </section>

        {/* QR | qty/weight + small barcode | COD amount */}
        <section className="grid grid-cols-[28%_42%_30%] border-t-2 border-black">
          <div className="border-r border-black p-1.5">
            <WaybillQrCode trackingNumber={data.tracking_number} />
          </div>
          <div className="flex flex-col border-r border-black">
            <div className="border-b border-black px-1.5 py-1.5 text-[9px] leading-snug">
              <p>
                <span className="font-semibold">Product Quantity:</span>{" "}
                {itemCount}
              </p>
              <p className="mt-0.5">
                <span className="font-semibold">Weight:</span>{" "}
                {data.weight_kg.toFixed(1)} kg
              </p>
            </div>
            <div className="flex flex-1 flex-col justify-center px-1 py-1">
              <WaybillBarcode
                value={data.tracking_number}
                className="h-7"
                barHeight={28}
              />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center px-1 py-2 text-center">
            <p className="text-[9px] font-bold">
              {isCod ? "COD Amount:" : "Amount:"}
            </p>
            <p className="mt-1 text-[20px] leading-none font-black tracking-tight">
              {formatCodAmount(data.total)}
            </p>
          </div>
        </section>

        {/* Static courier attempt checklists + shop note */}
        <footer className="flex min-h-[36px] items-stretch border-t-2 border-black">
          <div className="flex min-w-0 flex-[1.4] flex-col items-start justify-center gap-0.5 px-1.5 py-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- static public asset for print */}
            <img
              src="/deepsky-logo.png"
              alt="Deepsky Nation"
              width={56}
              height={14}
              className="h-2 w-auto shrink-0 object-contain object-left"
            />
            <p className="min-w-0 text-[6.5px] leading-tight text-black/80">
              Thank you for shopping with Deepsky Nation! Please confirm when
              your order is received.
            </p>
          </div>
          <AttemptBoxes label="Delivery Attempt" />
          <AttemptBoxes label="Return Attempt" />
        </footer>
      </article>
    </>
  );
}
