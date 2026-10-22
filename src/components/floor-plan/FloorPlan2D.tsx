'use client';

import React, { useState } from 'react';
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
  CreditCard,
  Printer,
  Search,
  Filter,
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
    setIsPaymentModalOpen,
    setIsReceiptModalOpen,
    setActiveReceiptOrder,
  } = usePOS();

  const [statusFilter, setStatusFilter] = useState<'all' | 'occupied' | 'bill_requested' | 'empty'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter tables by Section, Status and Search Query
  const sectionTables = tables.filter((t) => {
    const matchesSection = t.section === currentSection;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'occupied'
        ? t.status === 'occupied' || t.status === 'bill_requested'
        : t.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesStatus && matchesSearch;
  });

  const allSectionTables = tables.filter((t) => t.section === currentSection);
  const occupiedCount = allSectionTables.filter((t) => t.status === 'occupied').length;
  const billCount = allSectionTables.filter((t) => t.status === 'bill_requested').length;
  const emptyCount = allSectionTables.filter((t) => t.status === 'empty').length;

  const getStatusBadge = (table: TableItem) => {
    switch (table.status) {
      case 'occupied':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>DOLU</span>
          </span>
        );
      case 'bill_requested':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
            <Receipt className="w-3 h-3 text-amber-400" />
            <span>HESAP İSTENDİ</span>
          </span>
        );
      case 'reserved':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
            REZERVE
          </span>
        );
      case 'cleaning':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
            TEMİZLENİYOR
          </span>
        );
      case 'empty':
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            BOŞ
          </span>
        );
    }
  };

  const handleQuickPay = (tableId: string) => {
    sounds.playTap();
    const order = getOrderByTableId(tableId);
    if (!order) return;
    selectTableAndOpenPOS(tableId);
    setIsPaymentModalOpen(true);
  };

  const handleQuickPrint = (tableId: string) => {
    sounds.playPrinter();
    const order = getOrderByTableId(tableId);
    if (!order) return;
    setActiveReceiptOrder(order);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f17] p-5 overflow-y-auto select-none">
      {/* Top Section Tabs & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        {/* Salon / Section Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111827] border border-slate-800 overflow-x-auto">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                sounds.playTap();
                setCurrentSection(sec.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                currentSection === sec.id
                  ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>{sec.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0b0f17] text-slate-400 font-mono">
                {tables.filter((t) => t.section === sec.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Status Filters + Search */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Masa ara (örn: A1)..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-[#111827] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 w-36 transition-colors"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111827] border border-slate-800 text-xs">
            <button
              onClick={() => {
                sounds.playTap();
                setStatusFilter('all');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tümü ({allSectionTables.length})
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setStatusFilter('occupied');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'occupied'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dolu ({occupiedCount})
            </button>
            {billCount > 0 && (
              <button
                onClick={() => {
                  sounds.playTap();
                  setStatusFilter('bill_requested');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === 'bill_requested'
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40 font-semibold'
                    : 'text-amber-400/90 hover:text-amber-300 animate-pulse'
                }`}
              >
                Hesap ({billCount})
              </button>
            )}
            <button
              onClick={() => {
                sounds.playTap();
                setStatusFilter('empty');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'empty'
                  ? 'bg-slate-800 text-slate-200 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Boş ({emptyCount})
            </button>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {sectionTables.map((table) => {
          const order = getOrderByTableId(table.id);
          const isOccupied = table.status === 'occupied' || table.status === 'bill_requested';

          return (
            <div
              key={table.id}
              className={`rounded-2xl border p-4.5 transition-all relative flex flex-col justify-between shadow-sm ${
                table.status === 'bill_requested'
                  ? 'bg-[#141b2c] border-amber-500/40'
                  : isOccupied
                  ? 'bg-[#111827] border-slate-700/80 hover:border-slate-600'
                  : 'bg-[#0e1320] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-slate-100">{table.name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                      {table.capacity} Kişi
                    </span>
                  </div>
                  {getStatusBadge(table)}
                </div>

                {/* Details */}
                {order ? (
                  <div className="space-y-1.5 py-2.5 border-y border-slate-800/80 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Adisyon Tutarı:</span>
                      <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">
                        ₺{order.total.toLocaleString('tr-TR')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>Misafir / Garson:</span>
                      </span>
                      <span className="text-slate-300 font-medium truncate max-w-[140px]">
                        {order.guestCount} Kişi • {order.waiterName}
                      </span>
                    </div>

                    {table.seatedAt && (
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Süre:</span>
                        </span>
                        <span className="text-slate-300 font-mono tabular-nums">
                          {Math.max(1, Math.round((Date.now() - new Date(table.seatedAt).getTime()) / 60000))} dk
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-7 text-center border-y border-slate-800/50 mb-3">
                    <p className="text-xs text-slate-500">Masa boş ve servise hazır</p>
                  </div>
                )}
              </div>

              {/* Action Buttons: 1-Tap Touch Ergonomics */}
              <div className="space-y-2 mt-1">
                {isOccupied ? (
                  <>
                    {/* Primary Actions: Hesap Al / Sipariş Ekle */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleQuickPay(table.id)}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                        title="Masadan çıkmadan hemen ödeme al"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Hesap Al</span>
                      </button>

                      <button
                        onClick={() => {
                          sounds.playTap();
                          selectTableAndOpenPOS(table.id);
                          router.push('/terminal/pos');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Sipariş Ekle</span>
                      </button>
                    </div>

                    {/* Secondary Utilities: Fiş Yazdır & Masa Taşı */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleQuickPrint(table.id)}
                        className="py-1.5 rounded-lg bg-slate-800/70 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                        title="Adisyon Fişi Yazdır"
                      >
                        <Printer className="w-3 h-3 text-slate-400" />
                        <span>Fiş</span>
                      </button>

                      <button
                        onClick={() => {
                          sounds.playTap();
                          requestTableBill(table.id);
                        }}
                        className="py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/25 text-[11px] font-medium hover:bg-amber-500/20 transition-colors"
                      >
                        Hesap İste
                      </button>

                      <button
                        onClick={() => {
                          sounds.playTap();
                          setSelectedTableId(table.id);
                          setIsTableTransferModalOpen(true);
                        }}
                        className="py-1.5 rounded-lg bg-slate-800/70 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-slate-400" />
                        <span>Taşı</span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* Empty Table: 1-Tap Yeni Adisyon Aç */
                  <button
                    onClick={() => {
                      sounds.playTap();
                      selectTableAndOpenPOS(table.id);
                      router.push('/terminal/pos');
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Masa Aç & Sipariş Gir</span>
                  </button>
                )}

                {table.status === 'cleaning' && (
                  <button
                    onClick={() => {
                      sounds.playTap();
                      clearTable(table.id);
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/25 transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Masayı Temizlendi Olarak İşaretle</span>
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
