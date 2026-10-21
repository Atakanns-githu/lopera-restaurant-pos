'use client';

import React from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import {
  Trash2,
  Plus,
  Minus,
  Gift,
  Send,
  CreditCard,
  ArrowRightLeft,
  Users,
  Clock,
  Printer,
  Sparkles,
  Receipt,
} from 'lucide-react';

export default function OrderCheckSlip() {
  const {
    selectedTableId,
    tables,
    orders,
    getOrderByTableId,
    updateItemQuantity,
    removeItemFromOrder,
    toggleItemGift,
    applyDiscount,
    sendOrderToKitchen,
    setIsPaymentModalOpen,
    setIsTableTransferModalOpen,
    setIsReceiptModalOpen,
    setActiveReceiptOrder,
    selectTableAndOpenPOS,
  } = usePOS();

  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const order = selectedTableId ? getOrderByTableId(selectedTableId) : null;

  if (!selectedTable) {
    return (
      <div className="w-96 bg-[#0c0f17] flex flex-col items-center justify-center p-6 text-center text-stone-500 border-l border-stone-800 select-none">
        <Receipt className="w-12 h-12 text-stone-600 mb-3 opacity-60" />
        <h4 className="text-sm font-bold text-stone-300 mb-1">Masa Seçilmedi</h4>
        <p className="text-xs text-stone-400">
          Adisyonu görüntülemek ve sipariş girmek için sol menüden veya 3D kat planından bir masa seçin.
        </p>
      </div>
    );
  }

  const hasPendingItems = order?.items.some((i) => i.status === 'pending');

  return (
    <div className="w-96 bg-[#0e111a] flex flex-col h-full border-l border-stone-800/80 shadow-2xl relative select-none">
      {/* Top Header */}
      <div className="p-4 bg-[#141824] border-b border-stone-800/90 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-stone-100">{selectedTable.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
              {selectedTable.tableNumber}
            </span>
          </div>
          <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-stone-500" />
              <span>{order?.guestCount || selectedTable.capacity} Kişi</span>
            </span>
            <span>•</span>
            <span>{order?.waiterName || 'Garson: Atanmadı'}</span>
          </div>
        </div>

        {order && (
          <button
            onClick={() => {
              sounds.playPrintReceipt();
              setActiveReceiptOrder(order);
              setIsReceiptModalOpen(true);
            }}
            title="Adisyon Fişi Önizle & Yazdır"
            className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Slip Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {order && order.items.length > 0 ? (
          order.items.map((item) => {
            const modTotal = item.selectedModifiers.reduce((sum, m) => sum + m.priceDelta, 0);
            const lineTotal = (item.unitPrice + modTotal) * item.quantity;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all ${
                  item.isGift
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : item.status === 'pending'
                    ? 'bg-[#181c2b] border-amber-500/40 shadow-sm'
                    : 'bg-[#121622] border-stone-800/80'
                }`}
              >
                {/* Line title & Price */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-stone-100">{item.name}</span>
                      {item.isGift && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                          İKRAM
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-semibold">
                          Yeni
                        </span>
                      )}
                    </div>

                    {/* Modifiers */}
                    {item.selectedModifiers.length > 0 && (
                      <div className="text-[10px] text-amber-400/80 space-y-0.5 mt-0.5">
                        {item.selectedModifiers.map((mod, i) => (
                          <div key={i}>
                            • {mod.name} {mod.priceDelta > 0 && `(+${mod.priceDelta} ₺)`}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Special Note */}
                    {item.specialNote && (
                      <div className="text-[10px] text-stone-400 italic mt-0.5">
                        Not: &quot;{item.specialNote}&quot;
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-bold font-mono ${
                        item.isGift ? 'line-through text-stone-500' : 'text-stone-200'
                      }`}
                    >
                      {lineTotal.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                </div>

                {/* Controls: Quantity, Gift, Delete */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-800/60 mt-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateItemQuantity(order.id, item.id, -1)}
                      className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-xs text-amber-400">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateItemQuantity(order.id, item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Gift Toggle Button */}
                    <button
                      onClick={() => toggleItemGift(order.id, item.id)}
                      title="İkram Olarak İşaretle"
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                        item.isGift
                          ? 'bg-emerald-500 text-stone-950 font-bold'
                          : 'bg-stone-800 text-stone-400 hover:text-emerald-400'
                      }`}
                    >
                      <Gift className="w-3 h-3" />
                      <span>İkram</span>
                    </button>

                    {/* Delete Line */}
                    <button
                      onClick={() => removeItemFromOrder(order.id, item.id)}
                      className="p-1 rounded-lg text-stone-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-stone-500 text-xs">
            <p>Bu masada henüz sipariş bulunmamaktadır.</p>
            <p className="text-stone-400 mt-1">Soldaki menüden ürün ekleyin.</p>
          </div>
        )}
      </div>

      {/* Financial Summary & Discounts */}
      {order && (
        <div className="p-4 bg-[#141824] border-t border-stone-800/90 space-y-3">
          {/* Discount Quick Buttons */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-400 text-[11px] font-medium">İskonto / İndirim:</span>
            <div className="flex items-center gap-1">
              {[0, 10, 15, 20].map((rate) => (
                <button
                  key={rate}
                  onClick={() => applyDiscount(order.id, rate)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition-colors ${
                    order.discountRate === rate
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  %{rate}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-1 text-xs text-stone-400 pt-1 border-t border-stone-800/60 font-mono">
            <div className="flex justify-between">
              <span>Ara Toplam:</span>
              <span className="text-stone-200">{order.subtotal.toLocaleString('tr-TR')} ₺</span>
            </div>

            {order.coverCharge > 0 && (
              <div className="flex justify-between">
                <span>Kuver Bedeli:</span>
                <span className="text-stone-200">+{order.coverCharge.toLocaleString('tr-TR')} ₺</span>
              </div>
            )}

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>İndirim (%{order.discountRate}):</span>
                <span>-{order.discountAmount.toLocaleString('tr-TR')} ₺</span>
              </div>
            )}

            <div className="flex justify-between text-stone-500 text-[11px]">
              <span>KDV (%10 Dahil):</span>
              <span>{Math.round(order.total * 0.1).toLocaleString('tr-TR')} ₺</span>
            </div>

            <div className="flex justify-between items-center text-sm font-extrabold text-amber-400 pt-1 border-t border-stone-800">
              <span className="font-sans">GENEL TOPLAM:</span>
              <span className="text-base">{order.total.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {hasPendingItems && (
              <button
                onClick={() => sendOrderToKitchen(order.id)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Yeni Siparişi Mutfağa İlet</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playTap();
                  setIsTableTransferModalOpen(true);
                }}
                className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Masa Taşı</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setIsPaymentModalOpen(true);
                }}
                className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>Hesap Kapat / Ödeme Al</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
