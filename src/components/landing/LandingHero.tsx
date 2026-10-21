'use client';

import React from 'react';
import Link from 'next/link';
import { sounds } from '@/lib/audio';
import {
  Sparkles,
  ArrowRight,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ChefHat,
  Bike,
  LineChart,
  Boxes,
} from 'lucide-react';

export default function LandingHero() {
  return (
    <section className="relative pt-12 pb-20 px-4 overflow-hidden select-none">
      {/* Background radial ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#181c2b] border border-amber-500/30 text-amber-400 text-xs font-semibold shadow-lg shadow-amber-500/10">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>YENİ NESİL RESTORAN VE ADİSYON TEKNOLOJİSİ</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-stone-100 font-serif tracking-tight leading-tight">
          Restoranınızın Tüm Operasyonu <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
            Tek Bir Güçlü Platformda
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-stone-400 text-sm sm:text-base leading-relaxed">
          Masa adisyonu, canlı KDS mutfak ekranı, Yemeksepeti / Getir paket servis entegrasyonu, harita üzerinde anlık kurye takibi, reçeteli stok düşüşü ve resmi gün sonu Z-raporu.
        </p>

        {/* CTA Buttons (Real Next.js Links) */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/terminal/tables"
            onClick={() => sounds.playTap()}
            className="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <span>Restoran Girişi (ZAdisyon Terminali)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/menu"
            onClick={() => sounds.playTap()}
            className="py-3.5 px-6 rounded-2xl bg-[#141824] hover:bg-[#1a2030] text-stone-200 font-bold text-sm border border-stone-800 hover:border-amber-500/40 flex items-center gap-2 transition-all"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Müşteri QR Menüyü Dene</span>
          </Link>
        </div>

        {/* Live Metrics Strip */}
        <div className="pt-10 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#121622]/80 border border-stone-800">
            <div className="text-2xl font-bold font-mono text-amber-400">%99.98</div>
            <div className="text-xs text-stone-400 mt-1">Kesintisiz Çalışma (SLA)</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#121622]/80 border border-stone-800">
            <div className="text-2xl font-bold font-mono text-stone-100">&lt; 1.2 sn</div>
            <div className="text-xs text-stone-400 mt-1">Mutfak KDS İletim Hızı</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#121622]/80 border border-stone-800">
            <div className="text-2xl font-bold font-mono text-stone-100">42+ Şube</div>
            <div className="text-xs text-stone-400 mt-1">Zincir İşletme Desteği</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#121622]/80 border border-stone-800">
            <div className="text-2xl font-bold font-mono text-emerald-400">%100</div>
            <div className="text-xs text-stone-400 mt-1">Mali e-Adisyon Uyumu</div>
          </div>
        </div>
      </div>
    </section>
  );
}
