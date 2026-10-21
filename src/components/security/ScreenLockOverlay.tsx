'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import { Lock, AlertCircle, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ScreenLockOverlay() {
  const router = useRouter();
  const { isScreenLocked, currentStaff, unlockScreenWithPin, logout } = usePOS();
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isScreenLocked) return null;

  const handleDigit = (digit: string) => {
    sounds.playTap();
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      setErrorMsg(null);
      if (next.length === 4) {
        verify(next);
      }
    }
  };

  const verify = async (inputPin: string) => {
    const res = await unlockScreenWithPin(inputPin);
    if (res.success) {
      sounds.playPaymentSuccess();
      setPin('');
      setErrorMsg(null);
    } else {
      sounds.playKitchenAlert();
      setErrorMsg('Hatalı PIN! Kilit açılamadı.');
      setPin('');
    }
  };

  const handleClear = () => {
    sounds.playTap();
    setPin('');
    setErrorMsg(null);
  };

  const handleDelete = () => {
    sounds.playTap();
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleFullLogout = () => {
    sounds.playTap();
    logout();
    router.push('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="bg-[#121624] border border-amber-500/30 rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl text-center space-y-5 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#d4af37]" />

        {/* Lock Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
          <Lock className="w-7 h-7" />
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-stone-100 font-serif">
            Terminal Kilitlendi
          </h3>
          <p className="text-xs text-stone-400">
            Devam etmek için <strong className="text-amber-400">{currentStaff.name}</strong> PIN kodunu giriniz
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex flex-col items-center gap-2 py-1">
          <div className="flex gap-4">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  pin.length > idx
                    ? 'bg-amber-400 border-amber-400 scale-125 shadow-md shadow-amber-400/40'
                    : 'border-stone-700 bg-stone-900'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-400 font-semibold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-11 rounded-2xl bg-[#181d2e] hover:bg-[#222942] active:scale-95 border border-stone-800 text-stone-100 font-mono font-bold text-base transition-all"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-11 rounded-2xl bg-[#181d2e] text-stone-400 font-bold text-xs border border-stone-800"
          >
            Sil
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-11 rounded-2xl bg-[#181d2e] hover:bg-[#222942] active:scale-95 border border-stone-800 text-stone-100 font-mono font-bold text-base transition-all"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-11 rounded-2xl bg-[#181d2e] text-stone-400 font-bold text-xs border border-stone-800"
          >
            ←
          </button>
        </div>

        {/* Logout Option */}
        <div className="pt-2 border-t border-stone-800/80">
          <button
            onClick={handleFullLogout}
            className="text-xs text-stone-400 hover:text-rose-400 flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Farklı Personel ile Giriş Yap (Çıkış)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
