import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2Icon } from "lucide-react";
import { PublicWaybillView } from "@/components/common/orders/public-waybill-view";

type WaybillPageProps = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({
  params,
}: WaybillPageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  const decoded = decodeURIComponent(orderNumber).trim().replace(/^#/, "");
  return {
    title: decoded
      ? `Waybill ${decoded} | Deepsky Nation`
      : "Waybill | Deepsky Nation",
    description: "Public shipping waybill for Deepsky Nation orders.",
  };
}

function WaybillFallback() {
  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 px-6 py-14">
      <div className="flex flex-col items-center gap-3 text-black/50">
        <Loader2Icon className="size-8 motion-safe:animate-spin" aria-hidden />
        <p className="text-sm">Loading…</p>
      </div>
    </div>
  );
}

export default async function WaybillPage({ params }: WaybillPageProps) {
  const { orderNumber } = await params;
  const decoded = decodeURIComponent(orderNumber).trim().replace(/^#/, "");

  return (
    <main className="min-h-full bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90">
      <Suspense fallback={<WaybillFallback />}>
        <PublicWaybillView key={decoded} orderNumber={decoded} />
      </Suspense>
    </main>
  );
}
