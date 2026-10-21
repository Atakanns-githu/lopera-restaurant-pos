'use client';

import React from 'react';
import { POSProvider, usePOS } from '@/lib/store';
import Navbar from '@/components/Navbar';
import FloorPlan3D from '@/components/floor-plan/FloorPlan3D';
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

function POSApp() {
  const { activeTab, viewMode } = usePOS();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#090b10] text-stone-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Main View Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'floor' && (
          viewMode === '3d' ? <FloorPlan3D /> : <FloorPlan2D />
        )}

        {activeTab === 'pos' && (
          <div className="flex-1 flex w-full h-full overflow-hidden">
            <PosMenu />
            <OrderCheckSlip />
          </div>
        )}

        {activeTab === 'kds' && <KitchenDisplay />}

        {activeTab === 'inventory' && <InventoryManager />}

        {activeTab === 'reports' && <ZReportDashboard />}
      </main>

      {/* Global Modals */}
      <StaffPinModal />
      <TableTransferModal />
      <PaymentModal />
      <ReceiptModal />
    </div>
  );
}

export default function Home() {
  return (
    <POSProvider>
      <POSApp />
    </POSProvider>
  );
}
