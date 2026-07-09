import type { Metadata } from "next";
import { PurchaseActivityProvider } from "@/components/common/marketing/purchase-activity";
import { ReduxProvider } from "@/store/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "DEEPSKY",
  description: "Deepsky storefront",
  icons: {
    icon: [
      { url: "/deepsky_logo_v5.png" },
    ],

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
