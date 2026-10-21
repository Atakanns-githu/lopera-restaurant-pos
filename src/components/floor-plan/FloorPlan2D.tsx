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
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>DOLU</span>
          </span>
        );
      case 'bill_requested':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/40 animate-pulse flex items-center gap-1">
            <Receipt className="w-3 h-3" />
            <span>HESAP İSTENDİ</span>
          </span>
        );
      case 'reserved':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
            REZERVE
          </span>
        );
      case 'cleaning':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
            TEMİZLENİYOR
          </span>
        );
      case 'empty':
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            BOŞ MASA
          </span>
        );
    }
  };

  const handleQuickPay = (tableId: string) => {
    sounds.playTap();
    setSelectedTableId(tableId);
    setIsPaymentModalOpen(true);
  };

  const handleQuickPrint = (tableId: string) => {
    sounds.playPrintReceipt();
    const order = getOrderByTableId(tableId);
    if (order) {
      setActiveReceiptOrder(order);
      setIsReceiptModalOpen(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090b10] p-4 lg:p-6 overflow-y-auto select-none">
      {/* Top Filter & Section Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        {/* Salon / Section Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#121622] border border-stone-800 shadow-md overflow-x-auto">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                sounds.playTap();
                setCurrentSection(sec.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                currentSection === sec.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <span>{sec.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 font-mono">
                {tables.filter((t) => t.section === sec.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Status Filters + Search */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Masa ara (örn: 4)..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-[#121622] border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 w-36 transition-colors"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#121622] border border-stone-800 text-xs font-mono">
            <button
              onClick={() => {
                sounds.playTap();
                setStatusFilter('all');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-stone-700 text-white font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Tümü ({allSectionTables.length})
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setStatusFilter('occupied');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'occupied'
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-amber-400/80 hover:text-amber-300'
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
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'bill_requested'
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold'
                    : 'text-purple-400/80 hover:text-purple-300 animate-pulse'
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
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'empty'
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-emerald-400/80 hover:text-emerald-300'
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
              className={`rounded-2xl border p-4 transition-all relative flex flex-col justify-between shadow-lg ${
                table.status === 'bill_requested'
                  ? 'bg-[#181224] border-purple-500/50 shadow-purple-500/10'
                  : isOccupied
                  ? 'bg-[#151722] border-amber-500/40 shadow-amber-500/5'
                  : 'bg-[#11141f] border-stone-800/80 hover:border-stone-700'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-stone-100">{table.name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-400 font-mono">
                      {table.capacity} Kişi
                    </span>
                  </div>
                  {getStatusBadge(table)}
                </div>

                {/* Details */}
                {order ? (
                  <div className="space-y-1.5 py-2.5 border-y border-stone-800/80 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-400">Adisyon Tutarı:</span>
                      <span className="text-lg font-bold text-amber-400 font-mono">
                        {order.total.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-stone-500" />
                        <span>Misafir / Garson:</span>
                      </span>
                      <span className="text-stone-300 font-medium truncate max-w-[140px]">
                        {order.guestCount} Kişi • {order.waiterName}
                      </span>
                    </div>

                    {table.seatedAt && (
                      <div className="flex items-center justify-between text-xs text-stone-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-500" />
                          <span>Süre:</span>
                        </span>
                        <span className="text-stone-300 font-mono">
                          {Math.max(1, Math.round((Date.now() - new Date(table.seatedAt).getTime()) / 60000))} dk
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-7 text-center border-y border-stone-800/40 mb-3">
                    <p className="text-xs text-stone-400">Masa şu anda boş ve hazır</p>
                  </div>
                )}
              </div>

              {/* Action Buttons: 1-Tap Ergonomics */}
              <div className="space-y-2 mt-1">
                {isOccupied ? (
                  <>
                    {/* Primary Action: 1-Tap Hızlı Hesap Al / Ödeme */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleQuickPay(table.id)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                        title="Masadan çıkmadan hemen ödeme al"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Hesap Al / Öde</span>
                      </button>

                      <button
                        onClick={() => {
                          sounds.playTap();
                          selectTableAndOpenPOS(table.id);
                          router.push('/terminal/pos');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Sipariş Ekle</span>
                      </button>
                    </div>

                    {/* Secondary Utilities: Fiş Yazdır & Masa Taşı */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleQuickPrint(table.id)}
                        className="py-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                        title="Adisyon Fişi Yazdır"
                      >
                        <Printer className="w-3 h-3 text-stone-400" />
                        <span>Fiş</span>
                      </button>

                      <button
                        onClick={() => {
                          sounds.playTap();
                          requestTableBill(table.id);
                        }}
                        className="py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-semibold hover:bg-purple-500/30 transition-colors"
                      >
                        Hesap İste
                      </button>

                      <button
                        onClick={() => {
                          sounds.playTap();
                          setSelectedTableId(table.id);
                          setIsTableTransferModalOpen(true);
                        }}
                        className="py-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
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
                    className="w-full py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Masa Aç & Sipariş Gir</span>
                  </button>
                )}

                {table.status === 'cleaning' && (
                  <button
                    onClick={() => {
                      sounds.playTap();
                      clearTable(table.id);
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1"
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
