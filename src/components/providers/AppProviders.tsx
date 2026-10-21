'use client';

import React from 'react';
import { POSProvider } from '@/lib/store';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <POSProvider>{children}</POSProvider>;
}
