'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
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
  const { setMainView, setActiveTerminalTab, setIsQrMenuModalOpen } = usePOS();
  const [activePill, setActivePill] = useState<string>('satis');

  // Pill Bar items (Screenshot 2)
  const pills = [
    { id: 'satis', label: 'Satış & Adisyon', icon: <Smartphone className="w-4 h-4" />, tabTarget: 'pos' },
    { id: 'mutfak', label: 'Mutfak Yönetimi (KDS)', icon: <ChefHat className="w-4 h-4" />, tabTarget: 'kds' },
    { id: 'stok', label: 'Stok & Maliyet', icon: <Boxes className="w-4 h-4" />, tabTarget: 'inventory' },
    { id: 'paket', label: 'Paket Servis & Çağrı Merkezi', icon: <Truck className="w-4 h-4" />, tabTarget: 'delivery' },
    { id: 'rapor', label: 'Raporlama & Analitik', icon: <LineChart className="w-4 h-4" />, tabTarget: 'reports' },
    { id: 'musteri', label: 'Müşteri & Sadakat', icon: <Users className="w-4 h-4" />, tabTarget: 'crm' },
    { id: 'qrmenu', label: 'QR Menü & Masadan Sipariş', icon: <QrCode className="w-4 h-4" />, isSpecial: true },
  ];

  // Solutions grid items (Screenshot 3)
  const solutions = [
    {
      title: 'Dijital Menü',
      desc: 'Müşterilerin masadan temassız inceleyip sipariş verdiği interaktif dijital menü.',
      icon: <QrCode className="w-5 h-5 text-amber-500" />,
      onClick: () => setIsQrMenuModalOpen(true),
    },
    {
      title: 'Mutfak Yönetimi (KDS)',
      desc: 'İstasyon bazlı gecikme sayaçları, anlık bilet akışı ve şef bildirim ekranı.',
      icon: <ChefHat className="w-5 h-5 text-rose-500" />,
      onClick: () => {
        setActiveTerminalTab('kds');
        setMainView('terminal');
      },
    },
    {
      title: 'E-Dönüşüm Entegrasyonu',
      desc: 'e-Adisyon, e-Fatura ve e-Arşiv entegrasyonu ile tam yasal uyumluluk.',
      icon: <FileCheck className="w-5 h-5 text-blue-500" />,
      onClick: () => {
        setActiveTerminalTab('hardware');
        setMainView('terminal');
      },
    },
    {
      title: 'Kurye Takip',
      desc: 'Paket servis kuryelerinin anlık harita konumu ve teslimat süresi takibi.',
      icon: <Bike className="w-5 h-5 text-emerald-500" />,
      onClick: () => {
        setActiveTerminalTab('courier');
        setMainView('terminal');
      },
    },
    {
      title: 'Raporlama ve Analiz',
      desc: 'Günlük ciro, en çok satanlar, garson primleri ve resmi mali Z-Raporu.',
      icon: <LineChart className="w-5 h-5 text-purple-500" />,
      onClick: () => {
        setActiveTerminalTab('reports');
        setMainView('terminal');
      },
    },
    {
      title: 'Stok ve Maliyet Yönetimi',
      desc: 'Reçeteye bağlı anlık hammadde düşüşü ve kritik stok eşiği alarmları.',
      icon: <Boxes className="w-5 h-5 text-orange-500" />,
      onClick: () => {
        setActiveTerminalTab('inventory');
        setMainView('terminal');
      },
    },
    {
      title: 'Gelişmiş Entegrasyonlar',
      desc: 'Yemeksepeti, Getir, Trendyol ve WhatsApp sipariş botu otomatik senkronizasyonu.',
      icon: <Cpu className="w-5 h-5 text-teal-500" />,
      onClick: () => {
        setActiveTerminalTab('delivery');
        setMainView('terminal');
      },
    },
    {
      title: 'Zincir İşletme Yönetimi',
      desc: 'Tüm şubelerinizi tek ekrandan canlı ciro ve doluluk oranlarıyla yönetin.',
      icon: <Building2 className="w-5 h-5 text-indigo-500" />,
      onClick: () => {
        setActiveTerminalTab('branches');
        setMainView('terminal');
      },
    },
    {
      title: 'Cari Müşteri Yönetimi',
      desc: 'VIP müşteri profilleri, veresiye açık hesap ve sadakat puan sistemi.',
      icon: <Wallet className="w-5 h-5 text-amber-500" />,
      onClick: () => {
        setActiveTerminalTab('crm');
        setMainView('terminal');
      },
    },
    {
      title: 'Donanım & Yazıcılar',
      desc: 'Termal mutfak yazıcıları, el terminalleri ve ÖKC POS bağlantıları.',
      icon: <Printer className="w-5 h-5 text-pink-500" />,
      onClick: () => {
        setActiveTerminalTab('hardware');
        setMainView('terminal');
      },
    },
  ];

  const handlePillClick = (pill: (typeof pills)[0]) => {
    sounds.playTap();
    setActivePill(pill.id);
    if (pill.isSpecial) {
      setIsQrMenuModalOpen(true);
    } else if (pill.tabTarget) {
      setActiveTerminalTab(pill.tabTarget as any);
      setMainView('terminal');
    }
  };

  return (
    <section id="solutions" className="py-16 px-4 bg-[#0c0f17] select-none border-t border-stone-800/80">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KAPSAMLI RESTORAN & POS ÇÖZÜMLERİ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-100 font-serif tracking-tight">
            Restoranınız İçin Gereken Her Şey Tek Bir Platformda
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed">
            Masa siparişinden paket servise, canlı kurye takibinden şube yönetimine kadar tüm operasyonlarınızı kesintisiz yürütün.
          </p>
        </div>

        {/* Pill Tabs Bar (Screenshot 2) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-5xl mx-auto">
          {pills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => handlePillClick(pill)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
                pill.isSpecial
                  ? 'border-2 border-sky-500/80 bg-sky-500/10 text-sky-300 hover:bg-sky-500 hover:text-stone-950 shadow-sky-500/20 font-bold'
                  : activePill === pill.id
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-[#141824] border border-stone-800 text-stone-300 hover:border-stone-700 hover:text-white'
              }`}
            >
              <span>{pill.icon}</span>
              <span>{pill.label}</span>
            </button>
          ))}
        </div>

        {/* 10 Solutions Grid (Screenshot 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {solutions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                sounds.playTap();
                item.onClick();
              }}
              className="group p-5 rounded-3xl bg-[#121622] border border-stone-800/80 hover:border-amber-500/40 hover:bg-[#161b2a] transition-all cursor-pointer shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#090b10] border border-stone-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{item.desc}</p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-xl bg-stone-800/60 group-hover:bg-amber-500 group-hover:text-stone-950 text-stone-400 flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
