'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import { Staff } from '@/types/pos';
import { ROLE_DEFINITIONS } from '@/lib/rbac';
import { Lock, X, Check, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

export default function StaffPinModal() {
  const {
    isPinModalOpen,
    setIsPinModalOpen,
    currentStaff,
    setCurrentStaff,
    staffList,
    loginWithPin,
  } = usePOS();

  const [pinInput, setPinInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isPinModalOpen) return null;

  const handleDigit = (digit: string) => {
    sounds.playTap();
    setErrorMessage('');
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);

      // If reached 4 digits, check automatically
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleClear = () => {
    sounds.playTap();
    setPinInput('');
    setErrorMessage('');
  };

  const handleDelete = () => {
    sounds.playTap();
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const verifyPin = async (pin: string) => {
    const res = await loginWithPin(pin);
    if (res.success && res.staff) {
      sounds.playPaymentSuccess();
      setIsPinModalOpen(false);
      setPinInput('');
      setErrorMessage('');
    } else {
      sounds.playKitchenAlert();
      setErrorMessage(res.error || 'Hatalı PIN Kodu! Lütfen tekrar deneyin.');
      setPinInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Personel PIN Girişi</h2>
              <p className="text-xs text-slate-400">4 haneli güvenlik PIN kodunu tuşlayın</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              setIsPinModalOpen(false);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Display Bullets */}
        <div className="flex flex-col items-center justify-center mb-5">
          <div className="flex items-center gap-3.5 py-2.5 px-6 rounded-xl bg-[#0b0f17] border border-slate-800">
            {[0, 1, 2, 3].map((index) => {
              const filled = index < pinInput.length;
              return (
                <div
                  key={index}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                    filled
                      ? 'bg-amber-400 scale-110'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              );
            })}
          </div>

          {errorMessage && (
            <p className="text-rose-400 text-xs mt-2 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </p>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-11 rounded-xl bg-[#0e1320] border border-slate-800 hover:bg-slate-800 text-slate-100 font-mono text-lg font-semibold transition-all active:scale-[0.98]"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-11 rounded-xl bg-[#0e1320] border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium transition-all active:scale-[0.98]"
          >
            Temizle
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-11 rounded-xl bg-[#0e1320] border border-slate-800 hover:bg-slate-800 text-slate-100 font-mono text-lg font-semibold transition-all active:scale-[0.98]"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-11 rounded-xl bg-[#0e1320] border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium transition-all active:scale-[0.98]"
          >
            ← Sil
          </button>
        </div>

        {/* Current Active Staff Notice */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-md ${currentStaff.avatarBg} text-white flex items-center justify-center text-[10px] font-bold`}>
              {currentStaff.name.charAt(0)}
            </div>
            <div>
              <span className="text-slate-200 font-medium">{currentStaff.name}</span>
              <span className="text-[10px] text-amber-400 ml-1">({currentStaff.role})</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Güvenli POS</span>
        </div>
      </div>
    </div>
  );
}
