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
    <div className="flex-1 flex flex-col h-full bg-[#0a0d14] p-5 overflow-y-auto select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-400" />
            <span>Hammadde Stok & Reçete Yönetimi</span>
          </h2>
          <p className="text-xs text-stone-400">
            Adisyon kapandıkça reçetelere göre otomatik stok düşümü ve kritik seviye alarmları
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{criticalCount} Kalem Kritik Stokta!</span>
            </div>
          )}

          <div className="flex items-center p-1 rounded-2xl bg-[#121622] border border-stone-800">
            <button
              onClick={() => {
                sounds.playTap();
                setActiveSubTab('stocks');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'stocks'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Hammadde Depo
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setActiveSubTab('recipes');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'recipes'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
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
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hammadde ara (Antrikot, Trüf Yağı, Un)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121622] border border-stone-800 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Inventory Table */}
          <div className="rounded-2xl border border-stone-800 bg-[#121622] overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181c2c] border-b border-stone-800 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Hammadde Adı</th>
                  <th className="p-3.5">Mevcut Stok</th>
                  <th className="p-3.5">Kritik Eşik</th>
                  <th className="p-3.5">Birim Maliyet</th>
                  <th className="p-3.5">Durum</th>
                  <th className="p-3.5 text-right">Hızlı Stok Girişi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {filteredInventory.map((item) => {
                  const isCritical = item.currentStock <= item.criticalStock;
                  return (
                    <tr key={item.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-stone-200">{item.name}</td>
                      <td className="p-3.5 font-mono font-bold text-amber-400 text-sm">
                        {item.currentStock.toLocaleString('tr-TR')} {item.unit}
                      </td>
                      <td className="p-3.5 font-mono text-stone-400">
                        {item.criticalStock} {item.unit}
                      </td>
                      <td className="p-3.5 font-mono text-stone-300">
                        {item.costPerUnit.toLocaleString('tr-TR')} ₺ / {item.unit}
                      </td>
                      <td className="p-3.5">
                        {isCritical ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            KRİTİK
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            YETERLİ
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAddStock(item.id, 5)}
                            className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-mono font-semibold transition-colors"
                          >
                            +5 {item.unit}
                          </button>
                          <button
                            onClick={() => handleAddStock(item.id, 20)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-mono font-semibold transition-colors"
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
              className="p-4 rounded-2xl bg-[#121622] border border-stone-800 shadow-md"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-100">{recipe.menuItemName}</h4>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-stone-400 uppercase">
                  Reçete Hammadde Tüketimi (1 Porsiyon için):
                </span>
                <div className="space-y-1.5">
                  {recipe.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-[#0a0d14] border border-stone-800/80 flex items-center justify-between text-xs"
                    >
                      <span className="text-stone-300">{ing.ingredientName}</span>
                      <span className="font-mono font-bold text-amber-400">
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
