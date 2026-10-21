import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_ORDERS } from '@/lib/mockData';
import { generateUblTrEadisyonXml } from '@/lib/eAdisyon';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');

  const order = (orderId && INITIAL_ORDERS.find((o) => o.id === orderId)) || INITIAL_ORDERS[0];

  if (!order) {
    return NextResponse.json({ error: 'Adisyon bulunamadı' }, { status: 404 });
  }

  const xmlContent = generateUblTrEadisyonXml(order);

  return new NextResponse(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `inline; filename="e-adisyon-${order.id.slice(0, 8)}.xml"`,
      'X-GIB-Standard': 'VUK-509-UBL-TR-2.1',
      'X-Profile-ID': 'EARSIVBELGE',
    },
  });
}
