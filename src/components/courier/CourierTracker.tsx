'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import {
  Bike,
  Phone,
  Navigation,
  CheckCircle,
  Clock,
  MapPin,
  ShieldAlert,
  Search,
  Plus,
  RefreshCw,
  TrendingUp,
  Package,
} from 'lucide-react';

export default function CourierTracker() {
  const { couriers, deliveryOrders, updateDeliveryStatus } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourierId, setSelectedCourierId] = useState<string | null>(
    couriers[0]?.id || null
  );

  const filteredCouriers = couriers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.currentLocationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCourier =
    couriers.find((c) => c.id === selectedCourierId) || couriers[0];

  const activeDeliveries = deliveryOrders.filter(
    (d) => d.status === 'on_the_way' || d.status === 'preparing'
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full w-full bg-[#0b0f17] text-slate-100 overflow-hidden select-none">
      {/* Left Sidebar: Courier List & Status Summary */}
      <div className="w-full md:w-96 border-r border-slate-800 bg-[#0e1320] flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-slate-100">Kurye Takip Filosu</h2>
                <p className="text-[11px] text-slate-400">Canlı konum ve sevkiyat takibi</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 font-mono">
              {couriers.filter((c) => c.status === 'delivering').length} Yolda
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Kurye veya bölge ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111827] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-colors"
            />
          </div>
        </div>

        {/* Courier Cards List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredCouriers.map((courier) => {
            const isSelected = selectedCourier?.id === courier.id;
            const isDelivering = courier.status === 'delivering';
            const isIdle = courier.status === 'idle';

            return (
              <div
                key={courier.id}
                onClick={() => {
                  sounds.playTap();
                  setSelectedCourierId(courier.id);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#151d30] border-amber-500/40 shadow-sm'
                    : 'bg-[#111827] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isDelivering
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : isIdle
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-100 flex items-center gap-1.5">
                        <span>{courier.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {courier.phone} • {courier.vehicle}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      isDelivering
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/25'
                        : isIdle
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isDelivering ? 'Teslimatta' : isIdle ? 'Müsait' : 'Molada'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono tabular-nums">
                  <span className="flex items-center gap-1 text-slate-300 truncate max-w-[160px]">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{courier.currentLocationName}</span>
                  </span>
                  <span>{courier.completedTodayCount} Paket</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Content: Live Map Simulator & Active Route Details */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0b0f17]">
        {/* Top Action Bar */}
        <div className="p-4 border-b border-slate-800 bg-[#0e1320] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-sm">
                {selectedCourier ? selectedCourier.name : 'Kurye Seçilmedi'}
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                • {selectedCourier?.vehicle}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anlık Konum: {selectedCourier?.currentLocationName}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${selectedCourier?.phone}`}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Ara ({selectedCourier?.phone})</span>
            </a>
            <button
              onClick={() => sounds.playTap()}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Konumu Yenile"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Vector Map Simulation */}
        <div className="flex-1 relative bg-[#090d16] p-6 overflow-hidden flex flex-col justify-between">
          {/* Subtle Grid Lines Overlay */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Map Visual Container */}
          <div className="relative z-10 flex-1 w-full rounded-2xl border border-slate-800 bg-[#0e1320]/90 backdrop-blur-md p-6 flex flex-col justify-between shadow-sm">
            {/* Map Header Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-200">
                  Canlı GPS Telemetri Yayını • Beşiktaş / Nişantaşı Bölgesi
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                Uydu Sinyali: 12 GPS
              </div>
            </div>

            {/* Map Graphic: Restaurant Base & Waypoints */}
            <div className="relative w-full h-72 my-4 rounded-xl bg-[#0b0f17] border border-slate-800/80 overflow-hidden flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full stroke-slate-800 stroke-2 fill-none">
                <path d="M 120 180 Q 250 80 450 140 T 750 120" strokeDasharray="6 6" />
                <path d="M 200 240 Q 380 200 500 280 T 780 200" strokeDasharray="6 6" />
              </svg>

              {/* Restaurant Base Pin */}
              <div className="absolute left-28 top-32 flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 font-bold flex items-center justify-center shadow-md border border-slate-700">
                  🏠
                </div>
                <span className="text-[10px] font-semibold text-slate-200 mt-1 bg-black/80 px-2 py-0.5 rounded border border-slate-800">
                  Lopera Restoran (Merkez)
                </span>
              </div>

              {/* Courier 1 Pin */}
              <div className="absolute left-1/2 top-20 flex flex-col items-center animate-bounce duration-1000">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-md border-2 border-white">
                  <Bike className="w-4 h-4 text-slate-950" />
                </div>
                <span className="text-[10px] font-semibold text-amber-300 mt-1 bg-black/80 px-2 py-0.5 rounded border border-slate-800 font-mono">
                  {selectedCourier?.name || 'Kurye'} (Yolda)
                </span>
              </div>

              {/* Delivery Customer Destination Pin */}
              <div className="absolute right-32 top-24 flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center shadow-md border border-slate-700">
                  📍
                </div>
                <span className="text-[10px] font-semibold text-slate-300 mt-1 bg-black/80 px-2 py-0.5 rounded border border-slate-800">
                  Teslimat: Valikonağı Cad. No: 44
                </span>
              </div>
            </div>

            {/* Bottom Courier Active Deliveries Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#111827] border border-slate-800 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-[11px] text-slate-400">Tahmini Varış</div>
                  <div className="text-sm font-semibold font-mono tabular-nums text-slate-100">12 Dakika Kaldı</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#111827] border border-slate-800 flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-[11px] text-slate-400">Aktif Paket</div>
                  <div className="text-sm font-semibold font-mono text-slate-100">
                    Sipariş #DEL-402 (Getir)
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#111827] border border-slate-800 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-[11px] text-slate-400">Bugünkü Performans</div>
                  <div className="text-sm font-semibold font-mono tabular-nums text-slate-100">
                    {selectedCourier?.completedTodayCount} Teslimat (Ort. 18 dk)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
