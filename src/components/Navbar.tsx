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
} from 'lucide-react';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    currentStaff,
    setIsPinModalOpen,
    orders,
    inventory,
    tables,
    clearTable,
    selectedTableId,
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

  return (
    <header className="bg-[#0e111a] border-b border-[#1e2433] px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 select-none shadow-xl">
      {/* Brand & Concept */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/30">
          <Sparkles className="w-5 h-5 text-stone-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif tracking-wider text-base font-bold text-stone-100 flex items-center gap-1.5">
              <span>L’OPÉRA</span>
              <span className="text-amber-400 text-xs font-sans tracking-normal font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                FINE DINING & LOUNGE
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-stone-400 font-mono tracking-tight">
            Restoran & Adisyon İşletim Sistemi v2.4
          </p>
        </div>
      </div>

      {/* Main Module Tabs */}
      <nav className="flex items-center gap-1.5 bg-[#090b10] p-1 rounded-xl border border-stone-800/80 shadow-inner">
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('floor');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'floor'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Kat & Masa Planı</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-stone-950 font-mono font-bold">
            3D
          </span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('pos');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all relative ${
            activeTab === 'pos'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/50'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Hızlı POS & Adisyon</span>
          {activeOrdersCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'pos'
                  ? 'bg-stone-950 text-amber-400'
                  : 'bg-amber-500 text-stone-950 shadow-sm'
              }`}
            >
              {activeOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('kds');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all relative ${
            activeTab === 'kds'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/50'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Mutfak & Bar KDS</span>
          {kdsPendingCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold animate-pulse">
              {kdsPendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('inventory');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all relative ${
            activeTab === 'inventory'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/50'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Stok & Reçete</span>
          {criticalStockCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-600 text-white font-bold">
              !
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('reports');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'reports'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-stone-300 hover:text-white hover:bg-stone-800/50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Z-Raporu & Finans</span>
        </button>
      </nav>

      {/* Right Controls: Clock, Sound, Staff PIN Switcher */}
      <div className="flex items-center gap-3">
        {/* Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141824] border border-stone-800/80 text-stone-300 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{time || '18:30:00'}</span>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleSound}
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          className="p-2 rounded-lg bg-[#141824] border border-stone-800 text-stone-300 hover:text-white hover:border-stone-700 transition-colors"
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
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-[#141824] border border-stone-800 hover:border-amber-500/40 transition-all text-left group"
        >
          <div
            className={`w-7 h-7 rounded-lg ${currentStaff.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-sm`}
          >
            {currentStaff.name.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-stone-200 group-hover:text-amber-400 transition-colors flex items-center gap-1">
              <span>{currentStaff.name}</span>
            </div>
            <div className="text-[10px] text-stone-400 capitalize">
              {currentStaff.role === 'waiter' && 'Garson'}
              {currentStaff.role === 'cashier' && 'Kasiyer'}
              {currentStaff.role === 'chef' && 'Mutfak Şefi'}
              {currentStaff.role === 'manager' && 'Restoran Müdürü'}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
