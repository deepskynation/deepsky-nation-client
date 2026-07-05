"use client";

import dynamic from "next/dynamic";

const ComponentVisualClient = dynamic(
  () => import("@/app/ComponentVisual/component-visual-client"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-muted-foreground">
        Loading component previews…
      </div>
    ),
  },
);

export default function ComponentVisualPage() {
  return <ComponentVisualClient />;
}
