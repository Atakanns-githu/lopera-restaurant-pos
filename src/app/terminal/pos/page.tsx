'use client';

import React from 'react';
import PosMenu from '@/components/pos/PosMenu';
import OrderCheckSlip from '@/components/pos/OrderCheckSlip';

export default function PosPage() {
  return (
    <div className="flex-1 flex w-full h-full overflow-hidden">
      <PosMenu />
      <OrderCheckSlip />
    </div>
  );
}
