'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { usePOS } from '@/lib/store';
import { MenuItem } from '@/types/pos';
import { sounds } from '@/lib/audio';
import {
  X,
  QrCode,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
} from 'lucide-react';

export default function CustomerQrMenuModal() {
  const {
    isQrMenuModalOpen,
    setIsQrMenuModalOpen,
    categories,
    menuItems,
    tables,
    addItemToTableOrder,
  } = usePOS();

  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>('A-1');
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [isOrderPlaced, setIsOrderPlaced] = useState<boolean>(false);

  if (!isQrMenuModalOpen) return null;

  const currentCategoryItems = menuItems.filter((i) => i.categoryId === selectedCatId);

  const handleAddToCart = (item: MenuItem) => {
    sounds.playAddItem();
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    sounds.playTap();
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.item.id === itemId) {
            const newQ = c.quantity + delta;
            return newQ > 0 ? { ...c, quantity: newQ } : null;
          }
          return c;
        })
        .filter(Boolean) as { item: MenuItem; quantity: number }[]
    );
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  const handlePlaceOrder = () => {
    const table = tables.find((t) => t.tableNumber === selectedTableNumber);
    if (!table || cart.length === 0) return;

    sounds.playOrderSent();
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch {}

    // Add items to that table order in system
    cart.forEach(({ item, quantity }) => {
      addItemToTableOrder(table.id, item, [], 'QR Menüden Gönderildi', quantity);
    });

    setIsOrderPlaced(true);
    setTimeout(() => {
      setCart([]);
      setIsOrderPlaced(false);
      setIsQrMenuModalOpen(false);
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-stone-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Smartphone Frame Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-100">Müşteri Dijital QR Menü</h3>
              <p className="text-[10px] text-stone-400">Masadan Temassız Sipariş Simülatörü</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              setIsQrMenuModalOpen(false);
            }}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table Selector */}
        <div className="p-2.5 rounded-2xl bg-[#090b10] border border-stone-800 mb-3 flex items-center justify-between">
          <span className="text-xs text-stone-300 font-medium">Bulunduğunuz Masa:</span>
          <select
            value={selectedTableNumber}
            onChange={(e) => setSelectedTableNumber(e.target.value)}
            className="bg-[#181c2a] border border-stone-700 text-amber-400 font-bold font-mono text-xs rounded-xl px-2.5 py-1 focus:outline-none"
          >
            {tables.map((t) => (
              <option key={t.id} value={t.tableNumber}>
                {t.name} ({t.section})
              </option>
            ))}
          </select>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playTap();
                setSelectedCatId(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCatId === cat.id
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mb-3">
          {currentCategoryItems.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-[#161a27] border border-stone-800 flex items-center justify-between gap-3"
            >
              <div className="flex-1">
                <div className="text-xs font-bold text-stone-100">{item.name}</div>
                <div className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">{item.description}</div>
                <div className="text-xs font-bold font-mono text-amber-400 mt-1">
                  {item.price.toLocaleString('tr-TR')} ₺
                </div>
              </div>

              <button
                onClick={() => handleAddToCart(item)}
                className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ekle</span>
              </button>
            </div>
          ))}
        </div>

        {/* Cart Bottom Drawer */}
        {cart.length > 0 && !isOrderPlaced && (
          <div className="pt-3 border-t border-stone-800 space-y-2 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-300 font-semibold flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>Masaya Gönderilecek ({cart.length} Ürün):</span>
              </span>
              <span className="font-mono font-bold text-amber-400">
                {cartTotal.toLocaleString('tr-TR')} ₺
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Siparişi Mutfağa Gönder ({cartTotal.toLocaleString('tr-TR')} ₺)</span>
            </button>
          </div>
        )}

        {/* Success Confirmation Animation */}
        {isOrderPlaced && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-1.5 animate-in zoom-in-95">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-200">Siparişiniz Mutfağa İletildi!</h4>
            <p className="text-xs text-stone-300">
              Masa {selectedTableNumber} için siparişiniz mutfak ekranına (KDS) düştü ve hazırlanıyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
