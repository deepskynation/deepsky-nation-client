"use client";

import { cn } from "@/lib/utils";
import type { WaybillPrintData } from "@/mock/waybill";

type PrintOrderDetailsProps = {
  data: WaybillPrintData;
  className?: string;
};

/** Deterministic bar widths from tracking chars — visual placeholder, not a real barcode. */
function BarcodePlaceholder({
  value,
  className,
  barClassName,
  fullWidth = false,
}: {
  value: string;
  className?: string;
  barClassName?: string;
  /** Stretch bars across the container (main tracking barcode). */
  fullWidth?: boolean;
}) {
  const source = fullWidth ? value.repeat(4) : value.repeat(2);
  const bars = Array.from(source).flatMap((char, index) => {
    const code = char.charCodeAt(0);
    const narrow = (code % 3) + 1;
    const gap = (code % 2) + 1;
    return [
      { key: `${index}-b`, width: narrow, filled: true },
      { key: `${index}-g`, width: gap, filled: false },
    ];
  });

  return (
    <div
      className={cn(
        "flex w-full items-stretch overflow-hidden bg-white",
        fullWidth ? "justify-stretch gap-0 px-3" : "justify-center gap-px",
        className,
      )}
      aria-hidden
    >
      {bars.map((bar) => (
        <span
          key={bar.key}
          className={cn(
            "h-full",
            fullWidth ? "min-w-px flex-1" : "shrink-0",
            bar.filled ? "bg-black" : "bg-transparent",
            barClassName,
          )}
          style={
            fullWidth ? { flexGrow: bar.width } : { width: `${bar.width}px` }
          }
        />
      ))}
    </div>
  );
}

/** Simple QR-looking grid placeholder (not a scannable QR). */
function QrPlaceholder({ value }: { value: string }) {
  const size = 21;
  const cells: boolean[] = [];
  let seed = 0;
  for (let i = 0; i < value.length; i += 1) {
    seed = (seed + value.charCodeAt(i) * (i + 1)) % 9973;
  }
  for (let i = 0; i < size * size; i += 1) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const row = Math.floor(i / size);
    const col = i % size;
    const finder =
      (row < 5 && col < 5) ||
      (row < 5 && col >= size - 5) ||
      (row >= size - 5 && col < 5);
    cells.push(finder ? row === 0 || col === 0 || row === 4 || col === 4 || (row > 1 && row < 3 && col > 1 && col < 3) || (finder && ((row + col) % 2 === 0)) : seed % 3 !== 0);
  }

  return (
    <div
      className="grid aspect-square w-full border border-black bg-white p-[2px]"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      aria-hidden
    >
      {cells.map((filled, index) => (
        <span
          key={index}
          className={filled ? "bg-black" : "bg-white"}
        />
      ))}
    </div>
  );
}

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
} {
  if (data.isCustomize && data.custom_logo_url?.trim()) {
    return {
      src: data.custom_logo_url.trim(),
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
          .no-print {
            display: none !important;
          }
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
          <BarcodePlaceholder
            value={data.tracking_number}
            className="h-10"
            fullWidth
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
                {data.shipper.name}{" "}
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
            <QrPlaceholder value={data.tracking_number} />
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
              <BarcodePlaceholder
                value={data.tracking_number}
                className="h-7"
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
