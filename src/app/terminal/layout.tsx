'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import StaffPinModal from '@/components/StaffPinModal';
import TableTransferModal from '@/components/floor-plan/TableTransferModal';
import PaymentModal from '@/components/pos/PaymentModal';
import ReceiptModal from '@/components/pos/ReceiptModal';

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#090b10] text-stone-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Module Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {children}
      </main>

      {/* Global Interactive Modals */}
      <StaffPinModal />
      <TableTransferModal />
      <PaymentModal />
      <ReceiptModal />
    </div>
  );
}
