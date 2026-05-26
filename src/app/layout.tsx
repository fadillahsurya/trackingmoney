import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keuangan Bersama",
  description: "Aplikasi pencatatan keuangan bersama pasangan.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Keuangan",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
