'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { DeliveryOrder, DeliveryPlatform } from '@/types/pos';
import { sounds } from '@/lib/audio';
import {
  Truck,
  Phone,
  Bike,
  Plus,
  Clock,
  CheckCircle2,
  MapPin,
  Sparkles,
  ShoppingBag,
  Zap,
  Globe,
  Radio,
} from 'lucide-react';

export default function DeliveryManager() {
  const { deliveryOrders, couriers, updateDeliveryStatus, assignCourier, addDeliveryOrder } = usePOS();
  const [selectedPlatform, setSelectedPlatform] = useState<DeliveryPlatform | 'all'>('all');

  // New Phone Order Modal
  const [isNewOrderModal, setIsNewOrderModal] = useState<boolean>(false);
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custAddress, setCustAddress] = useState<string>('');
  const [dishSelection, setDishSelection] = useState<string>('Pizza Tartufata & Bresaola');
  const [webhookStatusText, setWebhookStatusText] = useState<string | null>(null);

  const filteredOrders = deliveryOrders.filter((order) => {
    if (selectedPlatform === 'all') return true;
    return order.platform === selectedPlatform;
  });

  const getPlatformBadge = (platform: DeliveryPlatform) => {
    switch (platform) {
      case 'yemeksepeti':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/25">
            Yemeksepeti
          </span>
        );
      case 'getir':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
            Getir Yemek
          </span>
        );
      case 'trendyol':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/25">
            Trendyol Go
          </span>
        );
      case 'phone':
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
            Telefon Siparişi
          </span>
        );
    }
  };

  const handleSimulateWebhook = async (
    platform: 'yemeksepeti' | 'getir' | 'trendyol' | 'n8n'
  ) => {
    sounds.playTap();
    const platformNames = {
      yemeksepeti: { name: 'Yemeksepeti', id: `YS-${Math.floor(10000 + Math.random() * 90000)}` },
      getir: { name: 'Getir Yemek', id: `GTR-${Math.floor(10000 + Math.random() * 90000)}` },
      trendyol: { name: 'Trendyol Go', id: `TY-${Math.floor(10000 + Math.random() * 90000)}` },
      n8n: { name: 'n8n Otomasyon', id: `N8N-${Math.floor(1000 + Math.random() * 9000)}` },
    };

    const target = platformNames[platform];
    const dummyCustomers = [
      { name: 'Kaan Demir', phone: '0533 491 82 14', address: 'Teşvikiye Cad. No: 18 D: 4 Şişli' },
      { name: 'Ece Karaca', phone: '0542 819 20 44', address: 'Valikonağı Cad. Akkavak Sk. No: 6' },
      { name: 'Onur Yılmaz', phone: '0535 918 30 11', address: 'Abdi İpekçi Cad. No: 22 D: 8' },
    ];
    const customer = dummyCustomers[Math.floor(Math.random() * dummyCustomers.length)];

    // Send real POST request to our API endpoint
    try {
      await fetch('/api/v1/integrations/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          platformOrderId: target.id,
          customer,
          items: [{ name: 'Pizza Tartufata & Bresaola', quantity: 2, price: 640 }],
          total: 1280,
          paymentMethod: 'online',
        }),
      });
    } catch {
      // Local fallback
    }

    // Add to POS local store immediately
    addDeliveryOrder({
      platform: platform === 'n8n' ? 'phone' : platform,
      customerName: `${customer.name}`,
      customerPhone: customer.phone,
      deliveryAddress: customer.address,
      items: [
        { name: 'Pizza Tartufata & Bresaola', quantity: 2, price: 640 },
        { name: 'San Pellegrino (750ml)', quantity: 1, price: 180 },
      ],
      total: 1460,
      paymentType: 'Online Kredi Kartı',
    });

    sounds.playPaymentSuccess();
    setWebhookStatusText(
      `✓ Canlı Webhook Alındı: ${target.name} [${target.id}] siparişi sisteme işlendi.`
    );
    setTimeout(() => setWebhookStatusText(null), 4500);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) return;

    addDeliveryOrder({
      platform: 'phone',
      customerName: custName,
      customerPhone: custPhone,
      deliveryAddress: custAddress || 'Nişantaşı / İstanbul',
      items: [{ name: dishSelection, quantity: 1, price: 640 }],
      total: 640,
      paymentType: 'Kapıda Kart',
    });

    setIsNewOrderModal(false);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f17] p-5 overflow-y-auto select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <span>Paket Servis & Sevkiyat Kontrolü</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Online sipariş platformları entegrasyonu, kurye atama ve teslimat akışı
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Platform Filters */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111827] border border-slate-800">
            {[
              { id: 'all', name: 'Tümü' },
              { id: 'phone', name: 'Telefon' },
              { id: 'yemeksepeti', name: 'Yemeksepeti' },
              { id: 'getir', name: 'Getir' },
              { id: 'trendyol', name: 'Trendyol' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playTap();
                  setSelectedPlatform(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedPlatform === tab.id
                    ? 'bg-slate-800 text-white font-semibold border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* New Phone Order Button */}
          <button
            onClick={() => {
              sounds.playTap();
              setIsNewOrderModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Telefon Siparişi Aç</span>
          </button>
        </div>
      </div>

      {/* Live Webhook Gateway Console Banner */}
      <div className="rounded-xl bg-[#111827] border border-slate-800 p-4 mb-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">
              Canlı Webhook Gateway API:
            </span>
            <code className="text-[11px] font-mono text-amber-400 px-2 py-0.5 rounded bg-[#0b0f17] border border-slate-800">
              /api/v1/integrations/webhook
            </code>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-400 mr-1">Canlı Test Tetikle:</span>
            <button
              onClick={() => handleSimulateWebhook('yemeksepeti')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-300 text-[11px] font-medium transition-all"
            >
              + Yemeksepeti
            </button>
            <button
              onClick={() => handleSimulateWebhook('getir')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-[11px] font-medium transition-all"
            >
              + Getir Yemek
            </button>
            <button
              onClick={() => handleSimulateWebhook('trendyol')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-orange-300 text-[11px] font-medium transition-all"
            >
              + Trendyol Go
            </button>
            <button
              onClick={() => handleSimulateWebhook('n8n')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-300 text-[11px] font-medium transition-all"
            >
              + n8n Webhook
            </button>
          </div>
        </div>

        {webhookStatusText && (
          <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{webhookStatusText}</span>
          </div>
        )}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-slate-800/80 bg-[#111827] p-4.5 flex flex-col justify-between shadow-sm hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                {getPlatformBadge(order.platform)}
                <span className="text-[11px] font-mono text-slate-400">
                  #{order.id.slice(0, 8)}
                </span>
              </div>

              <div className="space-y-1 mb-3">
                <div className="font-semibold text-slate-100 text-sm">
                  {order.customerName}
                </div>
                <div className="text-xs text-slate-400 font-mono">{order.customerPhone}</div>
                <div className="text-xs text-slate-400 flex items-start gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{order.deliveryAddress}</span>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-slate-800/80 py-2.5 space-y-1.5 font-mono text-xs tabular-nums">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-300">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-slate-400">
                      ₺{(item.price * item.quantity).toLocaleString('tr-TR')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">Toplam Tutar:</span>
                <span className="text-base font-bold text-amber-400 font-mono tabular-nums">
                  ₺{order.total.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            {/* Status & Courier Controls */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Atanan Kurye:</span>
                <select
                  value={order.courierName || ''}
                  onChange={(e) => assignCourier(order.id, e.target.value)}
                  className="bg-[#0b0f17] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-slate-600"
                >
                  <option value="">Kurye Seç</option>
                  {couriers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateDeliveryStatus(order.id, 'preparing')}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-colors"
                  >
                    Mutfakta Hazırla
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateDeliveryStatus(order.id, 'on_the_way')}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30 font-semibold text-xs transition-colors"
                  >
                    Kuryeye Teslim Et (Yola Çıkar)
                  </button>
                )}
                {order.status === 'on_the_way' && (
                  <button
                    onClick={() => updateDeliveryStatus(order.id, 'delivered')}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Teslim Edildi Olarak Kapat</span>
                  </button>
                )}
                {order.status === 'delivered' && (
                  <div className="w-full py-2 rounded-xl bg-slate-800/60 border border-slate-800 text-slate-400 text-center font-medium text-xs">
                    ✓ Teslim Edildi
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Phone Order Modal */}
      {isNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleCreateOrder}
            className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Yeni Telefon Siparişi Kaydı</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Müşteri Adı Soyadı:</label>
              <input
                type="text"
                required
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                placeholder="Örn: Mehmet Öz"
                className="w-full p-2.5 rounded-xl bg-[#0b0f17] border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Telefon Numarası:</label>
              <input
                type="text"
                required
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="05XX XXX XX XX"
                className="w-full p-2.5 rounded-xl bg-[#0b0f17] border border-slate-700 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Teslimat Adresi:</label>
              <textarea
                required
                value={custAddress}
                onChange={(e) => setCustAddress(e.target.value)}
                placeholder="Cadde, sokak, bina ve daire no..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-[#0b0f17] border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Sipariş Edilen Menü Ürünü:</label>
              <select
                value={dishSelection}
                onChange={(e) => setDishSelection(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0b0f17] border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Pizza Tartufata & Bresaola">Pizza Tartufata & Bresaola (₺640)</option>
                <option value="Dana Carpaccio di Manzo">Dana Carpaccio di Manzo (₺490)</option>
                <option value="Taze Burrata con Pomodorini">Taze Burrata con Pomodorini (₺460)</option>
                <option value="Dry-Aged Dana Antrikot (350gr)">Dry-Aged Dana Antrikot (350gr) (₺1.150)</option>
                <option value="Geleneksel Mascarpone Tiramisu">Geleneksel Mascarpone Tiramisu (₺360)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewOrderModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors shadow-sm"
              >
                Siparişi Aç
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
