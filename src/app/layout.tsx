import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIP-DESA Teluk Pulai Luar - Layanan Lapor & Pantau Perbaikan Fasilitas Desa",
  description:
    "Peta digital dan penentuan urutan perbaikan jalan, jembatan, dan tanggul secara adil dan transparan bagi warga Desa Teluk Pulai Luar, Kec. Kualuh Leidong, Kab. Labuhanbatu Utara.",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
