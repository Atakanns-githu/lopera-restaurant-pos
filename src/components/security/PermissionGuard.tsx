'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePOS } from '@/lib/store';
import { canAccessModule, getRequiredRoleForPath, ROLE_DEFINITIONS } from '@/lib/rbac';
import { sounds } from '@/lib/audio';
import { ShieldAlert, KeyRound, ArrowLeft, AlertCircle } from 'lucide-react';

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
      setErrorMsg('Lütfen 4 haneli yetkili PIN kodunu giriniz');
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
    <div className="flex-1 flex items-center justify-center p-6 bg-[#0b0f17] select-none">
      <div className="max-w-md w-full bg-[#0e1320] border border-slate-800 rounded-2xl p-7 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Shield Icon */}
        <div className="w-14 h-14 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {/* Title & Info */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            GÜVENLİK PROTOKOLÜ • ERİŞİM KISITLANDI
          </span>
          <h2 className="text-lg font-semibold text-slate-100">
            Yetkisiz Modül Girişi
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mevcut kullanıcı profiliniz bu alana erişim yetkisine sahip değildir.
          </p>
        </div>

        {/* Active Staff Badge & Required Role */}
        <div className="p-3.5 rounded-xl bg-[#111827] border border-slate-800 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Giriş Yapan:</span>
            <span className="font-semibold text-slate-200">{currentStaff.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Mevcut Rol:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${roleMeta.badgeBg}`}>
              {roleMeta.badgeText}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80">
            <span className="text-slate-400">Gereken Asgari Rol:</span>
            <span className="font-semibold text-amber-400">{requiredRoleTitle}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {!isOverrideOpen ? (
          <div className="space-y-2.5 pt-1">
            <button
              onClick={() => {
                sounds.playTap();
                setIsOverrideOpen(true);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <KeyRound className="w-4 h-4" />
              <span>Yönetici PIN Onayı (Supervisor Override)</span>
            </button>

            <button
              onClick={() => {
                sounds.playTap();
                router.push('/terminal/tables');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Yetkili Olduğum Sayfaya Dön</span>
            </button>
          </div>
        ) : (
          /* Supervisor PIN Keypad Modal */
          <div className="space-y-4 pt-2 border-t border-slate-800/80 animate-in fade-in duration-150">
            <div className="text-xs text-amber-400 font-medium flex items-center justify-center gap-1.5">
              <KeyRound className="w-4 h-4" />
              <span>Müdür / Yönetici PIN Kodunu Giriniz</span>
            </div>

            {/* PIN Dots */}
            <div className="flex justify-center gap-3 py-1">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    managerPin.length > idx
                      ? 'bg-amber-400 border-amber-400 scale-110 shadow-sm shadow-amber-400/40'
                      : 'border-slate-700 bg-slate-800'
                  }`}
                />
              ))}
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-400 font-medium flex items-center justify-center gap-1.5">
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
                  className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono font-semibold text-sm border border-slate-700 transition-colors"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 font-medium text-xs border border-slate-700 transition-colors"
              >
                Sil
              </button>
              <button
                onClick={() => handleDigit('0')}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono font-semibold text-sm border border-slate-700 transition-colors"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                className="h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 font-medium text-xs border border-slate-700 transition-colors"
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
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={handleVerifyOverride}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-sm transition-colors"
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
