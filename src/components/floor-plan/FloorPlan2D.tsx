'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/lib/store';
import { SECTIONS } from '@/lib/mockData';
import { TableItem } from '@/types/pos';
import { sounds } from '@/lib/audio';
import {
  Users,
  Clock,
  Receipt,
  ArrowRightLeft,
  CheckCircle,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

export default function FloorPlan2D() {
  const router = useRouter();
  const {
    tables,
    currentSection,
    setCurrentSection,
    selectTableAndOpenPOS,
    getOrderByTableId,
    requestTableBill,
    clearTable,
    setIsTableTransferModalOpen,
    setSelectedTableId,
  } = usePOS();

  const sectionTables = tables.filter((t) => t.section === currentSection);

  const getStatusBadge = (table: TableItem) => {
    switch (table.status) {
      case 'occupied':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>DOLU</span>
          </span>
        );
      case 'bill_requested':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 animate-pulse flex items-center gap-1">
            <Receipt className="w-3 h-3" />
            <span>HESAP İSTENDİ</span>
          </span>
        );
      case 'reserved':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
            REZERVE
          </span>
        );
      case 'cleaning':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
            TEMİZLENİYOR
          </span>
        );
      case 'empty':
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            BOŞ MASA
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0d14] p-5 overflow-y-auto select-none">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#121622] border border-stone-800 shadow-md">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                sounds.playTap();
                setCurrentSection(sec.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentSection === sec.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <span>{sec.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-stone-900 font-mono">
                {tables.filter((t) => t.section === sec.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#121622] border border-stone-800 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
            {sectionTables.filter((t) => t.status === 'occupied').length} Dolu
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
            {sectionTables.filter((t) => t.status === 'bill_requested').length} Hesap
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            {sectionTables.filter((t) => t.status === 'empty').length} Boş
          </span>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sectionTables.map((table) => {
          const order = getOrderByTableId(table.id);
          const isOccupied = table.status === 'occupied' || table.status === 'bill_requested';

          return (
            <div
              key={table.id}
              className={`rounded-2xl border p-4.5 transition-all relative flex flex-col justify-between ${
                table.status === 'bill_requested'
                  ? 'bg-[#181224] border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : isOccupied
                  ? 'bg-[#181514] border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-[#121622] border-stone-800/80 hover:border-stone-700'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-stone-100">{table.name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800/80 text-stone-400 font-mono">
                      {table.capacity} Kişilik
                    </span>
                  </div>
                  {getStatusBadge(table)}
                </div>

                {/* Details */}
                {order ? (
                  <div className="space-y-2 py-2 border-y border-stone-800/60 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-400">Adisyon Tutarı:</span>
                      <span className="text-base font-bold text-amber-400 font-mono">
                        {order.total.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-stone-500" />
                        <span>Misafir / Garson:</span>
                      </span>
                      <span className="text-stone-300 font-medium">
                        {order.guestCount} Kişi • {order.waiterName}
                      </span>
                    </div>

                    {table.seatedAt && (
                      <div className="flex items-center justify-between text-xs text-stone-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-500" />
                          <span>Oturma Süresi:</span>
                        </span>
                        <span className="text-stone-300 font-mono">
                          {Math.max(1, Math.round((Date.now() - new Date(table.seatedAt).getTime()) / 60000))} dk
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center border-y border-stone-800/40 mb-3">
                    <p className="text-xs text-stone-400">Masa şu anda boş.</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => {
                    sounds.playTap();
                    selectTableAndOpenPOS(table.id);
                    router.push('/terminal/pos');
                  }}
                  className="col-span-2 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{order ? 'Adisyonu Aç & Düzenle' : 'Yeni Adisyon Aç'}</span>
                </button>

                {isOccupied && (
                  <>
                    <button
                      onClick={() => {
                        sounds.playTap();
                        requestTableBill(table.id);
                      }}
                      className="py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-semibold hover:bg-purple-500/30 transition-colors"
                    >
                      Hesap İste
                    </button>
                    <button
                      onClick={() => {
                        sounds.playTap();
                        setSelectedTableId(table.id);
                        setIsTableTransferModalOpen(true);
                      }}
                      className="py-1.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>Masa Taşı</span>
                    </button>
                  </>
                )}

                {table.status === 'cleaning' && (
                  <button
                    onClick={() => {
                      sounds.playTap();
                      clearTable(table.id);
                    }}
                    className="col-span-2 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Masayı Hazırla (Boşalt)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
