import { NextRequest, NextResponse } from 'next/server';

export interface WebhookOrderPayload {
  platform: 'yemeksepeti' | 'getir' | 'trendyol' | 'migros' | 'n8n';
  platformOrderId: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    deliveryNotes?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    options?: string[];
  }>;
  total: number;
  paymentMethod: 'online' | 'cash_on_delivery' | 'pos_on_delivery';
  createdAt?: string;
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as WebhookOrderPayload;

    if (!payload.platform || !payload.items || !payload.total) {
      return NextResponse.json(
        {
          success: false,
          error: 'Eksik veya geçersiz sipariş verisi (platform, items, total zorunludur)',
        },
        { status: 400 }
      );
    }

    const zadisyonOrderId = `pkg_${Date.now()}`;
    const timestamp = new Date().toISOString();

    console.log(
      `[ZAdisyon Webhook] Yeni paket sipariş alındı! Platform: ${payload.platform.toUpperCase()} | Kod: ${payload.platformOrderId || zadisyonOrderId} | Tutar: ${payload.total} TL`
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Sipariş ZAdisyon KDS ve Paket Terminaline başarıyla kaydedildi',
        zadisyonOrderId,
        platform: payload.platform,
        platformOrderId: payload.platformOrderId || zadisyonOrderId,
        customer: payload.customer?.name || 'Misafir Müşteri',
        total: payload.total,
        status: 'preparing',
        receivedAt: timestamp,
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook isteği çözümlenemedi (JSON parse hatası)',
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ONLINE',
    service: 'ZAdisyon Aggregator Webhook Gateway',
    supportedPlatforms: ['yemeksepeti', 'getir', 'trendyol', 'migros', 'n8n'],
    webhookUrl: 'https://zadisyon.vercel.app/api/v1/integrations/webhook',
    spec: 'JSON POST with items, customer and total',
    uptime: process.uptime ? `${Math.round(process.uptime())}s` : 'OK',
    timestamp: new Date().toISOString(),
  });
}
