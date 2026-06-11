import type { Metadata } from "next";
import { ReduxProvider } from "@/store/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deepsky",
  description: "Deepsky storefront",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full font-sans antialiased">
      <body className="min-h-full flex flex-col">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
