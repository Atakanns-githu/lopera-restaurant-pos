'use client';

import React, { useState } from 'react';
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
  Receipt,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function OrderCheckSlip() {
  const {
    selectedTableId,
    setSelectedTableId,
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

  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);

  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const order = selectedTableId ? getOrderByTableId(selectedTableId) : null;

  if (!selectedTable) {
    // Empty state: provide instant table selector and quick bar sale!
    return (
      <div className="w-96 bg-[#0e1320] flex flex-col items-center justify-center p-6 text-center text-slate-400 border-l border-slate-800/80 select-none">
        <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 shadow-sm mb-4">
          <Receipt className="w-7 h-7" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200 mb-1">Masa Seçilmedi</h4>
        <p className="text-xs text-slate-400 max-w-xs mb-5">
          Sipariş girmek veya hesap almak için aşağıdaki masalardan birini seçin:
        </p>

        {/* Quick Table Grid Picker */}
        <div className="w-full max-h-64 overflow-y-auto space-y-1.5 p-1 mb-4">
          {tables.slice(0, 8).map((t) => {
            const isOcc = t.status === 'occupied' || t.status === 'bill_requested';
            return (
              <button
                key={t.id}
                onClick={() => {
                  sounds.playTap();
                  selectTableAndOpenPOS(t.id);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                  isOcc
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-300 hover:bg-amber-500/15'
                    : 'bg-[#111827] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{t.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isOcc
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isOcc ? 'Dolu' : 'Boş'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Sale Button */}
        <button
          onClick={() => {
            sounds.playTap();
            const firstEmpty = tables.find((t) => t.status === 'empty') || tables[0];
            if (firstEmpty) {
              selectTableAndOpenPOS(firstEmpty.id);
            }
          }}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 shadow-sm flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>Hızlı Masa Seç & Adisyon Başlat</span>
        </button>
      </div>
    );
  }

  const hasPendingItems = order?.items.some((i) => i.status === 'pending');

  return (
    <div className="w-96 bg-[#0e1320] flex flex-col h-full border-l border-slate-800/80 shadow-xl relative select-none">
      {/* Top Header with Fast Table Switcher */}
      <div className="p-4 bg-[#111827] border-b border-slate-800 flex items-center justify-between relative">
        <div className="flex-1">
          {/* Quick Table Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
              className="flex items-center gap-2 group text-left"
              title="Başka bir masaya hızlı geçiş yap"
            >
              <span className="text-base font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">
                {selectedTable.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {selectedTable.tableNumber}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  isTableDropdownOpen ? 'rotate-180 text-amber-400' : ''
                }`}
              />
            </button>

            {/* Table Switcher Popup */}
            {isTableDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 max-h-72 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase text-slate-400 border-b border-slate-800 mb-1">
                  Masa Değiştir
                </div>
                <div className="space-y-1">
                  {tables.map((t) => {
                    const isOcc = t.status === 'occupied' || t.status === 'bill_requested';
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          sounds.playTap();
                          selectTableAndOpenPOS(t.id);
                          setIsTableDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-all ${
                          t.id === selectedTableId
                            ? 'bg-slate-800 text-white font-semibold'
                            : isOcc
                            ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <span>{t.name}</span>
                        <span className="text-[10px] font-mono">
                          {isOcc ? 'Dolu' : 'Boş'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-500" />
              <span>{order?.guestCount || selectedTable.capacity} Kişi</span>
            </span>
            <span>•</span>
            <span className="truncate max-w-[140px]">
              {order?.waiterName || 'Garson Atanmadı'}
            </span>
          </div>
        </div>

        {order && (
          <button
            onClick={() => {
              sounds.playPrintReceipt();
              setActiveReceiptOrder(order);
              setIsReceiptModalOpen(true);
            }}
            title="Adisyon Fişi Yazdır"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Slip Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {order && order.items.length > 0 ? (
          order.items.map((item) => {
            const modTotal = item.selectedModifiers.reduce((sum, m) => sum + m.priceDelta, 0);
            const lineTotal = (item.unitPrice + modTotal) * item.quantity;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all ${
                  item.isGift
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : item.status === 'pending'
                    ? 'bg-[#151d30] border-amber-500/30 shadow-sm'
                    : 'bg-[#111827] border-slate-800/80'
                }`}
              >
                {/* Line title & Price */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-100">{item.name}</span>
                      {item.isGift && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold uppercase">
                          İKRAM
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-medium">
                          Yeni
                        </span>
                      )}
                    </div>

                    {/* Modifiers */}
                    {item.selectedModifiers.length > 0 && (
                      <div className="text-[10px] text-amber-400/80 space-y-0.5 mt-0.5 font-mono">
                        {item.selectedModifiers.map((mod, i) => (
                          <div key={i}>
                            • {mod.name} {mod.priceDelta > 0 && `(+₺${mod.priceDelta})`}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Special Note */}
                    {item.specialNote && (
                      <div className="text-[10px] text-slate-400 italic mt-0.5">
                        Not: &quot;{item.specialNote}&quot;
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-100 font-mono tabular-nums">
                    {item.isGift ? (
                      <span className="line-through text-slate-500 text-[11px]">
                        ₺{lineTotal.toLocaleString('tr-TR')}
                      </span>
                    ) : (
                      `₺${lineTotal.toLocaleString('tr-TR')}`
                    )}
                  </span>
                </div>

                {/* Stepper & Action Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-1.5 bg-[#0b0f17] p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => {
                        sounds.playTap();
                        updateItemQuantity(order.id, item.id, item.quantity - 1);
                      }}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-amber-400 font-mono tabular-nums text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        sounds.playTap();
                        updateItemQuantity(order.id, item.id, item.quantity + 1);
                      }}
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        sounds.playTap();
                        toggleItemGift(order.id, item.id);
                      }}
                      title={item.isGift ? 'İkramı Geri Al' : 'İkram Yap'}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        item.isGift
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                          : 'bg-slate-800 text-slate-400 hover:text-emerald-400 border-slate-700'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        sounds.playTap();
                        removeItemFromOrder(order.id, item.id);
                      }}
                      title="Siparişten Sil"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-14 text-center text-slate-500 text-xs">
            <p>Bu masada henüz sipariş bulunmamaktadır.</p>
            <p className="text-slate-400 mt-1">Soldaki menüden ürün ekleyin.</p>
          </div>
        )}
      </div>

      {/* Financial Summary & Discounts */}
      {order && (
        <div className="p-4 bg-[#111827] border-t border-slate-800 space-y-3">
          {/* Discount Quick Buttons */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px] font-medium">İskonto / İndirim:</span>
            <div className="flex items-center gap-1">
              {[0, 10, 15, 20].map((rate) => (
                <button
                  key={rate}
                  onClick={() => applyDiscount(order.id, rate)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold font-mono transition-colors ${
                    order.discountRate === rate
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  %{rate}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono tabular-nums">
            <div className="flex justify-between">
              <span>Ara Toplam:</span>
              <span className="text-slate-200">₺{order.subtotal.toLocaleString('tr-TR')}</span>
            </div>

            {order.coverCharge > 0 && (
              <div className="flex justify-between">
                <span>Kuver Bedeli:</span>
                <span className="text-slate-200">+₺{order.coverCharge.toLocaleString('tr-TR')}</span>
              </div>
            )}

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>İndirim (%{order.discountRate}):</span>
                <span>-₺{order.discountAmount.toLocaleString('tr-TR')}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-bold text-slate-100 pt-2 border-t border-slate-800">
              <span className="font-sans text-xs uppercase tracking-wider text-slate-400">GENEL TOPLAM:</span>
              <span className="text-base text-amber-400 font-mono">₺{order.total.toLocaleString('tr-TR')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {hasPendingItems && (
              <button
                onClick={() => sendOrderToKitchen(order.id)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
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
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Taşı</span>
              </button>

              <button
                onClick={() => {
                  sounds.playTap();
                  setIsPaymentModalOpen(true);
                }}
                className="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <CreditCard className="w-4 h-4" />
                <span>Hesap Kapat / Tahsilat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
