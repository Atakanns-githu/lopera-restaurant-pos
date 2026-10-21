'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import { canAccessModule, ROLE_DEFINITIONS } from '@/lib/rbac';
import {
  Layers,
  CreditCard,
  ChefHat,
  Boxes,
  FileSpreadsheet,
  Volume2,
  VolumeX,
  Clock,
  Truck,
  Bike,
  Users,
  Building2,
  Cpu,
  ArrowLeft,
  QrCode,
  ShieldCheck,
  Lock,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentStaff,
    setIsPinModalOpen,
    orders,
    inventory,
    deliveryOrders,
    currentBranch,
    lockScreen,
    logout,
    securitySettings,
  } = usePOS();

  const [time, setTime] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleLogout = () => {
    sounds.playTap();
    logout();
    router.push('/login');
  };

  const handleLock = () => {
    sounds.playTap();
    lockScreen();
  };

  // Badge counts
  const activeOrdersCount = orders.filter((o) => o.status === 'open').length;
  const kdsPendingCount = orders
    .filter((o) => o.status === 'open')
    .flatMap((o) => o.items)
    .filter((i) => i.status === 'pending' || i.status === 'preparing').length;
  const criticalStockCount = inventory.filter((i) => i.currentStock <= i.criticalStock).length;
  const activeDeliveryCount = deliveryOrders.filter(
    (d) => d.status === 'pending' || d.status === 'preparing' || d.status === 'on_the_way'
  ).length;

  const navItems = [
    {
      href: '/terminal/tables',
      label: 'Kat & Masa Planı',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      href: '/terminal/pos',
      label: 'Hızlı POS',
      icon: <CreditCard className="w-4 h-4" />,
      badge: activeOrdersCount > 0 ? (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 font-bold">
          {activeOrdersCount}
        </span>
      ) : null,
    },
    {
      href: '/terminal/kds',
      label: 'Mutfak KDS',
      icon: <ChefHat className="w-4 h-4" />,
      badge: kdsPendingCount > 0 ? (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold animate-pulse">
          {kdsPendingCount}
        </span>
      ) : null,
    },
    {
      href: '/terminal/delivery',
      label: 'Paket Servis',
      icon: <Truck className="w-4 h-4" />,
      badge: activeDeliveryCount > 0 ? (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500 text-white font-bold">
          {activeDeliveryCount}
        </span>
      ) : null,
    },
    {
      href: '/terminal/couriers',
      label: 'Kurye Takip',
      icon: <Bike className="w-4 h-4" />,
    },
    {
      href: '/terminal/crm',
      label: 'Cari & Sadakat',
      icon: <Users className="w-4 h-4" />,
    },
    {
      href: '/terminal/inventory',
      label: 'Stok & Reçete',
      icon: <Boxes className="w-4 h-4" />,
      badge: criticalStockCount > 0 ? (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-600 text-white font-bold">
          !
        </span>
      ) : null,
    },
    {
      href: '/terminal/branches',
      label: 'Zincir Şubeler',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      href: '/terminal/hardware',
      label: 'Donanım & E-Dönüşüm',
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      href: '/terminal/reports',
      label: 'Z-Raporu & Finans',
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      href: '/terminal/admin',
      label: 'Admin Paneli',
      icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
      adminOnly: true,
    },
  ];

  const roleMeta = ROLE_DEFINITIONS[currentStaff.role] || ROLE_DEFINITIONS.waiter;

  return (
    <header className="bg-[#0e111a] border-b border-[#1e2433] px-3.5 py-2 flex items-center justify-between sticky top-0 z-40 select-none shadow-xl">
      {/* Brand & Concept Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/terminal/tables"
          onClick={() => sounds.playTap()}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40">
            <span className="font-serif font-black text-sm text-stone-950">Z</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif tracking-wider text-xs font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                ZADİSYON
              </span>
              <span className="text-amber-400 text-[10px] font-sans font-semibold px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                {currentBranch.name}
              </span>
              {securitySettings.emergencyLockdown && (
                <span className="text-red-400 bg-red-500/20 border border-red-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded animate-pulse">
                  KİLİTLİ
                </span>
              )}
            </div>
            <p className="text-[10px] text-stone-400 font-mono tracking-tight">
              Zynox POS OS v3.4 • Kurumsal Adisyon
            </p>
          </div>
        </Link>

        <Link
          href="/menu"
          target="_blank"
          onClick={() => sounds.playTap()}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all ml-2"
          title="Müşteri QR Menüyü Yeni Sekmede Aç"
        >
          <QrCode className="w-3.5 h-3.5 text-purple-400" />
          <span>Müşteri QR</span>
        </Link>
      </div>

      {/* Main Module Tabs (Real Next.js Links with RBAC indicators) */}
      <nav className="flex items-center gap-1 bg-[#090b10] p-1 rounded-xl border border-stone-800/80 shadow-inner overflow-x-auto max-w-[54vw] custom-scrollbar">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/terminal/tables' && pathname === '/terminal');
          const hasAccess = canAccessModule(currentStaff.role, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => sounds.playTap()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : hasAccess
                  ? 'text-stone-300 hover:text-white hover:bg-stone-800/50'
                  : 'text-stone-500 hover:text-stone-400 opacity-60'
              }`}
              title={!hasAccess ? 'Erişim için yönetici yetkisi gerekir' : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
              {!hasAccess && <Lock className="w-2.5 h-2.5 text-stone-500" />}
              {item.badge}
            </Link>
          );
        })}
      </nav>

      {/* Right Controls: Clock, Sound, Lock, Logout, Staff Profile */}
      <div className="flex items-center gap-2">
        {/* Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141824] border border-stone-800/80 text-stone-300 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{time || '20:15:00'}</span>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleSound}
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          className="p-1.5 rounded-lg bg-[#141824] border border-stone-800 text-stone-300 hover:text-white hover:border-stone-700 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          )}
        </button>

        {/* Quick Screen Lock Button */}
        <button
          onClick={handleLock}
          title="Terminal Ekranını Kilitle"
          className="p-1.5 rounded-lg bg-[#141824] border border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
        >
          <Lock className="w-4 h-4" />
        </button>

        {/* Quick Logout Button */}
        <button
          onClick={handleLogout}
          title="Oturumu Güvenli Kapat ve Çıkış Yap"
          className="p-1.5 rounded-lg bg-[#141824] border border-stone-800 text-stone-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Staff Switcher PIN button */}
        <button
          onClick={() => {
            sounds.playTap();
            setIsPinModalOpen(true);
          }}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-[#141824] border border-stone-800 hover:border-amber-500/40 transition-all text-left group"
        >
          <div
            className={`w-6 h-6 rounded-lg ${currentStaff.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-sm`}
          >
            {currentStaff.name.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-stone-200 group-hover:text-amber-400 transition-colors truncate max-w-[110px]">
              {currentStaff.name}
            </div>
            <div className="text-[9px] text-amber-400/90 font-medium">
              {roleMeta.badgeText}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
