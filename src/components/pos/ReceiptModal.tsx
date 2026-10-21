'use client';

import React from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import { Printer, X, CheckCircle2, QrCode } from 'lucide-react';

export default function ReceiptModal() {
  const { isReceiptModalOpen, setIsReceiptModalOpen, activeReceiptOrder } = usePOS();

  if (!isReceiptModalOpen || !activeReceiptOrder) return null;

  const order = activeReceiptOrder;

  const handlePrint = () => {
    sounds.playPrintReceipt();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex flex-col items-center max-w-sm w-full">
        {/* Printable Thermal Receipt Slip */}
        <div className="thermal-receipt w-full rounded-lg overflow-hidden shadow-2xl p-6 text-stone-900 font-mono text-xs select-text">
          {/* Top zig-zag edge */}
          <div className="thermal-receipt-zigzag-top -mt-6 -mx-6 mb-4" />

          {/* Restaurant Header */}
          <div className="text-center pb-3 border-b border-dashed border-stone-400 space-y-1">
            <h2 className="font-serif font-black text-base tracking-widest text-stone-900">
              L&apos;OPÉRA BISTRO
            </h2>
            <p className="text-[10px] text-stone-600">FINE DINING & LOUNGE RESTORAN</p>
            <p className="text-[9px] text-stone-500">Vali Konağı Cad. No: 42 Nişantaşı / İSTANBUL</p>
            <p className="text-[9px] text-stone-500">VKN: 8420194821 • MERSİS: 084201948210001</p>
          </div>

          {/* Ticket Meta */}
          <div className="py-2.5 border-b border-dashed border-stone-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>MASA: {order.tableNumber}</span>
              <span>KİŞİ: {order.guestCount}</span>
            </div>
            <div className="flex justify-between">
              <span>FİŞ NO: #{order.id.slice(-6).toUpperCase()}</span>
              <span>
                TARİH:{' '}
                {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between text-stone-600 text-[10px]">
              <span>GARSON: {order.waiterName}</span>
              <span>
                SAAT:{' '}
                {new Date(order.createdAt).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Itemized Lines */}
          <div className="py-3 border-b border-dashed border-stone-400 space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-stone-600 border-b border-stone-300 pb-1">
              <span>ÜRÜN</span>
              <span>ADET x FİYAT</span>
              <span>TUTAR</span>
            </div>

            {order.items.map((item) => {
              const modTotal = item.selectedModifiers.reduce((sum, m) => sum + m.priceDelta, 0);
              const lineTotal = (item.unitPrice + modTotal) * item.quantity;

              return (
                <div key={item.id} className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-stone-600">
                      {item.quantity} x {item.unitPrice + modTotal}
                    </span>
                    <span className="font-bold">
                      {item.isGift ? '0.00' : lineTotal.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>

                  {item.selectedModifiers.length > 0 && (
                    <div className="text-[9px] text-stone-600 pl-2">
                      {item.selectedModifiers.map((m, idx) => (
                        <div key={idx}>+ {m.name}</div>
                      ))}
                    </div>
                  )}

                  {item.isGift && (
                    <div className="text-[9px] font-bold text-emerald-800 pl-2">
                      * ŞEFİN İKRAMIDIR
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Totals & Tax */}
          <div className="py-2.5 space-y-1 text-xs">
            <div className="flex justify-between text-stone-700">
              <span>ARA TOPLAM:</span>
              <span>{order.subtotal.toLocaleString('tr-TR')} ₺</span>
            </div>

            {order.coverCharge > 0 && (
              <div className="flex justify-between text-stone-700">
                <span>KUVER BEDELİ:</span>
                <span>+{order.coverCharge.toLocaleString('tr-TR')} ₺</span>
              </div>
            )}

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-800 font-bold">
                <span>İSKONTO (%{order.discountRate}):</span>
                <span>-{order.discountAmount.toLocaleString('tr-TR')} ₺</span>
              </div>
            )}

            <div className="flex justify-between text-[10px] text-stone-500">
              <span>KDV (%10 Dahil):</span>
              <span>{Math.round(order.total * 0.1).toLocaleString('tr-TR')} ₺</span>
            </div>

            <div className="flex justify-between text-base font-black pt-1 border-t-2 border-stone-900 mt-1">
              <span>TOPLAM TUTAR:</span>
              <span>{order.total.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>

          {/* Payment Records */}
          {order.payments.length > 0 && (
            <div className="py-2 border-t border-dashed border-stone-400 space-y-1 text-[10px] text-stone-700">
              <div className="font-bold">ÖDEME BİLGİSİ:</div>
              {order.payments.map((p) => (
                <div key={p.id} className="flex justify-between">
                  <span>
                    {p.method === 'credit_card' && 'Kredi Kartı (Temassız)'}
                    {p.method === 'cash' && 'Nakit Tahsilat'}
                    {p.method === 'meal_voucher' && 'Yemek Kartı'}
                    {p.method === 'online' && 'FAST / QR'}
                  </span>
                  <span className="font-mono font-bold">{p.amount.toLocaleString('tr-TR')} ₺</span>
                </div>
              ))}
            </div>
          )}

          {/* QR Code & Footer */}
          <div className="pt-3 border-t border-dashed border-stone-400 text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-stone-900 rounded p-1 text-white flex items-center justify-center">
                <QrCode className="w-14 h-14" />
              </div>
            </div>
            <p className="text-[9px] text-stone-500">e-Adisyon Bilgi Fişidir • Mali Değeri Yoktur</p>
            <p className="text-[10px] font-bold tracking-widest text-stone-800">
              BİZİ TERCİH ETTİĞİNİZ İÇİN TEŞEKKÜR EDERİZ
            </p>
          </div>

          {/* Bottom zig-zag edge */}
          <div className="thermal-receipt-zigzag-bottom -mb-6 -mx-6 mt-4" />
        </div>

        {/* Modal Controls */}
        <div className="flex items-center gap-3 w-full mt-4">
          <button
            onClick={() => {
              sounds.playTap();
              setIsReceiptModalOpen(false);
            }}
            className="flex-1 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition-colors"
          >
            Kapat
          </button>
          <button
            onClick={handlePrint}
            className="flex-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Termal Fişi Yazdır</span>
          </button>
        </div>
      </div>
    </div>
  );
}
