import { NextResponse } from 'next/server';
import { INITIAL_ORDERS } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json({
    success: true,
    totalOrders: INITIAL_ORDERS.length,
    activeOrders: INITIAL_ORDERS.filter((o) => o.status === 'open'),
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.tableId && !body.tableNumber) {
      return NextResponse.json(
        { success: false, error: 'Masa bilgisi zorunludur' },
        { status: 400 }
      );
    }

    const newOrder = {
      id: `ord_${Date.now()}`,
      tableId: body.tableId || 'custom',
      tableNumber: body.tableNumber || 'BAR',
      waiterName: body.waiterName || 'Kasa / POS',
      guestCount: body.guestCount || 1,
      items: body.items || [],
      subtotal: body.total || 0,
      total: body.total || 0,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Adisyon başarıyla oluşturuldu ve mutfağa iletildi',
        order: newOrder,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Geçersiz JSON verisi' },
      { status: 400 }
    );
  }
}
