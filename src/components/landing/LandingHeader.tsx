'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import {
  Sparkles,
  ChevronDown,
  Smartphone,
  Bike,
  UtensilsCrossed,
  Layers,
  ChefHat,
  Boxes,
  Truck,
  LineChart,
  Users,
  QrCode,
  Shield,
  Zap,
  ArrowRight,
  LogIn,
} from 'lucide-react';

export default function LandingHeader() {
  const { setIsQrMenuModalOpen } = usePOS();
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-40 bg-[#090b10]/95 backdrop-blur-xl border-b border-stone-800/80 shadow-2xl select-none">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-stone-950 px-4 py-1.5 text-center text-[11px] font-bold tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>ZYNOX TEKNOLOJİ GÜVENCESİYLE • TÜM RESTORAN SİSTEMLERİ TEK ÇATI ALTINDA</span>
        <Link
          href="/terminal/tables"
          onClick={() => sounds.playTap()}
          className="ml-2 underline font-extrabold hover:opacity-80 transition-opacity"
        >
          Doğrudan Terminale Geç →
        </Link>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40">
            <span className="font-serif font-black text-xl text-stone-950">Z</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-extrabold text-lg tracking-wider text-stone-100">
                ZADİSYON
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30">
                ZYNOX OS
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-mono">Restoran & POS Ekosistemi</p>
          </div>
        </Link>

        {/* Navigation Items (Matching Screenshots) */}
        <nav className="hidden md:flex items-center gap-1 relative">
          {/* Mega Menu Dropdown Button (Screenshot 1) */}
          <div className="relative">
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-200 hover:text-white hover:bg-stone-800/60 transition-all"
            >
              <span>Çözümler & Modüller</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Mega Menu Dropdown Popup (Screenshot 1) */}
            {isMegaMenuOpen && (
              <div
                onMouseLeave={() => setIsMegaMenuOpen(false)}
                className="absolute top-full left-0 mt-2 w-[760px] rounded-3xl bg-[#121624] border border-stone-800 p-6 shadow-2xl z-50 grid grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {/* Column 1: POS Sistemleri */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-extrabold tracking-wider text-stone-400 uppercase border-b border-stone-800 pb-1.5">
                    POS SİSTEMLERİ
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-300">
                    <li>
                      <Link
                        href="/terminal/delivery"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="hover:text-amber-400 cursor-pointer transition-colors block"
                      >
                        PaketServis Entegrasyonları
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terminal/tables"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="hover:text-amber-400 cursor-pointer transition-colors block"
                      >
                        Mutfak - Masa POS Sistemi
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terminal/inventory"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="hover:text-amber-400 cursor-pointer transition-colors block"
                      >
                        Stok ve Maliyet Takibi
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terminal/hardware"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="hover:text-amber-400 cursor-pointer transition-colors block"
                      >
                        Donanım / ÖKC Entegrasyonları
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 2: Sipariş Uygulamaları */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-extrabold tracking-wider text-stone-400 uppercase border-b border-stone-800 pb-1.5">
                    SİPARİŞ UYGULAMALARI
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-300">
                    <li>
                      <Link
                        href="/menu"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="hover:text-amber-400 cursor-pointer transition-colors block"
                      >
                        Mobil sipariş APP
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terminal/delivery"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="hover:text-amber-400 cursor-pointer transition-colors block"
                      >
                        WhatsApp Sipariş Çözümü
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terminal/delivery"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="hover:text-amber-400 cursor-pointer transition-colors block"
                      >
                        Telefon Sipariş Yönetimi
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/menu"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="hover:text-amber-400 cursor-pointer transition-colors block"
                      >
                        Garson Sipariş / QR Menü
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 3: Taşımacılık & Kurye Çözümleri */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-extrabold tracking-wider text-stone-400 uppercase border-b border-stone-800 pb-1.5">
                    TAŞIMACILIK & KURYE
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-300">
                    <li>
                      <Link
                        href="/terminal/couriers"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="hover:text-amber-400 cursor-pointer transition-colors block"
                      >
                        KuryeTakip Filosu
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terminal/couriers"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="hover:text-amber-400 cursor-pointer transition-colors block"
                      >
                        Kurye Şirketleri Entegrasyonu
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terminal/couriers"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="hover:text-amber-400 cursor-pointer transition-colors block"
                      >
                        Kurye Şirketi Yazılımı
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 4: Yönetim Araçları */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-extrabold tracking-wider text-stone-400 uppercase border-b border-stone-800 pb-1.5">
                    YÖNETİM ARAÇLARI
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-300">
                    <li>
                      <Link
                        href="/terminal/branches"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="hover:text-amber-400 cursor-pointer transition-colors block"
                      >
                        Zincir İşletme Yönetimi
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terminal/reports"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="hover:text-amber-400 cursor-pointer transition-colors block"
                      >
                        Gelişmiş Z-Raporları
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terminal/hardware"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="hover:text-amber-400 cursor-pointer transition-colors block"
                      >
                        Çoklu Ekran Yönetimi
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terminal/delivery"
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="hover:text-amber-400 cursor-pointer transition-colors block"
                      >
                        SepetTakip Uygulaması
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/menu"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Müşteri QR Menü</span>
          </Link>

          <Link
            href="/login"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-800/60 transition-colors flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Personel Girişi</span>
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/menu"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700/60 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            <span>QR Menüyü Aç</span>
          </Link>

          <Link
            href="/terminal/tables"
            onClick={() => sounds.playTap()}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <span>Restoran Terminali (POS)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
