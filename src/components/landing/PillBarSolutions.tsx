'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sounds } from '@/lib/audio';
import {
  Smartphone,
  ChefHat,
  Boxes,
  Truck,
  LineChart,
  Users,
  QrCode,
  FileCheck,
  Bike,
  Cpu,
  Building2,
  Wallet,
  Printer,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function PillBarSolutions() {
  const router = useRouter();
  const [activePill, setActivePill] = useState<string>('satis');

  // Pill Bar items (Screenshot 2)
  const pills = [
    { id: 'satis', label: 'Satış & Adisyon', icon: <Smartphone className="w-4 h-4" />, href: '/terminal/pos' },
    { id: 'mutfak', label: 'Mutfak Yönetimi (KDS)', icon: <ChefHat className="w-4 h-4" />, href: '/terminal/kds' },
    { id: 'stok', label: 'Stok & Maliyet', icon: <Boxes className="w-4 h-4" />, href: '/terminal/inventory' },
    { id: 'paket', label: 'Paket Servis & Çağrı Merkezi', icon: <Truck className="w-4 h-4" />, href: '/terminal/delivery' },
    { id: 'rapor', label: 'Raporlama & Analitik', icon: <LineChart className="w-4 h-4" />, href: '/terminal/reports' },
    { id: 'musteri', label: 'Müşteri & Sadakat', icon: <Users className="w-4 h-4" />, href: '/terminal/crm' },
    { id: 'qrmenu', label: 'QR Menü & Masadan Sipariş', icon: <QrCode className="w-4 h-4" />, href: '/menu', isSpecial: true },
  ];

  // Solutions grid items (Screenshot 3)
  const solutions = [
    {
      title: 'Dijital Menü',
      desc: 'Müşterilerin masadan temassız inceleyip sipariş verdiği interaktif dijital menü.',
      icon: <QrCode className="w-5 h-5 text-amber-500" />,
      href: '/menu',
    },
    {
      title: 'Mutfak Yönetimi (KDS)',
      desc: 'İstasyon bazlı gecikme sayaçları, anlık bilet akışı ve şef bildirim ekranı.',
      icon: <ChefHat className="w-5 h-5 text-rose-500" />,
      href: '/terminal/kds',
    },
    {
      title: 'E-Dönüşüm Entegrasyonu',
      desc: 'e-Adisyon, e-Fatura ve e-Arşiv entegrasyonu ile tam yasal uyumluluk.',
      icon: <FileCheck className="w-5 h-5 text-blue-500" />,
      href: '/terminal/hardware',
    },
    {
      title: 'Kurye Takip',
      desc: 'Paket servis kuryelerinin anlık harita konumu ve teslimat süresi takibi.',
      icon: <Bike className="w-5 h-5 text-emerald-500" />,
      href: '/terminal/couriers',
    },
    {
      title: 'Raporlama ve Analiz',
      desc: 'Günlük ciro, en çok satanlar, garson primleri ve resmi mali Z-Raporu.',
      icon: <LineChart className="w-5 h-5 text-purple-500" />,
      href: '/terminal/reports',
    },
    {
      title: 'Stok ve Maliyet Yönetimi',
      desc: 'Reçeteye bağlı anlık hammadde düşüşü ve kritik stok eşiği alarmları.',
      icon: <Boxes className="w-5 h-5 text-orange-500" />,
      href: '/terminal/inventory',
    },
    {
      title: 'Gelişmiş Entegrasyonlar',
      desc: 'Yemeksepeti, Getir, Trendyol ve WhatsApp sipariş botu otomatik senkronizasyonu.',
      icon: <Cpu className="w-5 h-5 text-teal-500" />,
      href: '/terminal/delivery',
    },
    {
      title: 'Zincir İşletme Yönetimi',
      desc: 'Tüm şubelerinizi tek ekrandan canlı ciro ve doluluk oranlarıyla yönetin.',
      icon: <Building2 className="w-5 h-5 text-indigo-500" />,
      href: '/terminal/branches',
    },
    {
      title: 'Cari Müşteri Yönetimi',
      desc: 'VIP müşteri profilleri, veresiye açık hesap ve sadakat puan sistemi.',
      icon: <Wallet className="w-5 h-5 text-yellow-500" />,
      href: '/terminal/crm',
    },
    {
      title: 'Donanım & Yazıcılar',
      desc: 'Termal mutfak yazıcıları, el terminalleri ve ÖKC POS bağlantıları.',
      icon: <Printer className="w-5 h-5 text-stone-400" />,
      href: '/terminal/hardware',
    },
  ];

  return (
    <section id="solutions" className="py-16 px-4 bg-[#0a0d14] border-t border-stone-800/60 select-none">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KAPSAMLI RESTORAN & POS ÇÖZÜMLERİ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-100 font-serif">
            Restoranınız İçin Gereken Her Şey Tek Bir Platformda
          </h2>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-stone-400">
            Masa siparişinden paket servise, canlı kurye takibinden şube yönetimine kadar tüm operasyonlarınızı kesintisiz yürütün.
          </p>
        </div>

        {/* 1. Pill Tabs Bar (Screenshot 2) */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-5xl mx-auto">
          {pills.map((pill) => {
            const isActive = activePill === pill.id;

            return (
              <Link
                key={pill.id}
                href={pill.href}
                onClick={() => {
                  sounds.playTap();
                  setActivePill(pill.id);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
                  pill.isSpecial
                    ? 'border-2 border-sky-500 text-sky-400 hover:bg-sky-500/10 font-bold'
                    : isActive
                    ? 'bg-[#181d2e] border border-amber-500/60 text-amber-300 font-bold shadow-md'
                    : 'bg-[#121622] border border-stone-800 text-stone-300 hover:text-white hover:border-stone-700'
                }`}
              >
                <span>{pill.icon}</span>
                <span>{pill.label}</span>
              </Link>
            );
          })}
        </div>

        {/* 2. Solutions Grid (Screenshot 3) - 10 Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4">
          {solutions.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              onClick={() => sounds.playTap()}
              className="p-5 rounded-3xl bg-[#121622]/90 border border-stone-800/80 hover:border-amber-500/40 hover:bg-[#161a29] transition-all flex flex-col justify-between group shadow-lg text-left"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#181c2b] border border-stone-700/60 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md">
                  {item.icon}
                </div>
                <h4 className="font-bold text-sm text-stone-100 group-hover:text-amber-400 transition-colors mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Modülü Aç</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
