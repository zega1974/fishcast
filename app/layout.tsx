import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "VouPescar",
  title: "VouPescar",
  description: "Seu lugar, sua pescaria",
  icons: {
    icon: "/icons/logonovo.png",
    shortcut: "/icons/logonovo.png",
    apple: "/icons/logonovo.png",
  },
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
