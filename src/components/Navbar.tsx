'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  QrCode,
  ShieldCheck,
  Lock,
  LogOut,
  ChevronDown,
  LayoutGrid,
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
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clock tick
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
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

  // 1. Core daily operational tabs (Always visible, clean, 1-tap)
  const coreNavItems = [
    {
      href: '/terminal/tables',
      label: 'Masalar',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      href: '/terminal/pos',
      label: 'Hızlı POS',
      icon: <CreditCard className="w-4 h-4" />,
      badge: activeOrdersCount > 0 ? (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 font-bold ml-1">
          {activeOrdersCount}
        </span>
      ) : null,
    },
    {
      href: '/terminal/kds',
      label: 'Mutfak KDS',
      icon: <ChefHat className="w-4 h-4" />,
      badge: kdsPendingCount > 0 ? (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold ml-1 animate-pulse">
          {kdsPendingCount}
        </span>
      ) : null,
    },
    {
      href: '/terminal/delivery',
      label: 'Paket Servis',
      icon: <Truck className="w-4 h-4" />,
      badge: activeDeliveryCount > 0 ? (
        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500 text-white font-bold ml-1">
          {activeDeliveryCount}
        </span>
      ) : null,
    },
  ];

  // 2. Secondary & Backoffice modules in clean dropdown
  const secondaryNavItems = [
    {
      href: '/terminal/reports',
      label: 'Kasa & Z-Raporu',
      description: 'Günlük ciro, tahsilat ve mali özet',
      icon: <FileSpreadsheet className="w-4 h-4 text-emerald-400" />,
    },
    {
      href: '/terminal/crm',
      label: 'Cari & Sadakat',
      description: 'Müşteri hesapları ve sadakat puanları',
      icon: <Users className="w-4 h-4 text-sky-400" />,
    },
    {
      href: '/terminal/couriers',
      label: 'Kurye Takip',
      description: 'Canlı kurye konumları ve teslimat süreleri',
      icon: <Bike className="w-4 h-4 text-blue-400" />,
    },
    {
      href: '/terminal/inventory',
      label: 'Stok & Reçete',
      description: 'Hammadde maliyetleri ve kritik stok',
      icon: <Boxes className="w-4 h-4 text-amber-400" />,
      badge: criticalStockCount > 0 ? (
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-600 text-white font-bold">
          {criticalStockCount} Kritik
        </span>
      ) : null,
    },
    {
      href: '/terminal/branches',
      label: 'Zincir Şubeler',
      description: 'Çoklu şube performansı ve yetkileri',
      icon: <Building2 className="w-4 h-4 text-indigo-400" />,
    },
    {
      href: '/terminal/hardware',
      label: 'Donanım & Yazıcılar',
      description: 'Adisyon yazıcıları, terazi ve barkod',
      icon: <Cpu className="w-4 h-4 text-teal-400" />,
    },
    {
      href: '/terminal/admin',
      label: 'Yönetici & Güvenlik',
      description: 'Personel PIN, roller, audit log ve ayarlar',
      icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
      adminOnly: true,
    },
  ];

  // Filter accessible items
  const accessibleSecondaryItems = secondaryNavItems.filter((item) =>
    canAccessModule(currentStaff.role, item.href)
  );

  const isSecondaryActive = secondaryNavItems.some(
    (item) => pathname === item.href || pathname?.startsWith(item.href + '/')
  );

  const activeSecondaryItem = secondaryNavItems.find(
    (item) => pathname === item.href || pathname?.startsWith(item.href + '/')
  );

  const roleMeta = ROLE_DEFINITIONS[currentStaff.role] || ROLE_DEFINITIONS.waiter;

  return (
    <header className="bg-[#0e111a] border-b border-[#1e2433] px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 select-none shadow-xl">
      {/* Left: Brand & Quick QR */}
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
              <span className="font-serif tracking-wider text-sm font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                ZADİSYON
              </span>
              <span className="text-amber-400 text-[10px] font-sans font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                {currentBranch.name}
              </span>
            </div>
          </div>
        </Link>

        <Link
          href="/menu"
          target="_blank"
          onClick={() => sounds.playTap()}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all ml-1"
          title="Müşteri QR Menüyü Yeni Sekmede Aç"
        >
          <QrCode className="w-3.5 h-3.5 text-purple-400" />
          <span>Müşteri QR</span>
        </Link>
      </div>

      {/* Middle: 4 Operational Buttons + "Daha Fazla / Yönetim" Dropdown */}
      <nav className="flex items-center gap-1.5 bg-[#090b10] p-1 rounded-xl border border-stone-800/80 shadow-inner">
        {coreNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/terminal/tables' && pathname === '/terminal');
          const hasAccess = canAccessModule(currentStaff.role, item.href);

          if (!hasAccess) return null;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => sounds.playTap()}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge}
            </Link>
          );
        })}

        {/* Secondary Modules Menu ("Daha Fazla / Yönetim") */}
        {accessibleSecondaryItems.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                sounds.playTap();
                setIsMoreMenuOpen(!isMoreMenuOpen);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isSecondaryActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>
                {isSecondaryActive && activeSecondaryItem
                  ? activeSecondaryItem.label
                  : 'Yönetim & Diğer'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isMoreMenuOpen ? 'rotate-180 text-amber-400' : ''
                }`}
              />
            </button>

            {/* Dropdown Flyout */}
            {isMoreMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-[#121622] border border-stone-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-800/80 mb-1 flex items-center justify-between">
                  <span>Arka Ofis & Yönetim</span>
                  <span className="text-amber-400">{currentStaff.role.toUpperCase()}</span>
                </div>
                <div className="space-y-1">
                  {accessibleSecondaryItems.map((item) => {
                    const isItemActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          sounds.playTap();
                          setIsMoreMenuOpen(false);
                        }}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                          isItemActive
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                            : 'hover:bg-stone-800/70 text-stone-300 hover:text-white'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-[#0a0d14] border border-stone-800 shrink-0 mt-0.5">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">{item.label}</span>
                            {item.badge}
                          </div>
                          <p className="text-[10px] text-stone-400 truncate mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Right Controls: Clock, Sound, Lock, Logout, Staff Profile */}
      <div className="flex items-center gap-2">
        {/* Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141824] border border-stone-800/80 text-stone-300 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{time || '20:15'}</span>
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
          title="Oturumu Kapat ve Çıkış Yap"
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
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-[#141824] border border-stone-800 hover:border-amber-500/40 transition-all text-left group"
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
            <div className="text-[9px] text-amber-400 font-medium">
              {roleMeta.badgeText}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
