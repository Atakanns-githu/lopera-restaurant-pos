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

  const filteredOrders = deliveryOrders.filter((order) => {
    if (selectedPlatform === 'all') return true;
    return order.platform === selectedPlatform;
  });

  const getPlatformBadge = (platform: DeliveryPlatform) => {
    switch (platform) {
      case 'yemeksepeti':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">YEMEKSEPETİ</span>;
      case 'getir':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">GETİR YEMEK</span>;
      case 'trendyol':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">TRENDYOL</span>;
      case 'phone':
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">TELEFON SİPARİŞ</span>;
    }
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
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
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              setIsNewOrderModal(true);
            }}
            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>+ Yeni Telefon Siparişi</span>
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="p-4 rounded-2xl bg-[#121622] border border-stone-800 shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-sm text-stone-100">
                    {order.orderNumber}
                  </span>
                  {getPlatformBadge(order.platform)}
                </div>
                <span className="text-xs font-bold font-mono text-amber-400">
                  {order.total.toLocaleString('tr-TR')} ₺
                </span>
              </div>

              {/* Customer Info */}
              <div className="space-y-1.5 text-xs text-stone-300 mb-3">
                <div className="font-bold text-stone-100">{order.customerName}</div>
                <div className="text-[11px] text-stone-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-stone-500" />
                  <span>{order.customerPhone}</span>
                </div>
                <div className="text-[11px] text-stone-400 flex items-start gap-1">
                  <MapPin className="w-3 h-3 text-stone-500 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{order.deliveryAddress}</span>
                </div>
              </div>

              {/* Items */}
              <div className="p-2.5 rounded-xl bg-[#090b10] border border-stone-800/80 mb-3 space-y-1 text-xs">
                {order.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-stone-300 text-[11px]">
                    <span>
                      {i.quantity}x {i.name}
                    </span>
                    <span className="font-mono text-stone-400">{i.price} ₺</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Courier Assignment & Status */}
            <div className="pt-3 border-t border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">Kurye:</span>
                {order.courierName ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Bike className="w-3.5 h-3.5" />
                    <span>{order.courierName}</span>
                  </span>
                ) : (
                  <select
                    onChange={(e) => assignCourier(order.id, e.target.value)}
                    className="bg-[#181c2a] border border-stone-700 text-stone-200 text-[11px] rounded-lg px-2 py-1 focus:outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Kurye Ata...
                    </option>
                    {couriers.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.status === 'idle' ? 'Müsait' : 'Meşgul'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2">
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
