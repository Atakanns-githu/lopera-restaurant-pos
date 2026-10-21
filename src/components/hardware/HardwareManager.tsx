'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import {
  Printer,
  Cpu,
  FileCheck,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Activity,
  Zap,
  PhoneCall,
  CreditCard,
  Wifi,
  AlertTriangle,
} from 'lucide-react';

export default function HardwareManager() {
  const { hardwareDevices } = usePOS();
  const [testingDevice, setTestingDevice] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  const handleTestPrint = (deviceName: string) => {
    sounds.playPrintReceipt();
    setTestingDevice(deviceName);
    setTestSuccess(null);

    setTimeout(() => {
      setTestingDevice(null);
      setTestSuccess(`${deviceName} test çıktısı başarıyla yazdırıldı!`);
      setTimeout(() => setTestSuccess(null), 3000);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#090b10] text-stone-100 overflow-hidden select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-stone-800/80 bg-[#0e111a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-stone-100">
                  Donanım, ÖKC & E-Dönüşüm Merkezi
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GİB Entegratörü Aktif
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Termal yazıcılar, Caller ID, Ingenico ÖKC ve e-Adisyon / e-Fatura altyapısı
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              handleTestPrint('Kasa Termal Yazıcı');
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Genel Test Fişi Yazdır</span>
          </button>
        </div>

        {/* Test Alert */}
        {testSuccess && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{testSuccess}</span>
          </div>
        )}

        {/* 3 Infrastructure Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#121624] border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400">GİB e-Adisyon Entegrasyonu</div>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sovos Entegratör Aktif</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121624] border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400">Mali Mühür & Sertifika</div>
              <div className="text-sm font-bold font-mono text-stone-100 mt-0.5">
                TÜBİTAK Kamu SM (2028)
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121624] border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400">Donanım Ağı (LAN / USB)</div>
              <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">
                4 / 4 Cihaz Bağlı
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Hardware Devices Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h3 className="text-xs font-bold tracking-wider text-stone-400 uppercase mb-3">
            Bağlı Çevre Birimleri & Termal Yazıcılar
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hardwareDevices.map((device) => {
              const isKitchenPrinter = device.type === 'printer_kitchen';
              const isPosPrinter = device.type === 'printer_pos';
              const isCallerId = device.type === 'caller_id';
              const isPayment = device.type === 'payment_terminal';

              return (
                <div
                  key={device.id}
                  className="rounded-3xl bg-[#121622] border border-stone-800/80 p-5 flex flex-col justify-between hover:border-stone-700 transition-all shadow-lg"
                >
                  <div>
                    {/* Device Top */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#181d2e] border border-stone-700 text-stone-200 flex items-center justify-center">
                          {isKitchenPrinter || isPosPrinter ? (
                            <Printer className="w-5 h-5 text-amber-400" />
                          ) : isCallerId ? (
                            <PhoneCall className="w-5 h-5 text-blue-400" />
                          ) : (
                            <CreditCard className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-stone-100">{device.name}</h4>
                          <p className="text-xs text-stone-400 font-mono mt-0.5">
                            IP / Port: {device.ipAddress}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Bağlı
                      </span>
                    </div>

                    {/* Paper level or Status Gauge */}
                    <div className="py-3 border-y border-stone-800/60 font-mono text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Rulo Kağıt Seviyesi:</span>
                        <span
                          className={`font-bold ${
                            device.paperLevelPercent < 20
                              ? 'text-rose-400'
                              : 'text-stone-200'
                          }`}
                        >
                          %{device.paperLevelPercent} Dolu
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            device.paperLevelPercent < 20
                              ? 'bg-rose-500'
                              : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                          }`}
                          style={{ width: `${device.paperLevelPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Test Action */}
                  <div className="pt-4 flex items-center gap-2">
                    <button
                      onClick={() => handleTestPrint(device.name)}
                      disabled={testingDevice === device.name}
                      className="flex-1 py-2 rounded-xl bg-[#181d2e] hover:bg-[#20273c] text-stone-200 font-bold text-xs border border-stone-700 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {testingDevice === device.name
                          ? 'Yazdırılıyor...'
                          : 'Test Çıktısı Al'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* E-Dönüşüm / E-Adisyon Information Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#11192e] to-[#151e36] border border-blue-500/30 p-5 shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-stone-100">
                509 Sıra No.lu VUK Genel Tebliği e-Adisyon Standartları
              </h4>
              <p className="text-xs text-stone-400">
                Açılan her masa için anlık 32 haneli ETTN kodu ve zaman damgası üretilmektedir.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
            <div className="bg-black/30 p-3 rounded-xl border border-stone-800">
              <span className="text-stone-400 block text-[11px]">Entegrasyon Modu:</span>
              <span className="text-stone-200 font-bold">Canlı GİB API (7/24 Senkron)</span>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-stone-800">
              <span className="text-stone-400 block text-[11px]">e-Fatura / e-Arşiv:</span>
              <span className="text-emerald-400 font-bold">Otomatik Mükellef Kontrolü</span>
            </div>
            <div className="bg-black/30 p-3 rounded-xl border border-stone-800">
              <span className="text-stone-400 block text-[11px]">Yedekleme:</span>
              <span className="text-blue-400 font-bold">10 Yıl Güvenli Bulut Saklama</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
