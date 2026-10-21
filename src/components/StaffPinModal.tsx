'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { INITIAL_STAFF } from '@/lib/mockData';
import { sounds } from '@/lib/audio';
import { Staff } from '@/types/pos';
import { Lock, X, Check, ShieldCheck, KeyRound } from 'lucide-react';

export default function StaffPinModal() {
  const { isPinModalOpen, setIsPinModalOpen, currentStaff, setCurrentStaff } = usePOS();
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

  const verifyPin = (pin: string) => {
    const matched = INITIAL_STAFF.find((s) => s.pin === pin);
    if (matched) {
      sounds.playPaymentSuccess();
      setCurrentStaff(matched);
      setIsPinModalOpen(false);
      setPinInput('');
    } else {
      sounds.playKitchenAlert();
      setErrorMessage('Hatalı PIN Kodu! Lütfen tekrar deneyin.');
      setPinInput('');
    }
  };

  const handleDirectSelect = (staff: Staff) => {
    sounds.playTap();
    setCurrentStaff(staff);
    setIsPinModalOpen(false);
    setPinInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121622] border border-stone-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#d4af37]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800/80 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100">Personel Giriş & PIN Değişimi</h3>
              <p className="text-xs text-stone-400">4 haneli güvenlik kodunuzu tuşlayın</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playTap();
              setIsPinModalOpen(false);
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Display Bullets */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex items-center gap-4 py-4 px-8 rounded-2xl bg-[#090b10] border border-stone-800/80 shadow-inner">
            {[0, 1, 2, 3].map((index) => {
              const filled = index < pinInput.length;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    filled
                      ? 'bg-amber-400 scale-125 shadow-[0_0_12px_#d4af37]'
                      : 'bg-stone-800 border border-stone-700'
                  }`}
                />
              );
            })}
          </div>

          {errorMessage && (
            <p className="text-rose-400 text-xs mt-2 font-medium animate-pulse">{errorMessage}</p>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-13 rounded-2xl bg-[#191e2e] border border-stone-800/90 text-stone-100 hover:bg-amber-500 hover:text-stone-950 font-mono text-xl font-bold transition-all active:scale-95 shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-13 rounded-2xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800 text-xs font-semibold transition-all active:scale-95"
          >
            Temizle
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-13 rounded-2xl bg-[#191e2e] border border-stone-800/90 text-stone-100 hover:bg-amber-500 hover:text-stone-950 font-mono text-xl font-bold transition-all active:scale-95 shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-13 rounded-2xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800 text-xs font-semibold transition-all active:scale-95"
          >
            ← Sil
          </button>
        </div>

        {/* Quick Staff Switch for Demo / Testing */}
        <div className="pt-4 border-t border-stone-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Hızlı Personel Seçimi (Demo PIN)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {INITIAL_STAFF.map((staff) => (
              <button
                key={staff.id}
                onClick={() => handleDirectSelect(staff)}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                  currentStaff.id === staff.id
                    ? 'bg-amber-500/10 border-amber-500/40 text-stone-100 shadow-sm'
                    : 'bg-[#161a27] border-stone-800/70 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg ${staff.avatarBg} text-white flex items-center justify-center text-[10px] font-bold`}
                >
                  {staff.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-medium truncate">{staff.name}</div>
                  <div className="text-[10px] text-amber-400/80 font-mono">PIN: {staff.pin}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
