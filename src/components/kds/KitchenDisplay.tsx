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
        return <Wine className="w-3.5 h-3.5 text-purple-400" />;
      case 'pastry':
        return <CakeSlice className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getUrgencyBadge = (createdAtStr: string) => {
    const elapsedMinutes = Math.max(1, Math.round((currentTime - new Date(createdAtStr).getTime()) / 60000));

    if (elapsedMinutes > 20) {
      return (
        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-rose-600 text-white animate-pulse flex items-center gap-1 shadow-md shadow-rose-600/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{elapsedMinutes} dk (ACİL!)</span>
        </span>
      );
    }
    if (elapsedMinutes > 10) {
      return (
        <span className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{elapsedMinutes} dk</span>
        </span>
      );
    }
    return (
      <span className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
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
    <div className="flex-1 flex flex-col h-full bg-[#0a0d14] p-5 overflow-y-auto select-none">
      {/* Top Station Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-400" />
            <span>Mutfak & Bar KDS (Kitchen Display System)</span>
          </h2>
          <p className="text-xs text-stone-400">
            Gelen sipariş biletleri, istasyon hazırlık süreleri ve servis akışı
          </p>
        </div>

        {/* Station Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#121622] border border-stone-800">
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedStation === tab.id
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Masonry / Horizontal Flow */}
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
              className={`rounded-2xl border p-4 flex flex-col justify-between transition-all shadow-xl ${
                isAllReady
                  ? 'bg-[#101b17] border-emerald-500/40'
                  : 'bg-[#121622] border-stone-800/80'
              }`}
            >
              {/* Ticket Top Header */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-800/90 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-stone-100">
                        {order.tableNumber}
                      </span>
                      <span className="text-xs text-stone-400">
                        {order.section === 'ana_salon' && 'Ana Salon'}
                        {order.section === 'teras' && 'Teras'}
                        {order.section === 'vip' && 'VIP'}
                        {order.section === 'bahce' && 'Bahçe'}
                        {order.section === 'bar' && 'Bar'}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
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
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                          : item.status === 'preparing'
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                          : 'bg-[#191e2e] border-stone-800 text-stone-200 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-stone-900 font-mono text-xs font-bold text-amber-400 flex items-center justify-center">
                            {item.quantity}x
                          </span>
                          <span className="text-xs font-bold">{item.name}</span>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            item.status === 'ready'
                              ? 'bg-emerald-500 text-stone-950 font-extrabold'
                              : item.status === 'preparing'
                              ? 'bg-amber-500 text-stone-950'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {item.status === 'ready' && 'HAZIR!'}
                          {item.status === 'preparing' && 'PİŞİYOR'}
                          {item.status === 'pending' && 'BEKLİYOR'}
                          {item.status === 'served' && 'SERVİS EDİLDİ'}
                        </span>
                      </div>

                      {/* Modifiers & Notes */}
                      {item.selectedModifiers.length > 0 && (
                        <div className="text-[10px] text-amber-400/90 pl-7 mt-1">
                          {item.selectedModifiers.map((m, i) => (
                            <span key={i} className="mr-2">
                              • {m.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.specialNote && (
                        <div className="text-[10px] text-rose-300 font-semibold pl-7 mt-0.5 italic">
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
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                  isAllReady
                    ? 'bg-emerald-500 text-stone-950'
                    : 'bg-stone-800 hover:bg-emerald-600 text-stone-300 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAllReady ? 'Sipariş Servise Hazır' : 'Tüm Ürünleri Hazırla'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
