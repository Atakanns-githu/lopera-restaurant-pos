'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import { ZReport } from '@/types/pos';
import {
  FileSpreadsheet,
  TrendingUp,
  CreditCard,
  Banknote,
  Percent,
  Users,
  Printer,
  Sparkles,
  Award,
  Calendar,
  Clock,
} from 'lucide-react';

export default function ZReportDashboard() {
  const { zReports, generateNewZReport, orders } = usePOS();
  const [selectedReport, setSelectedReport] = useState<ZReport>(zReports[0]);
  const [isPrintView, setIsPrintView] = useState<boolean>(false);

  const handleGenerate = () => {
    const report = generateNewZReport();
    setSelectedReport(report);
  };

  const handlePrint = () => {
    sounds.playPrintReceipt();
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0d14] p-5 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <span>Finansal Analitik & Gün Sonu Z-Raporu</span>
          </h2>
          <p className="text-xs text-stone-400">
            Günlük ciro, ödeme dağılımı, garson satış sıralaması ve resmi mali döküm
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Raporu Yazdır</span>
          </button>
          <button
            onClick={handleGenerate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 font-bold" />
            <span>Gün Sonu Z-Raporu Al</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-[#121622] border border-stone-800 shadow-md">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>Toplam Günlük Ciro</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {selectedReport.grandTotal.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            {selectedReport.totalOrdersCount} Adisyon • {selectedReport.totalGuestsCount} Misafir
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121622] border border-stone-800 shadow-md">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>Kredi Kartı Tahsilatı</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-stone-100">
            {selectedReport.creditCardTotal.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            %{Math.round((selectedReport.creditCardTotal / (selectedReport.grandTotal || 1)) * 100)}{' '}
            ciro payı
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121622] border border-stone-800 shadow-md">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>Nakit Kasa Tahsilatı</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-stone-100">
            {selectedReport.cashTotal.toLocaleString('tr-TR')} ₺
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Fiziki nakit kasa mevcudu
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121622] border border-stone-800 shadow-md">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-2">
            <span>Ortalama Masa Tutarı</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-stone-100">
            {Math.round(
              selectedReport.grandTotal / (selectedReport.totalOrdersCount || 1)
            ).toLocaleString('tr-TR')}{' '}
            ₺
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Masa başı ortalama harcama
          </div>
        </div>
      </div>

      {/* Grid: Category Sales & Waiter Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Category Breakdown */}
        <div className="p-4 rounded-2xl bg-[#121622] border border-stone-800">
          <h3 className="text-sm font-bold text-stone-100 mb-3 flex items-center gap-2">
            <span>Kategori Bazlı Satış Dağılımı</span>
          </h3>
          <div className="space-y-2.5">
            {selectedReport.categorySales.map((cat, i) => {
              const pct = Math.round((cat.amount / (selectedReport.grandTotal || 1)) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-300 font-medium">{cat.categoryName}</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {cat.amount.toLocaleString('tr-TR')} ₺ ({cat.count} Adet)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waiter Ranking */}
        <div className="p-4 rounded-2xl bg-[#121622] border border-stone-800">
          <h3 className="text-sm font-bold text-stone-100 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Garson Satış Performansı</span>
          </h3>
          <div className="space-y-2.5">
            {selectedReport.waiterSales.map((waiter, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-[#0a0d14] border border-stone-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    #{i + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-200">{waiter.waiterName}</div>
                    <div className="text-[10px] text-stone-400">{waiter.count} Kapalı Adisyon</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-amber-400">
                    {waiter.amount.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Z-Report Printable Paper Document */}
      <div className="p-6 rounded-2xl bg-[#141824] border border-stone-800 max-w-xl mx-auto w-full font-mono text-xs text-stone-300 shadow-2xl">
        <div className="text-center pb-4 border-b border-dashed border-stone-700 space-y-1">
          <div className="font-serif text-base font-black text-amber-400 tracking-wider">
            L&apos;OPÉRA BISTRO & LOUNGE
          </div>
          <div className="font-bold text-xs text-stone-100">GÜN SONU MALİ Z-RAPORU</div>
          <div className="text-[10px] text-stone-400">
            RAPOR NO: {selectedReport.reportNumber}
          </div>
          <div className="text-[10px] text-stone-400">
            AÇILIŞ: {new Date(selectedReport.openedAt).toLocaleString('tr-TR')}
          </div>
          <div className="text-[10px] text-stone-400">
            KAPANIŞ: {new Date(selectedReport.closedAt).toLocaleString('tr-TR')}
          </div>
        </div>

        <div className="py-4 border-b border-dashed border-stone-700 space-y-2 text-xs">
          <div className="flex justify-between">
            <span>KREDİ KARTI TOPLAMI:</span>
            <span className="font-bold text-stone-100">
              {selectedReport.creditCardTotal.toLocaleString('tr-TR')} ₺
            </span>
          </div>
          <div className="flex justify-between">
            <span>NAKİT KASA TOPLAMI:</span>
            <span className="font-bold text-stone-100">
              {selectedReport.cashTotal.toLocaleString('tr-TR')} ₺
            </span>
          </div>
          <div className="flex justify-between">
            <span>YEMEK KARTI TOPLAMI:</span>
            <span className="font-bold text-stone-100">
              {selectedReport.mealVoucherTotal.toLocaleString('tr-TR')} ₺
            </span>
          </div>
          <div className="flex justify-between text-rose-400">
            <span>TOPLAM İSKONTO:</span>
            <span>-{selectedReport.discountTotal.toLocaleString('tr-TR')} ₺</span>
          </div>
          <div className="flex justify-between text-stone-400">
            <span>HESAPLANAN KDV (%10):</span>
            <span>{selectedReport.totalVat.toLocaleString('tr-TR')} ₺</span>
          </div>
          <div className="flex justify-between text-sm font-black text-amber-400 pt-2 border-t border-stone-700">
            <span>NET GÜNLÜK CİRO:</span>
            <span>{selectedReport.grandTotal.toLocaleString('tr-TR')} ₺</span>
          </div>
        </div>

        <div className="pt-4 text-center text-[10px] text-stone-500">
          Bu belge gün sonu mali ve operasyonel mutabakat özetidir.
        </div>
      </div>
    </div>
  );
}
