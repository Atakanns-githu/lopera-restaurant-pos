'use client';

import React from 'react';
import { POSProvider, usePOS } from '@/lib/store';
import Navbar from '@/components/Navbar';
import FloorPlan2D from '@/components/floor-plan/FloorPlan2D';
import TableTransferModal from '@/components/floor-plan/TableTransferModal';
import PosMenu from '@/components/pos/PosMenu';
import OrderCheckSlip from '@/components/pos/OrderCheckSlip';
import PaymentModal from '@/components/pos/PaymentModal';
import ReceiptModal from '@/components/pos/ReceiptModal';
import KitchenDisplay from '@/components/kds/KitchenDisplay';
import InventoryManager from '@/components/inventory/InventoryManager';
import ZReportDashboard from '@/components/reports/ZReportDashboard';
import StaffPinModal from '@/components/StaffPinModal';
import DeliveryManager from '@/components/delivery/DeliveryManager';
import CourierTracker from '@/components/courier/CourierTracker';
import CustomerManager from '@/components/crm/CustomerManager';
import BranchManager from '@/components/branches/BranchManager';
import HardwareManager from '@/components/hardware/HardwareManager';

// Landing Components
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import PillBarSolutions from '@/components/landing/PillBarSolutions';
import CustomerQrMenuModal from '@/components/landing/CustomerQrMenuModal';
import { ShieldCheck, Heart, Sparkles, Phone, Mail, MapPin } from 'lucide-react';

function LandingFooter() {
  return (
    <footer className="border-t border-stone-800/80 bg-[#07090e] py-12 px-4 text-stone-400 text-xs select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-serif font-black text-stone-950">
              Z
            </div>
            <span className="font-serif font-extrabold text-base tracking-wider text-stone-100">
              ZADİSYON
            </span>
          </div>
          <p className="text-stone-400 text-[11px] leading-relaxed">
            Zynox Teknoloji tarafından yeni nesil kafe, restoran, zincir işletmeler ve lounge mekanlar için geliştirilmiş uçtan uca restoran işletim sistemi.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-stone-200 mb-3 text-xs uppercase tracking-wider">
            Çözümler
          </h4>
          <ul className="space-y-2 text-[11px]">
            <li className="hover:text-amber-400 cursor-pointer transition-colors">Paket Servis Entegrasyonları</li>
            <li className="hover:text-amber-400 cursor-pointer transition-colors">Mutfak KDS Ekranları</li>
            <li className="hover:text-amber-400 cursor-pointer transition-colors">Reçete & Stok Takibi</li>
            <li className="hover:text-amber-400 cursor-pointer transition-colors">Kurye GPS Telemetri</li>
            <li className="hover:text-amber-400 cursor-pointer transition-colors">Mali e-Adisyon (GİB)</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-stone-200 mb-3 text-xs uppercase tracking-wider">
            Kurumsal & Güvenlik
          </h4>
          <ul className="space-y-2 text-[11px]">
            <li className="hover:text-amber-400 cursor-pointer transition-colors">509 Sayılı VUK e-Adisyon Tebliği</li>
            <li className="hover:text-amber-400 cursor-pointer transition-colors">KVKK & Veri Güvenliği Politikası</li>
            <li className="hover:text-amber-400 cursor-pointer transition-colors">ISO 27001 Bilgi Güvenliği</li>
            <li className="hover:text-amber-400 cursor-pointer transition-colors">ÖKC Donanım Standartları</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-stone-200 mb-3 text-xs uppercase tracking-wider">
            İletişim & Destek
          </h4>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>0850 840 90 00 (7/24 Çağrı Merkezi)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>destek@zadisyon.zynox.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Zynox Teknopark, Levent / İstanbul</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-stone-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
        <div>
          © 2026 ZAdisyon / Zynox Restoran Teknolojileri A.Ş. Tüm hakları saklıdır.
        </div>
        <div className="flex items-center gap-2">
          <span>Made with</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          <span>for hospitality perfection</span>
        </div>
      </div>
    </footer>
  );
}

function MainApp() {
  const { mainView, activeTerminalTab } = usePOS();

  if (mainView === 'landing') {
    return (
      <div className="min-h-screen w-full bg-[#090b10] text-stone-100 flex flex-col font-sans overflow-x-hidden">
        {/* Customer & Brand Navigation Header (Mega-Menu Screenshot 1) */}
        <LandingHeader />

        {/* Hero Section */}
        <main className="flex-1">
          <LandingHero />

          {/* Pill Bar Tabs (Screenshot 2) & Solutions Grid (Screenshot 3) */}
          <PillBarSolutions />
        </main>

        {/* Brand Footer */}
        <LandingFooter />

        {/* Customer Interactive QR Digital Menu Simulator Modal */}
        <CustomerQrMenuModal />

        {/* Staff PIN Modal (For admin terminal secure entry) */}
        <StaffPinModal />
      </div>
    );
  }

  // Terminal (POS Operating System) View
  return (
    <div className="flex flex-col h-screen w-screen bg-[#090b10] text-stone-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Terminal View Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTerminalTab === 'floor' && <FloorPlan2D />}

        {activeTerminalTab === 'pos' && (
          <div className="flex-1 flex w-full h-full overflow-hidden">
            <PosMenu />
            <OrderCheckSlip />
          </div>
        )}

        {activeTerminalTab === 'kds' && <KitchenDisplay />}

        {activeTerminalTab === 'delivery' && <DeliveryManager />}

        {activeTerminalTab === 'courier' && <CourierTracker />}

        {activeTerminalTab === 'crm' && <CustomerManager />}

        {activeTerminalTab === 'inventory' && <InventoryManager />}

        {activeTerminalTab === 'branches' && <BranchManager />}

        {activeTerminalTab === 'hardware' && <HardwareManager />}

        {activeTerminalTab === 'reports' && <ZReportDashboard />}
      </main>

      {/* Global Modals */}
      <StaffPinModal />
      <TableTransferModal />
      <PaymentModal />
      <ReceiptModal />
      <CustomerQrMenuModal />
    </div>
  );
}

export default function Home() {
  return (
    <POSProvider>
      <MainApp />
    </POSProvider>
  );
}
