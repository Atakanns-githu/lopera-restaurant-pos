'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import {
  Boxes,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  BookOpen,
  Scale,
  Sparkles,
} from 'lucide-react';

export default function InventoryManager() {
  const { inventory, recipes, updateInventoryStock } = usePOS();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'stocks' | 'recipes'>('stocks');

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const criticalCount = inventory.filter((i) => i.currentStock <= i.criticalStock).length;

  const handleAddStock = (itemId: string, addAmount: number) => {
    sounds.playTap();
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;
    updateInventoryStock(itemId, Number((item.currentStock + addAmount).toFixed(2)));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f17] p-5 overflow-y-auto select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-400" />
            <span>Hammadde Stok & Reçete Yönetimi</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Adisyon kapandıkça reçetelere göre otomatik stok düşümü ve kritik seviye alarmları
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{criticalCount} Kalem Kritik Stokta</span>
            </div>
          )}

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111827] border border-slate-800">
            <button
              onClick={() => {
                sounds.playTap();
                setActiveSubTab('stocks');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSubTab === 'stocks'
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hammadde Depo
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setActiveSubTab('recipes');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeSubTab === 'recipes'
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Yemek Reçeteleri
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'stocks' ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hammadde ara (Antrikot, Trüf Yağı, Un)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#111827] border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-colors"
            />
          </div>

          {/* Inventory Table */}
          <div className="rounded-2xl border border-slate-800 bg-[#111827] overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1320] border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Hammadde Adı</th>
                  <th className="p-3.5">Mevcut Stok</th>
                  <th className="p-3.5">Kritik Eşik</th>
                  <th className="p-3.5">Birim Maliyet</th>
                  <th className="p-3.5">Durum</th>
                  <th className="p-3.5 text-right">Hızlı Stok Girişi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredInventory.map((item) => {
                  const isCritical = item.currentStock <= item.criticalStock;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-medium text-slate-200">{item.name}</td>
                      <td className="p-3.5 font-mono font-bold text-amber-400 text-sm tabular-nums">
                        {item.currentStock.toLocaleString('tr-TR')} {item.unit}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 tabular-nums">
                        {item.criticalStock} {item.unit}
                      </td>
                      <td className="p-3.5 font-mono text-slate-300 tabular-nums">
                        ₺{item.costPerUnit.toLocaleString('tr-TR')} / {item.unit}
                      </td>
                      <td className="p-3.5">
                        {isCritical ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/25">
                            Kritik
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            Yeterli
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAddStock(item.id, 5)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono font-medium transition-colors border border-slate-700"
                          >
                            +5 {item.unit}
                          </button>
                          <button
                            onClick={() => handleAddStock(item.id, 20)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-medium transition-colors"
                          >
                            +20 {item.unit}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Recipes Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <div
              key={recipe.menuItemId}
              className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100">{recipe.menuItemName}</h3>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Reçete Hammadde Tüketimi (1 Porsiyon için):
                </span>
                <div className="space-y-1.5">
                  {recipe.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#0e1320] border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-300 font-medium">{ing.ingredientName}</span>
                      <span className="font-mono font-semibold text-amber-400 tabular-nums">
                        {ing.amount} {ing.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
