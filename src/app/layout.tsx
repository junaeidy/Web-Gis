import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Desa Simandulang - Layanan Digital Terintegrasi & Akses Informasi Masyarakat",
  description:
    "Smart Desa: Pengembangan Layanan Digital Terintegrasi untuk Meningkatkan Akses Informasi dan Pelayanan Masyarakat. Dilengkapi Peta Interaktif Desa, Urutan Prioritas Penanganan, dan Pusat Bantuan Warga Desa Simandulang.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
