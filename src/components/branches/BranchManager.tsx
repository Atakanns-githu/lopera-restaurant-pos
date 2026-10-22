'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import {
  Building2,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Layers,
  ArrowRight,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Branch } from '@/types/pos';

export default function BranchManager() {
  const { branches, currentBranch, setCurrentBranch } = usePOS();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const totalChainRevenue = branches.reduce((sum, b) => sum + b.dailyRevenue, 0);
  const totalActiveTables = branches.reduce((sum, b) => sum + b.activeTablesCount, 0);

  const handleSyncAllBranches = () => {
    sounds.playTap();
    setIsSyncing(true);
    setSyncSuccess(false);

    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      sounds.playPaymentSuccess();
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1200);
  };

  const handleSwitchBranch = (branch: Branch) => {
    sounds.playTap();
    setCurrentBranch(branch);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#0b0f17] text-slate-100 overflow-hidden select-none">
      {/* Top Header & Chain Metrics */}
      <div className="p-4 border-b border-slate-800/80 bg-[#0e1320]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm text-slate-100">
                  Zincir İşletme & Çoklu Şube Yönetimi
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700/60">
                  Merkezi Bulut Konsolu
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tüm şubelerin anlık cirosu, menü senkronizasyonu ve merkezi kontrolü
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAllBranches}
              disabled={isSyncing}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Senkronize Ediliyor...' : 'Menüyü Şubelere Dağıt'}</span>
            </button>

            <button
              onClick={() => sounds.playTap()}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Şube Tanımla</span>
            </button>
          </div>
        </div>

        {/* Sync Success Alert */}
        {syncSuccess && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Merkezi menü fiyatları ve reçeteler tüm şubelere başarıyla aktarıldı!</span>
          </div>
        )}

        {/* 3 Chain KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Zincir Toplam Günlük Ciro</div>
              <div className="text-lg font-semibold font-mono tabular-nums text-emerald-400 mt-0.5">
                {totalChainRevenue.toLocaleString('tr-TR')} ₺
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Toplam Aktif Masa</div>
              <div className="text-lg font-semibold font-mono tabular-nums text-amber-400 mt-0.5">
                {totalActiveTables} Masa Açık
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Bağlı Şube Sayısı</div>
              <div className="text-lg font-semibold font-mono tabular-nums text-slate-100 mt-0.5">
                {branches.length} Aktif Lokasyon
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {branches.map((branch) => {
            const isCurrent = currentBranch.id === branch.id;

            return (
              <div
                key={branch.id}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-[#111827] border-amber-500/40 ring-1 ring-amber-500/20 shadow-lg'
                    : 'bg-[#0e1320] border-slate-800/80 hover:border-slate-700 shadow-sm'
                }`}
              >
                <div>
                  {/* Branch Card Top */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
                          branch.isMain
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-slate-100">{branch.name}</h3>
                          {branch.isMain && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20">
                              Merkez
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {branch.district}, {branch.city}
                          </span>
                        </p>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Aktif Terminal
                      </span>
                    )}
                  </div>

                  {/* Branch Metrics */}
                  <div className="space-y-2 py-3 border-y border-slate-800/60 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Bugünkü Ciro:</span>
                      <span className="text-emerald-400 font-semibold tabular-nums text-sm">
                        {branch.dailyRevenue.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Dolu Masa:</span>
                      <span className="text-slate-200 tabular-nums">
                        {branch.activeTablesCount} Masa Açık
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Telefon:</span>
                      <span className="text-slate-400 tabular-nums">{branch.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Bulut Gecikmesi:</span>
                      <span className="text-blue-400 tabular-nums">24 ms (Senkronize)</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-800/50 text-slate-400 font-medium text-xs flex items-center justify-center gap-1.5 cursor-default border border-slate-700/40"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Şu Anda Bu Şubedesiniz</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSwitchBranch(branch)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Bu Şubeye Geçiş Yap</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
