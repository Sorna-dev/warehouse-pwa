import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warehouse Manager",
  description: "Container loading/unloading documentation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0061D5" />
      </head>
      <body>{children}</body>
    </html>
  );
}