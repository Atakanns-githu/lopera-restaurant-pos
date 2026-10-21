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
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
            YEMEKSEPETİ
          </span>
        );
      case 'getir':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
            GETİR YEMEK
          </span>
        );
      case 'trendyol':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
            TRENDYOL
          </span>
        );
      case 'phone':
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            TELEFON SİPARİŞ
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
      trendyol: { name: 'Trendyol', id: `TY-${Math.floor(10000 + Math.random() * 90000)}` },
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
      customerName: `${customer.name} (${target.id})`,
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
      `✓ Canlı Webhook Alındı: ${target.name} [${target.id}] siparişi KDS ve Paket Terminaline işlendi!`
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
    <div className="flex-1 flex flex-col h-full bg-[#0a0d14] p-5 overflow-y-auto select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <span>Paket Servis & Çağrı Merkezi</span>
          </h2>
          <p className="text-xs text-stone-400">
            Yemeksepeti, Getir, Trendyol ve telefon siparişlerinin anlık sevkiyat kontrolü
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Platform Filters */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#121622] border border-stone-800">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedPlatform === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-md"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Telefon Siparişi Aç</span>
          </button>
        </div>
      </div>

      {/* Live Webhook Gateway Console Banner */}
      <div className="rounded-2xl bg-[#121624] border border-stone-800 p-4 mb-5 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-stone-200">
              Canlı Webhook Gateway API:
            </span>
            <code className="text-[11px] font-mono text-amber-400 px-2 py-0.5 rounded bg-black/40 border border-stone-800">
              /api/v1/integrations/webhook
            </code>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-stone-400 mr-1">Canlı Simülasyon:</span>
            <button
              onClick={() => handleSimulateWebhook('yemeksepeti')}
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-bold transition-all"
            >
              + Yemeksepeti Siparişi
            </button>
            <button
              onClick={() => handleSimulateWebhook('getir')}
              className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold transition-all"
            >
              + Getir Yemek Siparişi
            </button>
            <button
              onClick={() => handleSimulateWebhook('trendyol')}
              className="px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-300 text-[11px] font-bold transition-all"
            >
              + Trendyol Siparişi
            </button>
            <button
              onClick={() => handleSimulateWebhook('n8n')}
              className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[11px] font-bold transition-all"
            >
              + n8n Webhook
            </button>
          </div>
        </div>

        {webhookStatusText && (
          <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg flex items-center gap-2 animate-in fade-in">
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
            className="rounded-2xl border border-stone-800/80 bg-[#121622] p-4 flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                {getPlatformBadge(order.platform)}
                <span className="text-[11px] font-mono text-stone-400">
                  #{order.id.slice(0, 8)}
                </span>
              </div>

              <div className="space-y-1 mb-3">
                <div className="font-bold text-stone-100 text-sm">
                  {order.customerName}
                </div>
                <div className="text-xs text-stone-400">{order.customerPhone}</div>
                <div className="text-xs text-stone-400 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{order.deliveryAddress}</span>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-stone-800/60 py-2.5 space-y-1.5 font-mono text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-stone-300">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-stone-400">
                      {(item.price * item.quantity).toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-stone-800/60 pt-2 flex items-center justify-between">
                <span className="text-xs text-stone-400">Toplam:</span>
                <span className="text-base font-bold text-amber-400 font-mono">
                  {order.total.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>

            {/* Status & Courier Controls */}
            <div className="mt-4 pt-3 border-t border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">Atanan Kurye:</span>
                <select
                  value={order.courierName || ''}
                  onChange={(e) => assignCourier(order.id, e.target.value)}
                  className="bg-[#181d2e] border border-stone-700 rounded-lg px-2 py-1 text-xs text-stone-200"
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
                    className="w-full py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs"
                  >
                    Mutfakta Hazırla
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateDeliveryStatus(order.id, 'on_the_way')}
                    className="w-full py-2 rounded-xl bg-blue-500 text-white font-bold text-xs"
                  >
                    Kuryeye Teslim Et (Yola Çıkar)
                  </button>
                )}
                {order.status === 'on_the_way' && (
                  <button
                    onClick={() => updateDeliveryStatus(order.id, 'delivered')}
                    className="w-full py-2 rounded-xl bg-emerald-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Teslim Edildi Olarak Kapat</span>
                  </button>
                )}
                {order.status === 'delivered' && (
                  <div className="w-full py-2 rounded-xl bg-stone-800 text-stone-400 text-center font-bold text-xs">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleCreateOrder}
            className="bg-[#121622] border border-stone-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Yeni Telefon Siparişi Girişi</span>
            </h3>

            <div>
              <label className="block text-xs text-stone-300 mb-1">Müşteri Adı Soyadı:</label>
              <input
                type="text"
                required
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                placeholder="Örn: Mehmet Öz"
                className="w-full p-2.5 rounded-xl bg-[#090b10] border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">Telefon Numarası:</label>
              <input
                type="text"
                required
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="05XX XXX XX XX"
                className="w-full p-2.5 rounded-xl bg-[#090b10] border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">Teslimat Adresi:</label>
              <textarea
                required
                value={custAddress}
                onChange={(e) => setCustAddress(e.target.value)}
                placeholder="Cadde, sokak, bina ve daire no..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-[#090b10] border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-300 mb-1">Sipariş Edilecek Ürün:</label>
              <select
                value={dishSelection}
                onChange={(e) => setDishSelection(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#090b10] border border-stone-800 text-xs text-stone-100 focus:outline-none"
              >
                <option value="Pizza Tartufata & Bresaola">Pizza Tartufata & Bresaola (640 ₺)</option>
                <option value="Dry-Aged Dana Antrikot">Dry-Aged Dana Antrikot (1.150 ₺)</option>
                <option value="Trüflü El Açması Pappardelle">Trüflü El Açması Pappardelle (580 ₺)</option>
                <option value="Taze Burrata con Pomodorini">Taze Burrata con Pomodorini (460 ₺)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewOrderModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-md"
              >
                Siparişi Kaydet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
