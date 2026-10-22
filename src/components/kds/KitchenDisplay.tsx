'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from '@/lib/store';
import { KitchenStation, OrderItem } from '@/types/pos';
import { sounds } from '@/lib/audio';
import {
  ChefHat,
  Flame,
  Soup,
  Wine,
  CakeSlice,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Users,
} from 'lucide-react';

export default function KitchenDisplay() {
  const { orders, updateKdsItemStatus } = usePOS();
  const [selectedStation, setSelectedStation] = useState<KitchenStation | 'all'>('all');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Tick timer every 10 seconds for live minutes update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Filter open orders that have active food items
  const activeOrders = orders.filter((o) => o.status === 'open');

  const getStationIcon = (st: KitchenStation) => {
    switch (st) {
      case 'hot_kitchen':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'cold_kitchen':
        return <Soup className="w-3.5 h-3.5 text-teal-400" />;
      case 'bar':
        return <Wine className="w-3.5 h-3.5 text-amber-400" />;
      case 'pastry':
        return <CakeSlice className="w-3.5 h-3.5 text-amber-300" />;
    }
  };

  const getUrgencyBadge = (createdAtStr: string) => {
    const elapsedMinutes = Math.max(1, Math.round((currentTime - new Date(createdAtStr).getTime()) / 60000));

    if (elapsedMinutes > 20) {
      return (
        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{elapsedMinutes} dk (Gecikme)</span>
        </span>
      );
    }
    if (elapsedMinutes > 10) {
      return (
        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/25 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{elapsedMinutes} dk</span>
        </span>
      );
    }
    return (
      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" />
        <span>{elapsedMinutes} dk</span>
      </span>
    );
  };

  const handleNextStatus = (orderId: string, item: OrderItem) => {
    sounds.playTap();
    if (item.status === 'pending') {
      updateKdsItemStatus(orderId, item.id, 'preparing');
    } else if (item.status === 'preparing') {
      sounds.playKitchenAlert();
      updateKdsItemStatus(orderId, item.id, 'ready');
    } else if (item.status === 'ready') {
      updateKdsItemStatus(orderId, item.id, 'served');
    }
  };

  const handleCompleteAllTicket = (orderId: string, items: OrderItem[]) => {
    sounds.playKitchenAlert();
    items.forEach((item) => {
      if (item.status !== 'served' && item.status !== 'cancelled') {
        updateKdsItemStatus(orderId, item.id, 'ready');
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f17] p-5 overflow-y-auto select-none">
      {/* Top Station Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-400" />
            <span>Mutfak & Bar KDS (Kitchen Display System)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            İstasyon bazlı üretim biletleri, hazırlık süreleri ve servis koordinasyonu
          </p>
        </div>

        {/* Station Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111827] border border-slate-800">
          {[
            { id: 'all', name: 'Tüm İstasyonlar' },
            { id: 'hot_kitchen', name: 'Sıcak Mutfak' },
            { id: 'cold_kitchen', name: 'Soğuk & Meze' },
            { id: 'bar', name: 'Mixology Bar' },
            { id: 'pastry', name: 'Tatlı & Pastane' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playTap();
                setSelectedStation(tab.id as KitchenStation | 'all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedStation === tab.id
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {activeOrders.map((order) => {
          // Filter items by station if selected
          const displayItems = order.items.filter((item) => {
            if (selectedStation === 'all') return true;
            return item.station === selectedStation;
          });

          if (displayItems.length === 0) return null;

          const isAllReady = displayItems.every(
            (i) => i.status === 'ready' || i.status === 'served'
          );

          return (
            <div
              key={order.id}
              className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all shadow-sm ${
                isAllReady
                  ? 'bg-[#101b17] border-emerald-500/30'
                  : 'bg-[#111827] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Ticket Top Header */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-slate-100">
                        {order.tableNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {order.section === 'ana_salon' && 'Ana Salon'}
                        {order.section === 'teras' && 'Teras'}
                        {order.section === 'vip' && 'VIP'}
                        {order.section === 'bahce' && 'Bahçe'}
                        {order.section === 'bar' && 'Bar'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Garson: {order.waiterName} • {order.guestCount} Kişi
                    </div>
                  </div>

                  {getUrgencyBadge(order.createdAt)}
                </div>

                {/* Items in this ticket */}
                <div className="space-y-2 mb-4">
                  {displayItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNextStatus(order.id, item)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        item.status === 'ready'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : item.status === 'preparing'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : 'bg-[#0e1320] border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-slate-800 font-mono text-xs font-bold text-amber-400 flex items-center justify-center">
                            {item.quantity}x
                          </span>
                          <span className="text-xs font-medium text-slate-100">{item.name}</span>
                        </div>

                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                            item.status === 'ready'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.status === 'preparing'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.status === 'ready' && 'HAZIR'}
                          {item.status === 'preparing' && 'PİŞİYOR'}
                          {item.status === 'pending' && 'BEKLİYOR'}
                          {item.status === 'served' && 'SERVİS EDİLDİ'}
                        </span>
                      </div>

                      {/* Modifiers & Notes */}
                      {item.selectedModifiers.length > 0 && (
                        <div className="text-[10px] text-amber-400/80 pl-7 mt-1 font-mono">
                          {item.selectedModifiers.map((m, i) => (
                            <span key={i} className="mr-2">
                              • {m.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.specialNote && (
                        <div className="text-[10px] text-rose-300 pl-7 mt-0.5 italic">
                          Not: {item.specialNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Batch Complete Button */}
              <button
                onClick={() => handleCompleteAllTicket(order.id, displayItems)}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                  isAllReady
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAllReady ? 'Tüm Sipariş Servise Hazır' : 'Tüm Ürünleri Hazırla'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
