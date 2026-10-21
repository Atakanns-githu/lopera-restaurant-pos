'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import {
  Layers,
  CreditCard,
  ChefHat,
  Boxes,
  FileSpreadsheet,
  Volume2,
  VolumeX,
  User,
  Clock,
  Sparkles,
  RefreshCw,
  Truck,
  Bike,
  Users,
  Building2,
  Cpu,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { TerminalTab } from '@/lib/store';

export default function Navbar() {
  const {
    activeTerminalTab,
    setActiveTerminalTab,
    setMainView,
    currentStaff,
    setIsPinModalOpen,
    orders,
    inventory,
    deliveryOrders,
    couriers,
    currentBranch,
  } = usePOS();

  const [time, setTime] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Badge counts
  const activeOrdersCount = orders.filter((o) => o.status === 'open').length;
  const kdsPendingCount = orders
    .filter((o) => o.status === 'open')
    .flatMap((o) => o.items)
    .filter((i) => i.status === 'pending' || i.status === 'preparing').length;
  const criticalStockCount = inventory.filter((i) => i.currentStock <= i.criticalStock).length;
  const activeDeliveryCount = deliveryOrders.filter(
    (d) => d.status === 'pending' || d.status === 'preparing' || d.status === 'on_the_way'
  ).length;

  const tabs: { id: TerminalTab; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
    {
      id: 'floor',
      label: 'Kat & Masa Planı',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'pos',
      label: 'Hızlı POS',
      icon: <CreditCard className="w-4 h-4" />,
      badge: activeOrdersCount > 0 ? (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 font-bold">
          {activeOrdersCount}
        </span>
      ) : null,
    },
    {
      id: 'kds',
      label: 'Mutfak KDS',
      icon: <ChefHat className="w-4 h-4" />,
      badge: kdsPendingCount > 0 ? (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold animate-pulse">
          {kdsPendingCount}
        </span>
      ) : null,
    },
    {
      id: 'delivery',
      label: 'Paket Servis',
      icon: <Truck className="w-4 h-4" />,
      badge: activeDeliveryCount > 0 ? (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500 text-white font-bold">
          {activeDeliveryCount}
        </span>
      ) : null,
    },
    {
      id: 'courier',
      label: 'Kurye Takip',
      icon: <Bike className="w-4 h-4" />,
    },
    {
      id: 'crm',
      label: 'Cari & Sadakat',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'inventory',
      label: 'Stok & Reçete',
      icon: <Boxes className="w-4 h-4" />,
      badge: criticalStockCount > 0 ? (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-600 text-white font-bold">
          !
        </span>
      ) : null,
    },
    {
      id: 'branches',
      label: 'Zincir Şubeler',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'hardware',
      label: 'Donanım & E-Dönüşüm',
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: 'Z-Raporu & Finans',
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
  ];

  return (
    <header className="bg-[#0e111a] border-b border-[#1e2433] px-3 py-2 flex items-center justify-between sticky top-0 z-40 select-none shadow-xl">
      {/* Brand & Concept & Back to Website */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            sounds.playTap();
            setMainView('landing');
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1a2032] border border-stone-800 text-stone-300 hover:text-amber-400 text-xs font-semibold transition-all group"
          title="Müşteri ve Marka Tanıtım Sayfasına Dön"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Marka Sitesi</span>
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-stone-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/30">
            <span className="font-serif font-black text-sm text-stone-950">Z</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif tracking-wider text-xs font-bold text-stone-100">
                ZADİSYON
              </h1>
              <span className="text-amber-400 text-[10px] font-sans font-semibold px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                {currentBranch.name}
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-mono tracking-tight">
              Zynox POS OS v3.2
            </p>
          </div>
        </div>
      </div>

      {/* Main Module Tabs Navigation (Scrollable horizontally if needed) */}
      <nav className="flex items-center gap-1 bg-[#090b10] p-1 rounded-xl border border-stone-800/80 shadow-inner overflow-x-auto max-w-[62vw] custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTerminalTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playTap();
                setActiveTerminalTab(tab.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Clock, Sound, Staff PIN Switcher */}
      <div className="flex items-center gap-2">
        {/* Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141824] border border-stone-800/80 text-stone-300 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{time || '19:45:00'}</span>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleSound}
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          className="p-1.5 rounded-lg bg-[#141824] border border-stone-800 text-stone-300 hover:text-white hover:border-stone-700 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}
        </button>

        {/* Staff Switcher PIN button */}
        <button
          onClick={() => {
            sounds.playTap();
            setIsPinModalOpen(true);
          }}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-[#141824] border border-stone-800 hover:border-amber-500/40 transition-all text-left group"
        >
          <div
            className={`w-6 h-6 rounded-lg ${currentStaff.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-sm`}
          >
            {currentStaff.name.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-stone-200 group-hover:text-amber-400 transition-colors">
              {currentStaff.name}
            </div>
            <div className="text-[9px] text-stone-400 capitalize">
              {currentStaff.role === 'waiter' && 'Garson'}
              {currentStaff.role === 'cashier' && 'Kasiyer'}
              {currentStaff.role === 'chef' && 'Mutfak Şefi'}
              {currentStaff.role === 'manager' && 'Müdür'}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
