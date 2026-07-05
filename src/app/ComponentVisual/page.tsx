"use client";

import dynamic from "next/dynamic";

const ComponentVisualClient = dynamic(
  () => import("@/app/ComponentVisual/component-visual-client"),
  {
    ssr: false,
    loading: () => (
      <main className="flex h-dvh items-center justify-center overflow-y-auto p-8 text-sm text-muted-foreground">
        Loading component previews…
      </main>
    ),
  },
);

export default function ComponentVisualPage() {
  return (
    <main className="h-dvh overflow-y-auto">
      <ComponentVisualClient />
    </main>
  );
}
