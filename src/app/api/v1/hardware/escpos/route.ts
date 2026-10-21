import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_ORDERS } from '@/lib/mockData';
import { generateEscPosReceipt } from '@/lib/escpos';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const tableId = searchParams.get('tableId');

  const order =
    (orderId && INITIAL_ORDERS.find((o) => o.id === orderId)) ||
    (tableId && INITIAL_ORDERS.find((o) => o.tableId === tableId)) ||
    INITIAL_ORDERS[0];

  if (!order) {
    return NextResponse.json({ error: 'Adisyon bulunamadı' }, { status: 404 });
  }

  const binaryData = generateEscPosReceipt(order, {
    branchName: 'ZADİSYON NIŞANTAŞI (MERKEZ)',
    eAdisyonUUID: 'e0892c90-4819-4829-9481-948012849100',
  });

  return new NextResponse(binaryData as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="escpos_${order.id.slice(0, 8)}.bin"`,
      'Content-Length': binaryData.length.toString(),
      'X-Printer-Protocol': 'EPSON-ESC/POS',
      'X-Codepage': 'CP857-Turkish',
    },
  });
}
