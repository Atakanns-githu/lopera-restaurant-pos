'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import {
  Building2,
  TrendingUp,
  MapPin,
  Phone,
  CheckCircle2,
  Share2,
  Layers,
  ArrowRight,
  Plus,
  RefreshCw,
  Sliders,
  DollarSign,
  Users,
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
    <div className="flex-1 flex flex-col h-full w-full bg-[#090b10] text-stone-100 overflow-hidden select-none">
      {/* Top Header & Chain Metrics */}
      <div className="p-4 border-b border-stone-800/80 bg-[#0e111a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-stone-100">
                  Zincir İşletme & Çoklu Şube Yönetimi
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                  Merkezi Bulut Konsolu
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Tüm şubelerin anlık cirosu, menü senkronizasyonu ve merkezi kontrol
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncAllBranches}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-[#141824] hover:bg-[#1a2030] border border-stone-800 text-stone-200 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Senkronize Ediliyor...' : 'Tüm Şubelere Menüyü Dağıt'}</span>
            </button>

            <button
              onClick={() => sounds.playTap()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Şube Tanımla</span>
            </button>
          </div>
        </div>

        {/* Sync Success Alert */}
        {syncSuccess && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Merkezi menü fiyatları ve reçeteler tüm şubelere başarıyla aktarıldı!</span>
          </div>
        )}

        {/* 3 Chain KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#121624] border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400">Zincir Toplam Günlük Ciro</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                {totalChainRevenue.toLocaleString('tr-TR')} ₺
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121624] border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400">Toplam Aktif Masa (Tüm Şubeler)</div>
              <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                {totalActiveTables} Masa Dolu
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121624] border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400">Bağlı Şube Sayısı</div>
              <div className="text-lg font-bold font-mono text-stone-100 mt-0.5">
                {branches.length} Aktif Lokasyon
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
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
                className={`rounded-3xl p-5 border flex flex-col justify-between transition-all shadow-xl ${
                  isCurrent
                    ? 'bg-[#151a2a] border-amber-500/40 ring-1 ring-amber-500/30'
                    : 'bg-[#121622] border-stone-800/80 hover:border-stone-700'
                }`}
              >
                <div>
                  {/* Branch Card Top */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                          branch.isMain
                            ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                            : 'bg-stone-800 text-stone-300'
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-stone-100">{branch.name}</h3>
                          {branch.isMain && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                              Merkez
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-stone-500" />
                          <span>
                            {branch.district}, {branch.city}
                          </span>
                        </p>
                      </div>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        Aktif Terminal
                      </span>
                    )}
                  </div>

                  {/* Branch Metrics */}
                  <div className="space-y-2 py-3 border-y border-stone-800/60 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Bugünkü Ciro:</span>
                      <span className="text-emerald-400 font-bold text-sm">
                        {branch.dailyRevenue.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Dolu Masa:</span>
                      <span className="text-stone-200 font-bold">
                        {branch.activeTablesCount} Masa Açık
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Telefon:</span>
                      <span className="text-stone-400">{branch.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Bulut Gecikmesi:</span>
                      <span className="text-blue-400">24 ms (Senkronize)</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-stone-800/80 text-stone-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-default"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Şu Anda Bu Şubedesiniz</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSwitchBranch(branch)}
                      className="w-full py-2.5 rounded-xl bg-[#181d2e] hover:bg-amber-500 hover:text-stone-950 text-stone-200 font-bold text-xs border border-stone-700 hover:border-amber-500 flex items-center justify-center gap-1.5 transition-all"
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
