import { NextResponse } from 'next/server';
import { INITIAL_TABLES, SECTIONS } from '@/lib/mockData';

export async function GET() {
  const occupiedCount = INITIAL_TABLES.filter(
    (t) => t.status === 'occupied' || t.status === 'bill_requested'
  ).length;

  return NextResponse.json({
    success: true,
    totalTables: INITIAL_TABLES.length,
    occupiedCount,
    emptyCount: INITIAL_TABLES.length - occupiedCount,
    sections: SECTIONS,
    tables: INITIAL_TABLES,
    timestamp: new Date().toISOString(),
  });
}
