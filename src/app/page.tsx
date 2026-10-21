'use client';

import React from 'react';
import Link from 'next/link';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import PillBarSolutions from '@/components/landing/PillBarSolutions';
import {
  ShieldCheck,
  Heart,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Lock,
  Zap,
  Server,
  ArrowRight,
} from 'lucide-react';

function EnterpriseFeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 bg-[#090b10] border-t border-stone-800/60 select-none">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SIFIR GÜVENLİK AÇIĞI • KURUMSAL MİMARİ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-100 font-serif">
            GİB ve Maliye Uyumlu Kesintisiz Restoran Altyapısı
          </h2>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-stone-400">
            509 Sıra No.lu VUK Genel Tebliği e-Adisyon standartlarına tam uyumlu, TÜBİTAK Kamu SM mali mühür onaylı güvenli bulut mimarisi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#121624] border border-stone-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-100">
              Uçtan Uca Şifreli & Güvenli
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Tüm personel işlemleri 4 haneli güvenli PIN ve rol yetkilendirmesi ile korunur. Kasiyer, Garson, Şef ve Müdür yetkileri kesin sınırlarla ayrılmıştır.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#121624] border border-stone-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-100">
              Offline & Canlı Senkronizasyon
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              İnternet kesintilerinde yerel terminalde kesintisiz sipariş ve hesap alma devam eder. Bağlantı geldiğinde Supabase ve GİB ile otomatik senkronize olur.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#121624] border border-stone-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-100">
              Çoklu Şube & Bulut Yedekleme
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Zincir işletmeler için merkezi stok, reçete ve menü kontrolü. 10 yıl yasal mali veri saklama garantisi ile denetimlere daima hazır.
            </p>
          </div>
        </div>

        {/* Quick CTA Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-[#181d2e] to-amber-500/10 border border-amber-500/30 p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold font-serif text-stone-100">
            Hemen Restoran Terminalini Deneyimleyin
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto">
            Giriş PIN kodları ile doğrudan terminale geçiş yapabilir veya müşterileriniz için QR menüyü test edebilirsiniz.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/terminal/tables"
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <span>Restoran Terminalini Aç</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/menu"
              className="py-3 px-6 rounded-2xl bg-[#141824] hover:bg-[#1c2235] text-stone-200 font-bold text-xs border border-stone-700"
            >
              <span>Müşteri QR Menüyü Aç</span>
            </Link>
            <Link
              href="/login"
              className="py-3 px-5 rounded-2xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 font-semibold text-xs"
            >
              <span>Personel Girişi</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-stone-800/80 bg-[#07090e] py-12 px-4 text-stone-400 text-xs select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-serif font-black text-stone-950">
              Z
            </div>
            <span className="font-serif font-extrabold text-base tracking-wider text-stone-100">
              ZADİSYON
            </span>
          </div>
          <p className="text-stone-400 text-[11px] leading-relaxed">
            Zynox Teknoloji tarafından yeni nesil kafe, restoran, zincir işletmeler ve lounge mekanlar için geliştirilmiş uçtan uca restoran işletim sistemi.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-stone-200 mb-3 text-xs uppercase tracking-wider">
            Çözümler
          </h4>
          <ul className="space-y-2 text-[11px]">
            <li>
              <Link href="/terminal/delivery" className="hover:text-amber-400 transition-colors">
                Paket Servis Entegrasyonları
              </Link>
            </li>
            <li>
              <Link href="/terminal/kds" className="hover:text-amber-400 transition-colors">
                Mutfak KDS Ekranları
              </Link>
            </li>
            <li>
              <Link href="/terminal/inventory" className="hover:text-amber-400 transition-colors">
                Reçete & Stok Takibi
              </Link>
            </li>
            <li>
              <Link href="/terminal/couriers" className="hover:text-amber-400 transition-colors">
                Kurye GPS Telemetri
              </Link>
            </li>
            <li>
              <Link href="/terminal/hardware" className="hover:text-amber-400 transition-colors">
                Mali e-Adisyon (GİB)
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-stone-200 mb-3 text-xs uppercase tracking-wider">
            Kurumsal & Güvenlik
          </h4>
          <ul className="space-y-2 text-[11px]">
            <li className="hover:text-amber-400 cursor-pointer transition-colors">509 Sayılı VUK e-Adisyon Tebliği</li>
            <li className="hover:text-amber-400 cursor-pointer transition-colors">KVKK & Veri Güvenliği Politikası</li>
            <li className="hover:text-amber-400 cursor-pointer transition-colors">ISO 27001 Bilgi Güvenliği</li>
            <li className="hover:text-amber-400 cursor-pointer transition-colors">ÖKC Donanım Standartları</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-stone-200 mb-3 text-xs uppercase tracking-wider">
            İletişim & Destek
          </h4>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>0850 840 90 00 (7/24 Çağrı Merkezi)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>destek@zadisyon.zynox.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Zynox Teknopark, Levent / İstanbul</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-stone-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
        <div>
          © 2026 ZAdisyon / Zynox Restoran Teknolojileri A.Ş. Tüm hakları saklıdır.
        </div>
        <div className="flex items-center gap-2">
          <span>Made with</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          <span>for hospitality perfection</span>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-[#090b10] text-stone-100 flex flex-col font-sans overflow-x-hidden">
      {/* Customer & Brand Navigation Header (Mega-Menu Screenshot 1) */}
      <LandingHeader />

      {/* Hero Section */}
      <main className="flex-1">
        <LandingHero />

        {/* Pill Bar Tabs (Screenshot 2) & Solutions Grid (Screenshot 3) */}
        <PillBarSolutions />

        {/* Enterprise & Security Highlights */}
        <EnterpriseFeaturesSection />
      </main>

      {/* Brand Footer */}
      <LandingFooter />
    </div>
  );
}
