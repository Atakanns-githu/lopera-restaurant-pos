'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/lib/store';
import Navbar from '@/components/Navbar';
import StaffPinModal from '@/components/StaffPinModal';
import TableTransferModal from '@/components/floor-plan/TableTransferModal';
import PaymentModal from '@/components/pos/PaymentModal';
import ReceiptModal from '@/components/pos/ReceiptModal';
import PermissionGuard from '@/components/security/PermissionGuard';
import ScreenLockOverlay from '@/components/security/ScreenLockOverlay';
import EmergencyLockdownModal from '@/components/security/EmergencyLockdownModal';
import { Shield, Lock, Loader2 } from 'lucide-react';

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, lockScreen, securitySettings } = usePOS();
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Kimlik doğrulama kontrolü (Hydration ve localStorage okumasını bekle)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Eğer oturum yoksa doğrudan /login sayfasına fırlat
      if (!isAuthenticated) {
        // Kontrol et; localStorage'da token var mıydı?
        const token = typeof window !== 'undefined' ? localStorage.getItem('zadisyon_session_token') : null;
        if (!token) {
          router.replace('/login');
        } else {
          setIsCheckingAuth(false);
        }
      } else {
        setIsCheckingAuth(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // İnaktivite Zaman Aşımı Takibi (Örn: 15 dakika)
  useEffect(() => {
    if (!isAuthenticated) return;

    const timeoutMs = (securitySettings.sessionTimeoutMinutes || 15) * 60 * 1000;

    const resetTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        lockScreen();
      }, timeoutMs);
    };

    resetTimer();

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [isAuthenticated, lockScreen, securitySettings.sessionTimeoutMinutes]);

  // Oturum henüz doğrulanıyorsa bekleme ekranı
  if (isCheckingAuth && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#090b10] text-stone-100 select-none">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl mb-4">
          <Shield className="w-8 h-8 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-stone-300 font-bold text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>ZAdisyon Güvenlik Doğrulaması...</span>
        </div>
        <p className="text-xs text-stone-500 mt-1">Yetkilendirilmiş personel oturumu taranıyor</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#090b10] text-stone-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Module Content Area with RBAC Guard */}
      <main className="flex-1 flex overflow-hidden relative">
        <PermissionGuard>{children}</PermissionGuard>
      </main>

      {/* Global Interactive Modals */}
      <StaffPinModal />
      <TableTransferModal />
      <PaymentModal />
      <ReceiptModal />

      {/* Security Overlays */}
      <ScreenLockOverlay />
      <EmergencyLockdownModal />
    </div>
  );
}
