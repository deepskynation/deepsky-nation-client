"use client";

import { useState, type ReactNode } from "react";
import { CartItemCard } from "@/components/cart/cart-item-card";
import { CartOrderSummary } from "@/components/cart/cart-order-summary";
import {
  DateRangeFilter,
  type DateRangeFilterValue,
} from "@/components/common/filters";
import { formatDateRangeFilterLabel } from "@/lib/date-range-filter";
import {
  ToastProvider,
  useToast,
} from "@/components/common/feedback/toast-provider";
import { PurchaseActivityProvider } from "@/components/common/marketing/purchase-activity";
import { ColorPicker } from "@/components/common/product/color-picker";
import { ProductCard } from "@/components/common/product/ProductCard";
import { SizePicker } from "@/components/common/product/size-picker";
import { Button } from "@/components/ui/button";
import {
  segmentListClassName,
  segmentTabClassName,
} from "@/lib/panel-styles";
import { cn } from "@/lib/utils";
import { mockCartItems } from "@/mock/cart";
import { mockPurchaseActivityItems } from "@/mock/purchase-activity";
import { mockProductCards } from "@/mock/products/product-cards";
import {
  mockColorPickerVariants,
  mockSizePickerVariants,
} from "@/mock/products/product-variants";
import type { PurchaseActivityToastItem } from "@/types/purchase-activity";

const COMPONENT_TABS = [
  { id: "size-picker", label: "Size Picker" },
  { id: "color-picker", label: "Color Picker" },
  { id: "purchase-activity", label: "Purchase Activity" },
  { id: "product-card", label: "Product Card" },
  { id: "cart", label: "Cart" },
  { id: "date-range", label: "Date Range" },
  { id: "toast", label: "Toast" },
] as const;

type ComponentTabId = (typeof COMPONENT_TABS)[number]["id"];

function ToastDemo() {
  "use no memo";

  const toast = useToast();

  return (
    <Button type="button" onClick={() => toast.success("Hello, world!")}>
      Click me
    </Button>
  );
}

function SizePickerDemo() {
  "use no memo";

  const [selectedSize, setSelectedSize] = useState<string | null>("S");

  return (
    <div className="max-w-md rounded-xl border border-black/10 bg-white/70 p-6">
      <SizePicker
        variants={mockSizePickerVariants}
        selectedSize={selectedSize}
        onSizeChange={setSelectedSize}
      />
      <p className="mt-4 text-xs text-black/50">
        Selected size: {selectedSize ?? "None"}
      </p>
    </div>
  );
}

function ColorPickerDemo() {
  "use no memo";

  const [selectedSize, setSelectedSize] = useState<string | null>("M");
  const [selectedColorId, setSelectedColorId] = useState<string | null>("black");

  return (
    <div className="max-w-md space-y-4 rounded-xl border border-black/10 bg-white/70 p-6">

      <ColorPicker
        variants={mockColorPickerVariants}
        selectedSize={selectedSize}
        selectedColorId={selectedColorId}
        onColorChange={setSelectedColorId}
      />

    </div>
  );
}

function PurchaseActivityDemo() {
  "use no memo";

  const [items, setItems] = useState<PurchaseActivityToastItem[]>([
    mockPurchaseActivityItems[0],
  ]);
  const [index, setIndex] = useState(0);

  const showNext = () => {
    const nextIndex = (index + 1) % mockPurchaseActivityItems.length;
    setIndex(nextIndex);
    setItems([mockPurchaseActivityItems[nextIndex]]);
  };

  return (
    <PurchaseActivityProvider
      preview={{
        items,
        inline: true,
        onDismiss: () => setItems([]),
      }}
    >
      <div className="max-w-md space-y-4 rounded-xl border border-black/10 bg-white/70 p-6">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={showNext}>
            Show next notification
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setItems([mockPurchaseActivityItems[index]])}
            disabled={items.length > 0}
          >
            Restore
          </Button>
        </div>
        <p className="text-xs text-black/50">
          In the app, notifications appear fixed at the bottom-left via{" "}
          <code className="text-[11px]">PurchaseActivityProvider</code>.
        </p>
      </div>
    </PurchaseActivityProvider>
  );
}

function ProductCardDemo() {
  "use no memo";

  return (
    <div className="grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
      {mockProductCards.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          href={`#${product.id}`}
        />
      ))}
    </div>
  );
}

function CartDemo() {
  "use no memo";

  const subtotal = mockCartItems.reduce(
    (sum, item) => sum + Number(item.lineTotal),
    0,
  );
  const shippingFee = 50;
  const total = subtotal + shippingFee;

  return (
    <div className="max-w-5xl rounded-xl border border-black/10 bg-white/70 p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] lg:items-start">
        <section className="rounded-xl border border-black/8 bg-white px-4 py-1">
          {mockCartItems.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              selected
              onToggleSelect={() => {}}
              onDecrease={() => {}}
              onIncrease={() => {}}
              onRemove={() => {}}
            />
          ))}
        </section>
        <CartOrderSummary
          subtotal={subtotal}
          shippingFee={shippingFee}
          total={total}
          shippingLoading={false}
          selectedCount={mockCartItems.length}
          canCheckout
          onCheckout={() => {}}
        />
      </div>
    </div>
  );
}

function DateRangeFilterDemo() {
  "use no memo";

  const [value, setValue] = useState<DateRangeFilterValue | undefined>({
    preset: "this-month",
  });

  return (
    <div className="max-w-md space-y-4 rounded-xl border border-black/10 bg-white/70 p-6">
      <DateRangeFilter value={value} onChange={setValue} label="Date" />
      <p className="text-xs text-black/50">
        Selected: {formatDateRangeFilterLabel(value, "All Time")}
      </p>
    </div>
  );
}

const TAB_COPY: Record<
  ComponentTabId,
  { title: string; description: string; render: () => ReactNode }
> = {
  "size-picker": {
    title: "Size Picker",
    description: "Reusable size buttons with out-of-stock badges.",
    render: () => <SizePickerDemo />,
  },
  "color-picker": {
    title: "Color Picker",
    description:
      "Reusable color buttons with swatches and out-of-stock state. Pick a size first to see available colors.",
    render: () => <ColorPickerDemo />,
  },
  "purchase-activity": {
    title: "Purchase Activity",
    description:
      "Social proof toast shown when someone completes a purchase. Dismiss with the close button or cycle through mock notifications.",
    render: () => <PurchaseActivityDemo />,
  },
  "product-card": {
    title: "Product Card",
    description:
      "Shop grid card with sale badge, sold-out state, and hover image carousel. Hover the middle card to cycle images.",
    render: () => <ProductCardDemo />,
  },
  cart: {
    title: "Cart",
    description: "Cart line item and order summary preview.",
    render: () => <CartDemo />,
  },
  "date-range": {
    title: "Date Range Filter",
    description:
      "Dropdown date filter with quick presets and custom range. Selected preset uses black.",
    render: () => <DateRangeFilterDemo />,
  },
  toast: {
    title: "Toast Provider",
    description:
      "Click the button — the toast appears at the top-right of the screen.",
    render: () => (
      <ToastProvider>
        <ToastDemo />
      </ToastProvider>
    ),
  },
};

export default function ComponentVisualClient() {
  "use no memo";

  const [activeTab, setActiveTab] = useState<ComponentTabId>("size-picker");
  const activePanel = TAB_COPY[activeTab];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Component Visual</h1>

      <div
        role="tablist"
        aria-label="Component previews"
        className={cn(segmentListClassName, "mt-6")}
      >
        {COMPONENT_TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={segmentTabClassName(isActive)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <section
        role="tabpanel"
        aria-labelledby={activeTab}
        className="mt-8 space-y-4"
      >
        <h2 className="text-lg font-medium">{activePanel.title}</h2>
        <p className="text-sm text-muted-foreground">{activePanel.description}</p>
        {activePanel.render()}
      </section>
    </div>
  );
}
