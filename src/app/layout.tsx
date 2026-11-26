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
  title: "SIPANDAI Desa Simandulang - Sistem Informasi Pelayanan & Aspirasi Warga",
  description:
    "SIPANDAI Desa: Sistem Informasi Pelayanan & Aspirasi Warga Desa Simandulang, Kec. Kualuh Leidong. Layanan Administrasi Surat Online, Pengaduan Fasilitas Terpadu, Peta Spasial Desa, dan Asisten Pintar SiPandai.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
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
