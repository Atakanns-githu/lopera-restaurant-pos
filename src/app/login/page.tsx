'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import { INITIAL_STAFF } from '@/lib/mockData';
import { Staff } from '@/types/pos';
import {
  Lock,
  Delete,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { currentStaff, setCurrentStaff } = usePOS();
  const [selectedStaff, setSelectedStaff] = useState<Staff>(currentStaff);
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDigit = (digit: string) => {
    sounds.playTap();
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
      setErrorMsg(null);
    }
  };

  const handleBackspace = () => {
    sounds.playTap();
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    sounds.playTap();
    setPin('');
    setErrorMsg(null);
  };

  const handleLogin = () => {
    if (pin.length !== 4) {
      setErrorMsg('Lütfen 4 haneli PIN giriniz');
      return;
    }

    if (pin === selectedStaff.pin) {
      sounds.playPaymentSuccess();
      setCurrentStaff(selectedStaff);
      router.push('/terminal/tables');
    } else {
      sounds.playKitchenAlert();
      setErrorMsg('Hatalı PIN! Lütfen tekrar deneyin.');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090b10] text-stone-100 flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Header */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-stone-400 hover:text-amber-400 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Marka Sitesine Dön</span>
        </Link>
        <span className="text-[11px] font-mono text-stone-500">
          Zynox Güvenli Giriş v3.4
        </span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md mx-auto w-full bg-[#121624] border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40">
            <span className="font-serif font-black text-2xl text-stone-950">Z</span>
          </div>
          <h2 className="font-serif font-extrabold text-xl text-stone-100 tracking-wide">
            ZAdisyon Terminal Girişi
          </h2>
          <p className="text-xs text-stone-400">
            Personel veya Yönetici PIN kodunuzu giriniz
          </p>
        </div>

        {/* Staff Quick Select Buttons */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block text-center">
            Giriş Yapan Personel
          </label>
          <div className="grid grid-cols-2 gap-2">
            {INITIAL_STAFF.map((staff) => {
              const isSelected = selectedStaff.id === staff.id;
              return (
                <button
                  key={staff.id}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedStaff(staff);
                    setPin('');
                    setErrorMsg(null);
                  }}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-[#181d2e] border-stone-800/80 hover:border-stone-700 opacity-70'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl ${staff.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-sm`}
                  >
                    {staff.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-stone-200 truncate">
                      {staff.name}
                    </div>
                    <div className="text-[10px] text-stone-400 capitalize">
                      {staff.role === 'waiter' && 'Garson (1234)'}
                      {staff.role === 'cashier' && 'Kasiyer (2345)'}
                      {staff.role === 'chef' && 'Mutfak Şefi (3456)'}
                      {staff.role === 'manager' && 'Müdür (9999)'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PIN Indicators */}
        <div className="flex flex-col items-center space-y-2 py-2">
          <div className="flex gap-4">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  pin.length > idx
                    ? 'bg-amber-400 border-amber-400 shadow-md shadow-amber-400/40 scale-110'
                    : 'border-stone-700 bg-stone-900/60'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 pt-1 animate-shake">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-2xl bg-[#181d2e] hover:bg-[#222942] active:scale-95 border border-stone-800 text-stone-100 font-mono font-bold text-lg flex items-center justify-center transition-all shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-12 rounded-2xl bg-[#181d2e] hover:bg-[#222942] active:scale-95 border border-stone-800 text-stone-400 font-bold text-xs flex items-center justify-center transition-all"
          >
            TEMİZLE
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-[#181d2e] hover:bg-[#222942] active:scale-95 border border-stone-800 text-stone-100 font-mono font-bold text-lg flex items-center justify-center transition-all shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-[#181d2e] hover:bg-[#222942] active:scale-95 border border-stone-800 text-stone-400 flex items-center justify-center transition-all"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Submit CTA */}
        <button
          onClick={handleLogin}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20 active:scale-98"
        >
          <span>Terminale Giriş Yap</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-stone-500">
        © 2026 ZAdisyon / Zynox Restoran Teknolojileri • 509 Sıra No.lu VUK e-Adisyon Güvenli Giriş
      </div>
    </div>
  );
}
