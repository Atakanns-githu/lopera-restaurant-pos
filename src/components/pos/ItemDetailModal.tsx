'use client';

import React, { useState } from 'react';
import { MenuItem, MenuItemModifier, OrderItemModifierSelection } from '@/types/pos';
import { sounds } from '@/lib/audio';
import { X, Plus, Minus, ChefHat, Check, AlertCircle } from 'lucide-react';

interface ItemDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (modifiers: OrderItemModifierSelection[], specialNote?: string, quantity?: number) => void;
}

export default function ItemDetailModal({ item, isOpen, onClose, onAdd }: ItemDetailModalProps) {
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, MenuItemModifier>>({});
  const [specialNote, setSpecialNote] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  if (!isOpen || !item) return null;

  const handleModifierSelect = (groupName: string, option: MenuItemModifier) => {
    sounds.playTap();
    setSelectedModifiers((prev) => ({
      ...prev,
      [groupName]: option,
    }));
  };

  const calculateTotal = () => {
    const modTotal = Object.values(selectedModifiers).reduce((sum, m) => sum + m.priceDelta, 0);
    return (item.price + modTotal) * quantity;
  };

  const handleConfirm = () => {
    sounds.playTap();
    const modifierList: OrderItemModifierSelection[] = Object.entries(selectedModifiers).map(
      ([groupName, option]) => ({
        groupName,
        name: option.name,
        priceDelta: option.priceDelta,
      })
    );

    onAdd(modifierList, specialNote.trim() || undefined, quantity);
    onClose();
    // Reset state
    setSelectedModifiers({});
    setSpecialNote('');
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-stone-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-800 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                {item.prepTimeMinutes} dk Hazırlık
              </span>
              {item.allergens && item.allergens.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">
                  {item.allergens.join(', ')}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-stone-100">{item.name}</h3>
            <p className="text-xs text-stone-400 mt-1">{item.description}</p>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              onClose();
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modifiers & Options */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {item.modifiers?.map((group) => (
            <div key={group.groupName} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-200">{group.groupName}</span>
                {group.required && (
                  <span className="text-[10px] text-amber-400 font-medium">Zorunlu Seçim</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {group.options.map((opt) => {
                  const isSelected = selectedModifiers[group.groupName]?.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleModifierSelect(group.groupName, opt)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-white font-semibold'
                          : 'bg-[#181c2a] border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-xs">{opt.name}</span>
                      {opt.priceDelta > 0 && (
                        <span className="text-[11px] font-mono text-amber-400">
                          +{opt.priceDelta} ₺
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Kitchen Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-200">
              Mutfak & Şef Özel Notu:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {['Az Tuzlu', 'Tuzsuz', 'Sos Ayrı Gelsin', 'Alerjen Dikkat', 'Acısız', 'Buzsuz'].map(
                (quickNote) => (
                  <button
                    key={quickNote}
                    type="button"
                    onClick={() => {
                      sounds.playTap();
                      setSpecialNote((prev) => (prev ? `${prev}, ${quickNote}` : quickNote));
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 border border-stone-700/60 transition-colors"
                  >
                    +{quickNote}
                  </button>
                )
              )}
            </div>
            <textarea
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder="Örn: Misafir sosu ayrı istiyor, ekmek kızartılsın..."
              rows={2}
              className="w-full rounded-xl bg-[#0a0d14] border border-stone-800 p-3 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer: Quantity & Add Button */}
        <div className="pt-4 border-t border-stone-800 mt-4 flex items-center justify-between gap-4">
          {/* Quantity selector */}
          <div className="flex items-center gap-3 bg-[#0a0d14] border border-stone-800 rounded-xl p-1">
            <button
              onClick={() => {
                sounds.playTap();
                setQuantity((q) => Math.max(1, q - 1));
              }}
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono font-bold text-sm text-stone-100 min-w-[20px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => {
                sounds.playTap();
                setQuantity((q) => q + 1);
              }}
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to check button */}
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-between transition-all active:scale-95"
          >
            <span>Adisyona Ekle</span>
            <span className="font-mono text-sm font-extrabold">
              {calculateTotal().toLocaleString('tr-TR')} ₺
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
