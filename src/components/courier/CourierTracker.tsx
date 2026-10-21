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
    <div className="flex-1 flex flex-col md:flex-row h-full w-full bg-[#090b10] text-stone-100 overflow-hidden select-none">
      {/* Left Sidebar: Courier List & Status Summary */}
      <div className="w-full md:w-96 border-r border-stone-800/80 bg-[#0e111a] flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-stone-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-stone-100">Kurye Takip Filosu</h2>
                <p className="text-[11px] text-stone-400">Canlı konum ve teslimat</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
              {couriers.filter((c) => c.status === 'delivering').length} Yolda
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Kurye veya bölge ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#141824] border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
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
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#181d2e] border-amber-500/40 shadow-lg'
                    : 'bg-[#121622] border-stone-800/80 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isDelivering
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : isIdle
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-stone-800 text-stone-400 border border-stone-700'
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-100 flex items-center gap-1.5">
                        <span>{courier.name}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        {courier.phone} • {courier.vehicle}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                      isDelivering
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : isIdle
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {isDelivering ? 'Teslimatta' : isIdle ? 'Müsait' : 'Molada'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800/60 font-mono">
                  <span className="flex items-center gap-1 text-stone-300">
                    <MapPin className="w-3 h-3 text-amber-500" />
                    {courier.currentLocationName}
                  </span>
                  <span>{courier.completedTodayCount} Paket Bitti</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Content: Live Map Simulator & Active Route Details */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0d14]">
        {/* Top Action Bar */}
        <div className="p-4 border-b border-stone-800/80 bg-[#0e111a] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-100 text-sm">
                {selectedCourier ? selectedCourier.name : 'Kurye Seçilmedi'}
              </h3>
              <span className="text-[11px] font-mono text-stone-400">
                • {selectedCourier?.vehicle}
              </span>
            </div>
            <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anlık Konum: {selectedCourier?.currentLocationName}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${selectedCourier?.phone}`}
              className="px-3.5 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1a2030] border border-stone-800 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Ara ({selectedCourier?.phone})</span>
            </a>
            <button
              onClick={() => sounds.playTap()}
              className="p-2 rounded-xl bg-[#141824] border border-stone-800 text-stone-400 hover:text-white transition-colors"
              title="Konumu Yenile"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Vector Map Simulation (2D Clean Blueprint/Dark Grid, NO 3D) */}
        <div className="flex-1 relative bg-[#090c15] p-6 overflow-hidden flex flex-col justify-between">
          {/* Subtle Grid Lines Overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #1e2433 1px, transparent 1px), linear-gradient(to bottom, #1e2433 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Interactive Map Visual Elements */}
          <div className="relative z-10 flex-1 w-full rounded-3xl border border-stone-800/80 bg-[#0d101c]/80 backdrop-blur-md p-6 flex flex-col justify-between shadow-2xl">
            {/* Map Header Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-stone-200">
                  Canlı GPS Telemetri Yayını • İstanbul / Beşiktaş - Nişantaşı Bölgesi
                </span>
              </div>
              <div className="text-[11px] font-mono text-stone-400 bg-stone-900/80 px-2.5 py-1 rounded-lg border border-stone-800">
                Uydu Sinyali: 12 GPS / GLONASS
              </div>
            </div>

            {/* Map Graphic Simulation: Restaurant Base & Waypoints */}
            <div className="relative w-full h-72 my-4 rounded-2xl bg-[#090b12] border border-stone-800/60 overflow-hidden flex items-center justify-center">
              {/* Animated Road Lines (SVG Vector) */}
              <svg className="absolute inset-0 w-full h-full stroke-stone-800/60 stroke-2 fill-none">
                <path d="M 120 180 Q 250 80 450 140 T 750 120" strokeDasharray="6 6" />
                <path d="M 200 240 Q 380 200 500 280 T 780 200" strokeDasharray="6 6" />
              </svg>

              {/* Restaurant Base Pin */}
              <div className="absolute left-28 top-32 flex flex-col items-center">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/40 border-2 border-white">
                  🏠
                </div>
                <span className="text-[11px] font-bold text-amber-400 mt-1 bg-black/70 px-2 py-0.5 rounded-md border border-amber-500/30">
                  L&apos;Opéra Restoran (Merkez)
                </span>
              </div>

              {/* Courier 1 Pin */}
              <div className="absolute left-1/2 top-20 flex flex-col items-center animate-bounce duration-1000">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-stone-950 font-bold flex items-center justify-center shadow-lg shadow-emerald-500/40 border-2 border-white">
                  <Bike className="w-5 h-5 text-stone-950" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 mt-1 bg-black/80 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
                  {selectedCourier?.name || 'Kurye'} (Yolda)
                </span>
              </div>

              {/* Delivery Customer Destination Pin */}
              <div className="absolute right-32 top-24 flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center shadow-lg shadow-purple-600/40 border-2 border-white">
                  📍
                </div>
                <span className="text-[10px] font-bold text-purple-300 mt-1 bg-black/80 px-2 py-0.5 rounded border border-purple-500/30">
                  Teslimat Noktası: Valikonağı Cd. No:44
                </span>
              </div>
            </div>

            {/* Bottom Courier Active Deliveries Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#121624] border border-stone-800 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-[11px] text-stone-400">Tahmini Teslimat</div>
                  <div className="text-sm font-bold font-mono text-stone-100">12 Dakika Kaldı</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#121624] border border-stone-800 flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-[11px] text-stone-400">Taşınan Paket</div>
                  <div className="text-sm font-bold font-mono text-stone-100">
                    Sipariş #DEL-402 (Getir)
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#121624] border border-stone-800 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-[11px] text-stone-400">Bugünkü Performans</div>
                  <div className="text-sm font-bold font-mono text-stone-100">
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
