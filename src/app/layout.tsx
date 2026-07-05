import type { Metadata } from "next";
import { PurchaseActivityProvider } from "@/components/common/marketing/purchase-activity-provider";
import { ReduxProvider } from "@/store/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deepsky",
  description: "Deepsky storefront",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full font-sans antialiased">
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          <PurchaseActivityProvider>{children}</PurchaseActivityProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
