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

import AppProviders from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "ZAdisyon | Zynox Restoran & POS Teknolojileri",
  description: "Zynox Yeni Nesil Restoran Adisyon, Mutfak KDS, Paket Servis, Kurye Takip, QR Menü ve Mali e-Adisyon Ekosistemi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#090b10] text-stone-100 font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
