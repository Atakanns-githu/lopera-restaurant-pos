'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePOS } from '@/lib/store';
import { canAccessModule, getRequiredRoleForPath, ROLE_DEFINITIONS } from '@/lib/rbac';
import { sounds } from '@/lib/audio';
import { ShieldAlert, KeyRound, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PermissionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentStaff, supervisorOverride } = usePOS();

  const [isOverrideOpen, setIsOverrideOpen] = useState<boolean>(false);
  const [managerPin, setManagerPin] = useState<string>('');
  const [overrideGranted, setOverrideGranted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Eğer zaten geçici izin verilmişse veya rolün yetkisi varsa doğrudan göster
  const hasAccess = overrideGranted || canAccessModule(currentStaff.role, pathname);

  if (hasAccess) {
    return <>{children}</>;
  }

  const roleMeta = ROLE_DEFINITIONS[currentStaff.role];
  const requiredRoleTitle = getRequiredRoleForPath(pathname);

  const handleDigit = (digit: string) => {
    sounds.playTap();
    if (managerPin.length < 4) {
      setManagerPin((prev) => prev + digit);
      setErrorMsg(null);
    }
  };

  const handleClear = () => {
    sounds.playTap();
    setManagerPin('');
    setErrorMsg(null);
  };

  const handleDelete = () => {
    sounds.playTap();
    setManagerPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleVerifyOverride = async () => {
    if (managerPin.length !== 4) {
      setErrorMsg('Lütfen 4 haneli müdür PIN giriniz');
      return;
    }

    const success = await supervisorOverride(managerPin);
    if (success) {
      sounds.playPaymentSuccess();
      setOverrideGranted(true);
      setIsOverrideOpen(false);
      setManagerPin('');
      setErrorMsg(null);
    } else {
      sounds.playKitchenAlert();
      setErrorMsg('Geçersiz Yönetici PIN! Yetki onaylanmadı.');
      setManagerPin('');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#090b10] select-none">
      <div className="max-w-md w-full bg-[#121624] border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_20px_#f43f5e]" />

        {/* Shield Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        {/* Title & Info */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold tracking-widest text-rose-400 uppercase">
            GÜVENLİK PROTOKOLÜ • ERİŞİM KISITLANDI
          </span>
          <h2 className="text-xl font-extrabold text-stone-100 font-serif">
            Yetkisiz Modül Girişi
          </h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            Mevcut kullanıcı profiliniz bu alana erişim yetkisine sahip değildir.
          </p>
        </div>

        {/* Active Staff Badge & Required Role */}
        <div className="p-3.5 rounded-2xl bg-[#181d2e] border border-stone-800 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-400">Giriş Yapan:</span>
            <span className="font-bold text-stone-200">{currentStaff.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-400">Mevcut Rol:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleMeta.badgeBg}`}>
              {roleMeta.badgeText}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-800/80">
            <span className="text-stone-400">Gereken Yetki:</span>
            <span className="font-bold text-amber-400">{requiredRoleTitle}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {!isOverrideOpen ? (
          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                sounds.playTap();
                setIsOverrideOpen(true);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98"
            >
              <KeyRound className="w-4 h-4" />
              <span>Yönetici PIN Onayı (Supervisor Override)</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                router.push('/terminal/tables');
              }}
              className="w-full py-3 rounded-2xl bg-[#181d2e] hover:bg-[#222942] border border-stone-800 text-stone-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Yetkili Olduğum Sayfaya Dön</span>
            </button>
          </div>
        ) : (
          /* Supervisor PIN Keypad Modal */
          <div className="space-y-4 pt-2 border-t border-stone-800/80 animate-in fade-in">
            <div className="text-xs text-amber-400 font-semibold flex items-center justify-center gap-1.5">
              <KeyRound className="w-4 h-4" />
              <span>Müdür / Patron PIN Kodunu Giriniz</span>
            </div>

            {/* PIN Dots */}
            <div className="flex justify-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    managerPin.length > idx
                      ? 'bg-amber-400 border-amber-400 scale-110 shadow-md shadow-amber-400/40'
                      : 'border-stone-700 bg-stone-900'
                  }`}
                />
              ))}
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-400 font-semibold flex items-center justify-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigit(digit)}
                  className="h-10 rounded-xl bg-[#181d2e] hover:bg-[#222942] text-stone-100 font-mono font-bold text-sm border border-stone-800 transition-all active:scale-95"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="h-10 rounded-xl bg-[#181d2e] text-stone-400 font-bold text-[11px] border border-stone-800"
              >
                Sil
              </button>
              <button
                onClick={() => handleDigit('0')}
                className="h-10 rounded-xl bg-[#181d2e] hover:bg-[#222942] text-stone-100 font-mono font-bold text-sm border border-stone-800 transition-all active:scale-95"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                className="h-10 rounded-xl bg-[#181d2e] text-stone-400 font-bold text-[11px] border border-stone-800"
              >
                ←
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  sounds.playTap();
                  setIsOverrideOpen(false);
                  setManagerPin('');
                  setErrorMsg(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-semibold text-xs"
              >
                Vazgeç
              </button>
              <button
                onClick={handleVerifyOverride}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
              >
                Onayla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
