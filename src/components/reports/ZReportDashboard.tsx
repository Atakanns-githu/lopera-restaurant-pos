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

  const handleGenerate = () => {
    sounds.playTap();
    const report = generateNewZReport();
    setSelectedReport(report);
  };

  const handlePrint = () => {
    sounds.playPrintReceipt();
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f17] p-5 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <span>Finansal Analitik & Gün Sonu Z-Raporu</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Günlük ciro, ödeme türü dağılımı, garson satış sıralaması ve mali kapanış
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Raporu Yazdır</span>
          </button>
          <button
            onClick={handleGenerate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 font-bold" />
            <span>Yeni Z-Raporu Al</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4.5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Toplam Günlük Ciro</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
            ₺{selectedReport.grandTotal.toLocaleString('tr-TR')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {selectedReport.totalOrdersCount} Adisyon • {selectedReport.totalGuestsCount} Misafir
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Kredi Kartı / POS</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
            ₺{selectedReport.creditCardTotal.toLocaleString('tr-TR')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            %{Math.round((selectedReport.creditCardTotal / (selectedReport.grandTotal || 1)) * 100)}{' '}
            ciro payı
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Nakit Kasa Mevcudu</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
            ₺{selectedReport.cashTotal.toLocaleString('tr-TR')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Fiziki nakit çekmecesi
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-medium">Masa Başı Ortalama</span>
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
            ₺{Math.round(
              selectedReport.grandTotal / (selectedReport.totalOrdersCount || 1)
            ).toLocaleString('tr-TR')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Adisyon başı ortalama harcama
          </div>
        </div>
      </div>

      {/* Grid: Category Sales & Waiter Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Category Breakdown */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <span>Kategori Bazlı Satış Dağılımı</span>
          </h3>
          <div className="space-y-3">
            {selectedReport.categorySales.map((cat, i) => {
              const pct = Math.round((cat.amount / (selectedReport.grandTotal || 1)) * 100);
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{cat.categoryName}</span>
                    <span className="font-mono text-amber-400 font-semibold tabular-nums">
                      ₺{cat.amount.toLocaleString('tr-TR')} ({cat.count} Adet)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0b0f17] overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-slate-600 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waiter Ranking */}
        <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Garson Satış Performansı</span>
          </h3>
          <div className="space-y-2.5">
            {selectedReport.waiterSales.map((waiter, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-[#0e1320] border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center font-bold text-xs">
                    #{i + 1}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{waiter.waiterName}</div>
                    <div className="text-[10px] text-slate-400">{waiter.count} Kapalı Adisyon</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                    ₺{waiter.amount.toLocaleString('tr-TR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Z-Report Document */}
      <div className="p-6 rounded-2xl bg-[#111827] border border-slate-800 max-w-xl mx-auto w-full font-mono text-xs text-slate-300 shadow-xl">
        <div className="text-center pb-4 border-b border-dashed border-slate-700 space-y-1">
          <div className="font-semibold text-sm text-slate-100 tracking-wider">
            LOPERA RESTAURANT & LOUNGE
          </div>
          <div className="font-bold text-xs text-amber-400">GÜN SONU RESMİ Z-RAPORU</div>
          <div className="text-[10px] text-slate-400">
            RAPOR NO: {selectedReport.reportNumber}
          </div>
          <div className="text-[10px] text-slate-400">
            AÇILIŞ: {new Date(selectedReport.openedAt).toLocaleString('tr-TR')}
          </div>
          <div className="text-[10px] text-slate-400">
            KAPANIŞ: {new Date(selectedReport.closedAt).toLocaleString('tr-TR')}
          </div>
        </div>

        <div className="py-4 border-b border-dashed border-slate-700 space-y-2 text-xs tabular-nums">
          <div className="flex justify-between">
            <span>KREDİ KARTI TOPLAMI:</span>
            <span className="font-semibold text-slate-100">
              ₺{selectedReport.creditCardTotal.toLocaleString('tr-TR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>NAKİT KASA TOPLAMI:</span>
            <span className="font-semibold text-slate-100">
              ₺{selectedReport.cashTotal.toLocaleString('tr-TR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>YEMEK KARTI / SODEXO:</span>
            <span className="font-semibold text-slate-100">
              ₺{selectedReport.mealVoucherTotal.toLocaleString('tr-TR')}
            </span>
          </div>
          <div className="flex justify-between text-rose-400">
            <span>TOPLAM İSKONTO:</span>
            <span>-₺{selectedReport.discountTotal.toLocaleString('tr-TR')}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>HESAPLANAN KDV (%10 Gıda, %20 Alk.):</span>
            <span>₺{selectedReport.totalVat.toLocaleString('tr-TR')}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-amber-400 pt-2 border-t border-slate-700">
            <span>NET GÜNLÜK CİRO:</span>
            <span>₺{selectedReport.grandTotal.toLocaleString('tr-TR')}</span>
          </div>
        </div>

        <div className="pt-3 text-center text-[10px] text-slate-500">
          Bu belge gün sonu mali ve operasyonel mutabakat özetidir.
        </div>
      </div>
    </div>
  );
}
