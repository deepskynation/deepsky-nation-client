"use client";

import { useState } from "react";
import {
  ToastProvider,
  useToast,
} from "@/components/common/feedback/toast-provider";
import { SizePicker } from "@/components/common/product/size-picker";
import { Button } from "@/components/ui/button";
import { mockSizePickerVariants } from "@/mock/products/product-variants";

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

export default function ComponentVisualClient() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Component Visual</h1>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-medium">Size Picker</h2>
        <p className="text-sm text-muted-foreground">
          Reusable size buttons with out-of-stock badges.
        </p>
        <SizePickerDemo />
      </section>

      <ToastProvider>
        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-medium">Toast Provider</h2>
          <p className="text-sm text-muted-foreground">
            Click the button — the toast appears at the top-right of the screen.
          </p>
          <ToastDemo />
        </section>
      </ToastProvider>
    </div>
  );
}
