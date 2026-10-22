'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { MenuItem, OrderItemModifierSelection } from '@/types/pos';
import { sounds } from '@/lib/audio';
import ItemDetailModal from './ItemDetailModal';
import {
  Search,
  Soup,
  Flame,
  Wheat,
  Pizza,
  GlassWater,
  Wine,
  CakeSlice,
  Plus,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function PosMenu() {
  const { categories, menuItems, selectedTableId, addItemToTableOrder } = usePOS();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);

  // Icon mapper
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Soup':
        return <Soup className="w-3.5 h-3.5" />;
      case 'Flame':
        return <Flame className="w-3.5 h-3.5" />;
      case 'Wheat':
        return <Wheat className="w-3.5 h-3.5" />;
      case 'Pizza':
        return <Pizza className="w-3.5 h-3.5" />;
      case 'GlassWater':
        return <GlassWater className="w-3.5 h-3.5" />;
      case 'Wine':
        return <Wine className="w-3.5 h-3.5" />;
      case 'CakeSlice':
      default:
        return <CakeSlice className="w-3.5 h-3.5" />;
    }
  };

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = searchQuery ? true : item.categoryId === selectedCategoryId;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleItemClick = (item: MenuItem) => {
    sounds.playTap();
    if (!selectedTableId) return;

    if (item.modifiers && item.modifiers.length > 0) {
      // Open customization modal
      setModalItem(item);
    } else {
      // Quick add directly
      addItemToTableOrder(selectedTableId, item, []);
    }
  };

  const handleModalAdd = (
    modifiers: OrderItemModifierSelection[],
    specialNote?: string,
    quantity: number = 1
  ) => {
    if (!selectedTableId || !modalItem) return;
    addItemToTableOrder(selectedTableId, modalItem, modifiers, specialNote, quantity);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f17] border-r border-slate-800/80 overflow-hidden select-none">
      {/* Top Search & Category Bar */}
      <div className="p-4 border-b border-slate-800 bg-[#0e1320] space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Menüde ara (Antrikot, Burrata, Risotto, Tiramisu)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#111827] border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories Horizontal Scroller */}
        {!searchQuery && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedCategoryId(cat.id);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700 shadow-sm'
                      : 'bg-[#111827] text-slate-400 border border-slate-800/80 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {getCategoryIcon(cat.icon)}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Culinary Food Cards Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="group p-4 rounded-2xl bg-[#111827] border border-slate-800/80 hover:border-slate-700 hover:bg-[#141d30] transition-all cursor-pointer flex flex-col justify-between shadow-sm active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
                      {item.name}
                    </h4>
                    <span className="text-xs font-bold text-amber-400 font-mono tabular-nums whitespace-nowrap">
                      ₺{item.price.toLocaleString('tr-TR')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/70">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{item.prepTimeMinutes} dk</span>
                    </span>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                        Opsiyonel
                      </span>
                    )}
                  </div>

                  <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-amber-500 text-slate-300 group-hover:text-slate-950 flex items-center justify-center transition-colors shadow-sm">
                    <Plus className="w-4 h-4 font-bold" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs">
            <p>Aradığınız kriterlere uygun ürün bulunamadı.</p>
          </div>
        )}
      </div>

      {/* Customization Modal */}
      <ItemDetailModal
        item={modalItem}
        isOpen={Boolean(modalItem)}
        onClose={() => setModalItem(null)}
        onAdd={handleModalAdd}
      />
    </div>
  );
}
