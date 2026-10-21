'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import { AlertTriangle, ShieldX, KeyRound, AlertCircle } from 'lucide-react';

export default function EmergencyLockdownModal() {
  const { securitySettings, toggleEmergencyLockdown } = usePOS();
  const [adminPin, setAdminPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!securitySettings.emergencyLockdown) return null;

  const handleDigit = (digit: string) => {
    sounds.playTap();
    if (adminPin.length < 4) {
      const next = adminPin + digit;
      setAdminPin(next);
      setErrorMsg(null);
      if (next.length === 4) {
        verify(next);
      }
    }
  };

  const verify = (inputPin: string) => {
    // Master Admin PIN
    if (inputPin === '0000') {
      sounds.playPaymentSuccess();
      toggleEmergencyLockdown();
      setAdminPin('');
      setErrorMsg(null);
    } else {
      sounds.playKitchenAlert();
      setErrorMsg('Hatalı Yönetici PIN! Kilit kaldırılamadı.');
      setAdminPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-2xl animate-in fade-in select-none">
      <div className="bg-[#180a0a] border-2 border-red-600 rounded-3xl w-full max-w-md p-8 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-500 shadow-xl shadow-red-600/40 animate-bounce">
          <ShieldX className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black tracking-widest text-red-500 uppercase px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30">
            SİSTEM GÜVENLİK DONDURMASI
          </span>
          <h2 className="text-2xl font-black text-white tracking-wide">
            ACİL DURUM KİLİDİ AKTİF
          </h2>
          <p className="text-xs text-red-200/80 leading-relaxed">
            İşletme sahibi veya sistem yöneticisi tarafından tüm restoran terminalleri güvenlik gerekçesiyle dondurulmuştur. Hiçbir sipariş veya işlem yapılamaz.
          </p>
        </div>

        {/* Admin Unlock Keypad */}
        <div className="p-4 rounded-2xl bg-black/40 border border-red-800/60 space-y-3">
          <div className="text-xs font-bold text-red-300 flex items-center justify-center gap-1.5">
            <KeyRound className="w-4 h-4 text-red-400" />
            <span>Kilidi Kaldırmak İçin Admin PIN (0000) Giriniz</span>
          </div>

          <div className="flex justify-center gap-3 py-1">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  adminPin.length > idx
                    ? 'bg-red-500 border-red-500 scale-125 shadow-md shadow-red-500/50'
                    : 'border-red-900 bg-red-950'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <div className="text-xs text-red-400 font-semibold flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(digit)}
                className="h-10 rounded-xl bg-red-950/60 hover:bg-red-900/80 active:scale-95 border border-red-800 text-stone-100 font-mono font-bold text-sm"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={() => {
                sounds.playTap();
                setAdminPin('');
                setErrorMsg(null);
              }}
              className="h-10 rounded-xl bg-red-950/40 border border-red-800 text-red-400 font-bold text-xs"
            >
              Sil
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="h-10 rounded-xl bg-red-950/60 hover:bg-red-900/80 active:scale-95 border border-red-800 text-stone-100 font-mono font-bold text-sm"
            >
              0
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setAdminPin((prev) => prev.slice(0, -1));
                setErrorMsg(null);
              }}
              className="h-10 rounded-xl bg-red-950/40 border border-red-800 text-red-400 font-bold text-xs"
            >
              ←
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
