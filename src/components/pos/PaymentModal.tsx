'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { usePOS } from '@/lib/store';
import { PaymentMethod } from '@/types/pos';
import { sounds } from '@/lib/audio';
import {
  CreditCard,
  Banknote,
  UtensilsCrossed,
  QrCode,
  X,
  Check,
  Divide,
  Calculator,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function PaymentModal() {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    selectedTableId,
    getOrderByTableId,
    processPayment,
  } = usePOS();

  const order = selectedTableId ? getOrderByTableId(selectedTableId) : null;

  const [paymentMode, setPaymentMode] = useState<'full' | 'split_equal' | 'partial'>('full');
  const [splitCount, setSplitCount] = useState<number>(2);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('credit_card');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [tipRate, setTipRate] = useState<number>(0);

  if (!isPaymentModalOpen || !order) return null;

  const remaining = order.remainingAmount;

  // Amount to pay in this step
  let stepAmount = remaining;
  if (paymentMode === 'split_equal') {
    stepAmount = Math.ceil(remaining / splitCount);
  } else if (paymentMode === 'partial') {
    stepAmount = customAmount ? parseFloat(customAmount) : remaining;
  }

  const tipAmount = tipRate > 0 ? Math.round((stepAmount * tipRate) / 100) : 0;
  const totalPayableThisStep = stepAmount + tipAmount;

  // Change calculation for cash
  const changeGiven = selectedMethod === 'cash' && cashTendered > totalPayableThisStep ? cashTendered - totalPayableThisStep : 0;

  const handleProcessPayment = () => {
    if (stepAmount <= 0 || isNaN(stepAmount)) return;

    // Trigger visual confetti celebration if fully paying remainder
    if (stepAmount >= remaining) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#10b981', '#ffffff'],
        });
      } catch {}
    }

    processPayment(order.id, selectedMethod, stepAmount, tipAmount);

    if (stepAmount >= remaining) {
      setIsPaymentModalOpen(false);
    } else {
      // Partially paid, keep modal open with updated remainder
      setCustomAmount('');
      setCashTendered(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-stone-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#d4af37]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-stone-100">Hesap Ödeme & Tahsilat</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono font-bold">
                Masa {order.tableNumber}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Toplam Kalan Bakiye:{' '}
              <span className="font-mono font-bold text-amber-400">
                {remaining.toLocaleString('tr-TR')} ₺
              </span>
            </p>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              setIsPaymentModalOpen(false);
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Split Modes */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => {
              sounds.playTap();
              setPaymentMode('full');
            }}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
              paymentMode === 'full'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                : 'bg-[#181c2a] border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            Tam Hesap
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setPaymentMode('split_equal');
            }}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              paymentMode === 'split_equal'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                : 'bg-[#181c2a] border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <Divide className="w-3.5 h-3.5" />
            <span>Eşit Böl</span>
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setPaymentMode('partial');
            }}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              paymentMode === 'partial'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                : 'bg-[#181c2a] border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Parçalı Tutar</span>
          </button>
        </div>

        {/* Split Equal Options */}
        {paymentMode === 'split_equal' && (
          <div className="p-3 rounded-2xl bg-[#090b10] border border-stone-800 mb-4 flex items-center justify-between">
            <span className="text-xs text-stone-300 font-medium">Bölünecek Kişi Sayısı:</span>
            <div className="flex items-center gap-1.5">
              {[2, 3, 4, 5, 6].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    sounds.playTap();
                    setSplitCount(count);
                  }}
                  className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all ${
                    splitCount === count
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Partial Amount Input */}
        {paymentMode === 'partial' && (
          <div className="p-3 rounded-2xl bg-[#090b10] border border-stone-800 mb-4">
            <label className="block text-xs text-stone-300 mb-1.5">Şimdi Tahsil Edilecek Tutar (₺):</label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder={`Örn: 500 (Kalan: ${remaining} ₺)`}
              className="w-full p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-sm font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

        {/* Payment Methods */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-stone-300 mb-2">Ödeme Yöntemi:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'credit_card', name: 'Kredi Kartı', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'cash', name: 'Nakit Para', icon: <Banknote className="w-4 h-4" /> },
              { id: 'meal_voucher', name: 'Yemek Kartı', icon: <UtensilsCrossed className="w-4 h-4" /> },
              { id: 'online', name: 'FAST / QR', icon: <QrCode className="w-4 h-4" /> },
            ].map((method) => {
              const isSelected = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedMethod(method.id as PaymentMethod);
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500/20 to-amber-600/10 border-amber-500 text-white font-bold shadow-md shadow-amber-500/10'
                      : 'bg-[#181c2a] border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  <div className={isSelected ? 'text-amber-400' : 'text-stone-400'}>{method.icon}</div>
                  <span className="text-[11px] font-semibold">{method.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Quick Tender & Change Calculator */}
        {selectedMethod === 'cash' && (
          <div className="p-3 rounded-2xl bg-[#090b10] border border-stone-800 mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">Verilen Nakit Para:</span>
              <div className="flex items-center gap-1.5">
                {[stepAmount, 200, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      sounds.playTap();
                      setCashTendered(amt);
                    }}
                    className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[10px] font-mono text-stone-300 font-bold"
                  >
                    {amt} ₺
                  </button>
                ))}
              </div>
            </div>

            {changeGiven > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-xs">
                <span className="text-emerald-400 font-semibold">Müşteriye Verilecek Para Üstü:</span>
                <span className="font-mono text-base font-extrabold text-emerald-400">
                  {changeGiven.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tip (Bahşiş) Quick Selection */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#090b10] border border-stone-800 mb-4 text-xs">
          <span className="text-stone-400 font-medium">Garson Bahşişi:</span>
          <div className="flex items-center gap-1">
            {[0, 5, 10, 15].map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  sounds.playTap();
                  setTipRate(rate);
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors ${
                  tipRate === rate ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-400 hover:text-white'
                }`}
              >
                %{rate}
              </button>
            ))}
          </div>
        </div>

        {/* Summary & Confirm Button */}
        <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-4 mt-auto">
          <div>
            <div className="text-[11px] text-stone-400">Bu Adımda Ödenecek:</div>
            <div className="text-lg font-bold font-mono text-amber-400">
              {totalPayableThisStep.toLocaleString('tr-TR')} ₺
            </div>
          </div>

          <button
            onClick={handleProcessPayment}
            className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-bold text-xs shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Check className="w-4 h-4 font-extrabold" />
            <span>Ödemeyi Tamamla</span>
          </button>
        </div>
      </div>
    </div>
  );
}
