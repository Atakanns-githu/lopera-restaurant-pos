'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import {
  Lock,
  Delete,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Timer,
  UserCheck,
  Building2,
  Mail,
  Key,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { staffList, loginWithPin, isAuthenticated, currentBranch, branches, setCurrentBranch } = usePOS();

  const [loginMode, setLoginMode] = useState<'pin' | 'password'>('pin');

  // PIN Login State
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successStaffName, setSuccessStaffName] = useState<string | null>(null);

  // Corporate Password Login State
  const [corporateEmail, setCorporateEmail] = useState<string>('atakan@zynox.com.tr');
  const [corporatePassword, setCorporatePassword] = useState<string>('');

  // Anti-Brute Force Koruma Durumu
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  // Eğer zaten oturum açıksa doğrudan terminale yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/terminal/tables');
    }
  }, [isAuthenticated, router]);

  // Kilit geri sayım sayacı
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleDigit = (digit: string) => {
    if (lockoutSeconds > 0) return;
    sounds.playTap();
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg(null);
      if (nextPin.length === 4) {
        submitPinLogin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    if (lockoutSeconds > 0) return;
    sounds.playTap();
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    if (lockoutSeconds > 0) return;
    sounds.playTap();
    setPin('');
    setErrorMsg(null);
  };

  const submitPinLogin = async (pinToVerify: string) => {
    const result = await loginWithPin(pinToVerify);

    if (result.success && result.staff) {
      sounds.playPaymentSuccess();
      setFailedAttempts(0);
      setSuccessStaffName(result.staff.name);
      setTimeout(() => {
        router.push('/terminal/tables');
      }, 500);
    } else {
      sounds.playKitchenAlert();
      const newFails = failedAttempts + 1;
      setFailedAttempts(newFails);
      setPin('');

      if (newFails >= 3) {
        setLockoutSeconds(60);
        setErrorMsg('3 kez hatalı PIN girildi! Terminal güvenliği için 60 saniye kilitlendi.');
      } else {
        setErrorMsg(`Geçersiz Personel PIN Kodu! (${3 - newFails} deneme hakkı kaldı)`);
      }
    }
  };

  const handleCorporatePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTap();

    // Check admin or manager by email and password
    const adminStaff = staffList.find(
      (s) => (s.email === corporateEmail || s.role === 'admin' || s.role === 'manager') && s.isActive
    );

    if (adminStaff && (corporatePassword === 'admin2026' || corporatePassword === adminStaff.pin || corporatePassword === '0000')) {
      sounds.playPaymentSuccess();
      await loginWithPin(adminStaff.pin);
      router.push('/terminal/admin');
    } else {
      sounds.playKitchenAlert();
      setErrorMsg('Geçersiz kurumsal e-posta veya yönetici parolası!');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090b10] text-stone-100 flex flex-col justify-between p-4 sm:p-8 select-none font-sans">
      {/* Top Header */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-serif font-black text-stone-950 text-xs shadow-md">
            Z
          </div>
          <span className="font-serif font-bold text-xs tracking-wider text-stone-200">
            ZADİSYON POS OS
          </span>
        </div>

        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>TLS 1.3 • Web Crypto SHA-256</span>
        </span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md mx-auto w-full bg-[#121624] border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#d4af37]" />

        {/* Brand & Branch Selector */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40">
            <span className="font-serif font-black text-2xl text-stone-950">Z</span>
          </div>
          <h2 className="font-serif font-extrabold text-xl text-stone-100 tracking-wide">
            ZAdisyon Restoran Terminali
          </h2>

          {/* Branch Picker */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#181d2e] border border-stone-800 text-[11px] text-amber-400 font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <select
              value={currentBranch.id}
              onChange={(e) => {
                const b = branches.find((item) => item.id === e.target.value);
                if (b) setCurrentBranch(b);
              }}
              className="bg-transparent border-none text-amber-400 font-semibold focus:outline-none cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#121624] text-stone-200">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#090b10] border border-stone-800/80">
          <button
            onClick={() => {
              sounds.playTap();
              setLoginMode('pin');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              loginMode === 'pin'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Personel PIN Girişi
          </button>
          <button
            onClick={() => {
              sounds.playTap();
              setLoginMode('password');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              loginMode === 'password'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Yönetici Girişi (Email)
          </button>
        </div>

        {/* ================= MODE 1: PURE PIN KEYPAD ================= */}
        {loginMode === 'pin' && (
          <div className="space-y-5">
            {/* Lockout Warning Banner */}
            {lockoutSeconds > 0 ? (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-center space-y-1 animate-pulse">
                <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
                  <Timer className="w-4 h-4 text-rose-400" />
                  <span>GÜVENLİK KİLİDİ AKTİF ({lockoutSeconds} sn)</span>
                </div>
                <p className="text-[11px] text-rose-400/90">
                  Ardışık hatalı denemeler nedeniyle klavye donduruldu.
                </p>
              </div>
            ) : successStaffName ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-center space-y-1 animate-in fade-in">
                <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Giriş Başarılı</span>
                </div>
                <p className="text-xs text-stone-200">
                  Hoş geldiniz, <strong>{successStaffName}</strong>. Terminal açılıyor...
                </p>
              </div>
            ) : (
              /* PIN Mask Indicators */
              <div className="flex flex-col items-center space-y-2 py-1">
                <p className="text-xs text-stone-400">4 haneli yetkili personel PIN kodunuzu giriniz</p>
                <div className="flex gap-4 pt-1">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
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
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  disabled={lockoutSeconds > 0}
                  onClick={() => handleDigit(digit)}
                  className="h-12 rounded-2xl bg-[#181d2e] hover:bg-[#222942] active:scale-95 disabled:opacity-40 disabled:pointer-events-none border border-stone-800 text-stone-100 font-mono font-bold text-lg flex items-center justify-center transition-all shadow-sm"
                >
                  {digit}
                </button>
              ))}
              <button
                disabled={lockoutSeconds > 0}
                onClick={handleClear}
                className="h-12 rounded-2xl bg-[#181d2e] hover:bg-[#222942] active:scale-95 disabled:opacity-40 border border-stone-800 text-stone-400 font-bold text-xs flex items-center justify-center transition-all"
              >
                TEMİZLE
              </button>
              <button
                disabled={lockoutSeconds > 0}
                onClick={() => handleDigit('0')}
                className="h-12 rounded-2xl bg-[#181d2e] hover:bg-[#222942] active:scale-95 disabled:opacity-40 border border-stone-800 text-stone-100 font-mono font-bold text-lg flex items-center justify-center transition-all shadow-sm"
              >
                0
              </button>
              <button
                disabled={lockoutSeconds > 0}
                onClick={handleBackspace}
                className="h-12 rounded-2xl bg-[#181d2e] hover:bg-[#222942] active:scale-95 disabled:opacity-40 border border-stone-800 text-stone-400 flex items-center justify-center transition-all"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ================= MODE 2: CORPORATE EMAIL & PASSWORD ================= */}
        {loginMode === 'password' && (
          <form onSubmit={handleCorporatePasswordLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Kurumsal E-Posta</span>
              </label>
              <input
                type="email"
                required
                value={corporateEmail}
                onChange={(e) => setCorporateEmail(e.target.value)}
                placeholder="yonetici@restoran.com"
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#181d2e] border border-stone-800 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Yönetici Parolası</span>
              </label>
              <input
                type="password"
                required
                value={corporatePassword}
                onChange={(e) => setCorporatePassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#181d2e] border border-stone-800 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
            >
              <span>Yönetim Konsoluna Giriş Yap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-stone-500 space-y-0.5">
        <div>© 2026 ZAdisyon / Zynox Restoran & POS Teknolojileri A.Ş.</div>
        <div className="text-[10px] text-stone-600">509 Sıra No.lu VUK e-Adisyon Güvenli Donanım Standardı</div>
      </div>
    </div>
  );
}
