import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "VouPescar",
  title: "VouPescar",
  description: "Seu lugar, sua pescaria",
  icons: {
    icon: "/icons/logonovo-simples.png",
    shortcut: "/icons/logonovo-simples.png",
    apple: "/icons/logonovo-simples.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
