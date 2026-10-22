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
  const changeGiven =
    selectedMethod === 'cash' && cashTendered > totalPayableThisStep
      ? cashTendered - totalPayableThisStep
      : 0;

  const handleProcessPayment = () => {
    if (stepAmount <= 0 || isNaN(stepAmount)) return;

    // Trigger visual confetti celebration if fully paying remainder
    if (stepAmount >= remaining) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#ffffff'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100">Hesap Tahsilatı & Ödeme</h2>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                {order.tableNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Kalan Adisyon Bakiyesi:{' '}
              <span className="font-mono font-bold text-amber-400 tabular-nums">
                ₺{remaining.toLocaleString('tr-TR')}
              </span>
            </p>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              setIsPaymentModalOpen(false);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
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
            className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
              paymentMode === 'full'
                ? 'bg-slate-800 text-white font-semibold border-slate-700 shadow-sm'
                : 'bg-[#0e1320] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Tam Hesap
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setPaymentMode('split_equal');
            }}
            className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              paymentMode === 'split_equal'
                ? 'bg-slate-800 text-white font-semibold border-slate-700 shadow-sm'
                : 'bg-[#0e1320] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Divide className="w-3.5 h-3.5" />
            <span>Eşit Bölüş</span>
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setPaymentMode('partial');
            }}
            className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              paymentMode === 'partial'
                ? 'bg-slate-800 text-white font-semibold border-slate-700 shadow-sm'
                : 'bg-[#0e1320] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Parçalı Tutar</span>
          </button>
        </div>

        {/* Split Equal Options */}
        {paymentMode === 'split_equal' && (
          <div className="p-3 rounded-xl bg-[#0e1320] border border-slate-800 mb-4 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">Bölünecek Kişi Sayısı:</span>
            <div className="flex items-center gap-1.5">
              {[2, 3, 4, 5, 6].map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    sounds.playTap();
                    setSplitCount(count);
                  }}
                  className={`w-7 h-7 rounded-lg font-mono text-xs font-semibold transition-all ${
                    splitCount === count
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
          <div className="p-3 rounded-xl bg-[#0e1320] border border-slate-800 mb-4">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Şimdi Tahsil Edilecek Tutar (₺):
            </label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder={`Örn: 500 (Kalan: ${remaining} ₺)`}
              className="w-full p-2 rounded-xl bg-[#0b0f17] border border-slate-700 text-sm font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

        {/* Payment Methods */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-2">Ödeme Türü:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'credit_card', name: 'Kredi Kartı', icon: <CreditCard className="w-4 h-4" /> },
              { id: 'cash', name: 'Nakit Kasa', icon: <Banknote className="w-4 h-4" /> },
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
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-slate-600 text-white font-semibold shadow-sm'
                      : 'bg-[#0e1320] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className={isSelected ? 'text-amber-400' : 'text-slate-400'}>{method.icon}</div>
                  <span className="text-[11px]">{method.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Quick Tender & Change Calculator */}
        {selectedMethod === 'cash' && (
          <div className="p-3 rounded-xl bg-[#0e1320] border border-slate-800 mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Verilen Nakit Tutar:</span>
              <div className="flex items-center gap-1.5 font-mono">
                {[stepAmount, 200, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      sounds.playTap();
                      setCashTendered(amt);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-medium"
                  >
                    ₺{amt}
                  </button>
                ))}
              </div>
            </div>

            {changeGiven > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-emerald-400 font-medium">Verilecek Para Üstü:</span>
                <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                  ₺{changeGiven.toLocaleString('tr-TR')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tip (Bahşiş) Quick Selection */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e1320] border border-slate-800 mb-4 text-xs">
          <span className="text-slate-400 font-medium">Servis Bahşişi:</span>
          <div className="flex items-center gap-1 font-mono">
            {[0, 5, 10, 15].map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  sounds.playTap();
                  setTipRate(rate);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  tipRate === rate
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-[#0b0f17] text-slate-400 hover:text-slate-200'
                }`}
              >
                %{rate}
              </button>
            ))}
          </div>
        </div>

        {/* Summary & Confirm Button */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-4 mt-auto">
          <div>
            <div className="text-[11px] text-slate-400">Bu Adımda Tahsil Edilecek:</div>
            <div className="text-lg font-bold font-mono text-amber-400 tabular-nums">
              ₺{totalPayableThisStep.toLocaleString('tr-TR')}
            </div>
          </div>

          <button
            onClick={handleProcessPayment}
            className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <Check className="w-4 h-4 font-bold" />
            <span>Tahsilatı Tamamla</span>
          </button>
        </div>
      </div>
    </div>
  );
}
