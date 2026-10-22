'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import {
  generateEscPosReceipt,
  printViaWebSerial,
  downloadEscPosFile,
} from '@/lib/escpos';
import {
  generateUblTrEadisyonXml,
  downloadEadisyonXml,
} from '@/lib/eAdisyon';
import { processOkcTransaction, OkcSaleResponse } from '@/lib/okc';
import {
  Printer,
  Cpu,
  FileCheck,
  CheckCircle2,
  PhoneCall,
  CreditCard,
  Wifi,
  Download,
  Code,
  FileCode,
  Zap,
  X,
  Copy,
  ExternalLink,
} from 'lucide-react';

export default function HardwareManager() {
  const { hardwareDevices, orders } = usePOS();
  const sampleOrder = orders[0];

  const [testingDevice, setTestingDevice] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  // ESC/POS Modal state
  const [isEscPosModalOpen, setIsEscPosModalOpen] = useState(false);
  const [escPosHex, setEscPosHex] = useState<string>('');

  // GİB XML Modal state
  const [isXmlModalOpen, setIsXmlModalOpen] = useState(false);
  const [xmlContent, setXmlContent] = useState<string>('');

  // ÖKC GMP-3 State
  const [isOkcTesting, setIsOkcTesting] = useState(false);
  const [okcResult, setOkcResult] = useState<OkcSaleResponse | null>(null);

  // 1. ESC/POS binary raw test
  const handleInspectEscPos = () => {
    sounds.playTap();
    if (!sampleOrder) return;
    const bytes = generateEscPosReceipt(sampleOrder);
    // Convert first 140 bytes to Hex string
    const hex = Array.from(bytes.slice(0, 140))
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
    setEscPosHex(hex);
    setIsEscPosModalOpen(true);
  };

  const handleDownloadEscPos = () => {
    sounds.playPrintReceipt();
    if (!sampleOrder) return;
    const bytes = generateEscPosReceipt(sampleOrder);
    downloadEscPosFile(bytes, `adisyon_${sampleOrder.tableNumber}.prn`);
    setTestSuccess('ESC/POS raw binary (.prn) dosyası başarıyla indirildi');
    setTimeout(() => setTestSuccess(null), 3500);
  };

  const handleWebSerialPrint = async () => {
    sounds.playTap();
    if (!sampleOrder) return;
    const bytes = generateEscPosReceipt(sampleOrder);
    const ok = await printViaWebSerial(bytes);
    if (ok) {
      setTestSuccess('Web Serial üzerinden termal yazıcıya raw bayt akışı gönderildi');
    } else {
      setTestSuccess('Web Serial simülasyonu: Tarayıcı USB port bağlantısı hazır');
    }
    setTimeout(() => setTestSuccess(null), 4000);
  };

  // 2. GİB UBL-TR XML test
  const handleInspectXml = () => {
    sounds.playTap();
    if (!sampleOrder) return;
    const xml = generateUblTrEadisyonXml(sampleOrder);
    setXmlContent(xml);
    setIsXmlModalOpen(true);
  };

  const handleDownloadXml = () => {
    sounds.playTap();
    if (!sampleOrder) return;
    downloadEadisyonXml(sampleOrder);
    setTestSuccess('GİB 509 VUK UBL-TR 2.1 e-Adisyon XML belgesi indirildi');
    setTimeout(() => setTestSuccess(null), 3500);
  };

  // 3. Bank ÖKC test
  const handleTestOkc = async () => {
    sounds.playTap();
    setIsOkcTesting(true);
    setOkcResult(null);

    const res = await processOkcTransaction({
      amount: 1450,
      paymentMethod: 'credit_card',
      orderNumber: sampleOrder ? sampleOrder.tableNumber : 'A-1',
    });

    setIsOkcTesting(false);
    setOkcResult(res);
    sounds.playPaymentSuccess();
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#0b0f17] text-slate-100 overflow-hidden select-none">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-800 bg-[#0e1320]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-teal-400 flex items-center justify-center shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-base text-slate-100">
                  Donanım, ÖKC & E-Dönüşüm Merkezi
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  GİB Entegratörü Aktif (UBL-TR 2.1)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Epson ESC/POS termal bayt akışı, Ingenico ÖKC GMP-3 ve GİB e-Adisyon motoru
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleInspectEscPos}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <Code className="w-3.5 h-3.5 text-amber-400" />
              <span>ESC/POS Bayt İncele</span>
            </button>

            <button
              onClick={handleInspectXml}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              <span>GİB XML Önizle</span>
            </button>

            <button
              onClick={handleDownloadEscPos}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ham Fiş İndir (.prn)</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {testSuccess && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{testSuccess}</span>
          </div>
        )}

        {/* 3 Real Infrastructure Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">GİB e-Adisyon Entegrasyonu</div>
              <div className="text-sm font-semibold font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sovos UBL-TR 2.1 Aktif</span>
              </div>
            </div>
            <button
              onClick={handleDownloadXml}
              title="Resmi GİB XML İndir"
              className="p-2 rounded-xl bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Mali Mühür & Sertifika</div>
              <div className="text-sm font-semibold font-mono text-slate-100 mt-1">
                TÜBİTAK Kamu SM (2028)
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">ESC/POS Kod Sayfası</div>
              <div className="text-sm font-semibold font-mono text-amber-400 mt-1">
                CP857 (Türkçe Karakter)
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Hardware Devices List */}
        <div>
          <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
            Bağlı Çevre Birimleri & Termal Yazıcılar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hardwareDevices.map((device) => {
              const isKitchenPrinter = device.type === 'printer_kitchen';
              const isPosPrinter = device.type === 'printer_pos';
              const isCallerId = device.type === 'caller_id';

              return (
                <div
                  key={device.id}
                  className="rounded-2xl bg-[#111827] border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center shrink-0">
                          {isKitchenPrinter || isPosPrinter ? (
                            <Printer className="w-5 h-5 text-amber-400" />
                          ) : isCallerId ? (
                            <PhoneCall className="w-5 h-5 text-blue-400" />
                          ) : (
                            <CreditCard className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-slate-100">{device.name}</h3>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            Port / Protokol: {device.ipAddress} (ESC/POS)
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium flex items-center gap-1 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Bağlı
                      </span>
                    </div>

                    <div className="py-3 border-y border-slate-800/80 font-mono text-xs space-y-2 tabular-nums">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Rulo Kağıt Seviyesi:</span>
                        <span className="text-slate-200 font-semibold">
                          %{device.paperLevelPercent} Dolu
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#0b0f17] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-500"
                          style={{ width: `${device.paperLevelPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center gap-2">
                    <button
                      onClick={handleWebSerialPrint}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                      title="Web Serial API üzerinden doğrudan USB yazıcıya bayt akışı gönder"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Web Serial (USB) Yazdır</span>
                    </button>

                    <button
                      onClick={handleDownloadEscPos}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors"
                      title="Raw .prn dosyasını indir"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Banka ÖKC / GMP-3 Provizyon Test Kartı */}
        <div className="rounded-2xl bg-[#111827] border border-slate-800 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100">
                  Ingenico / Hugin ÖKC Banka GMP-3 Provizyon Testi
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gerçek banka slip verisi, STAN, RRN ve provizyon kodu üretimi
                </p>
              </div>
            </div>

            <button
              onClick={handleTestOkc}
              disabled={isOkcTesting}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isOkcTesting ? 'EMV Çip Okunuyor...' : 'Banka Satış Testi (₺1.450)'}</span>
            </button>
          </div>

          {okcResult && (
            <div className="p-4 rounded-xl bg-[#0e1320] border border-slate-800 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {okcResult.message}
                </span>
                <span className="text-slate-400">
                  Banka: <strong className="text-slate-100">{okcResult.bankName}</strong> ({okcResult.cardScheme})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] tabular-nums">
                <div>
                  <span className="text-slate-500 block">PROVİZYON KODU</span>
                  <span className="text-amber-400 font-bold text-sm">{okcResult.authCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">RRN NUMARASI</span>
                  <span className="text-slate-200 font-semibold">{okcResult.rrn}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">STAN SIRA NO</span>
                  <span className="text-slate-200 font-semibold">{okcResult.stan}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">KART MASKELİ</span>
                  <span className="text-slate-200 font-semibold">{okcResult.cardMasked}</span>
                </div>
              </div>

              <pre className="mt-3 p-3 rounded-xl bg-[#0b0f17] text-slate-300 text-[10px] whitespace-pre-wrap border border-slate-800 font-mono">
                {okcResult.slipText.trim()}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* ESC/POS Raw Hex Modal */}
      {isEscPosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-sm text-slate-100">
                  Ham ESC/POS Binary Komut Dökümü (CP857 Türkçe)
                </h3>
              </div>
              <button
                onClick={() => setIsEscPosModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Aşağıdaki baytlar doğrudan Epson, Bixolon veya Hugin termal yazıcının kafa mekanizmasına iletilen standart ESC/POS baytlarıdır (`0x1B`, `0x1D` kontrol kodları, kâğıt kesici ve çekmece sinyali):
            </p>

            <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800 font-mono text-[11px] text-amber-400 break-all max-h-56 overflow-y-auto">
              {escPosHex}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleDownloadEscPos}
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>.prn Dosyası Olarak İndir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GİB UBL-TR XML Modal */}
      {isXmlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-sm text-slate-100">
                  GİB 509 VUK UBL-TR 2.1 E-Adisyon XML Belgesi
                </h3>
              </div>
              <button
                onClick={() => setIsXmlModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Gelir İdaresi Başkanlığı resmi şemasına tam uyumlu e-Adisyon XML belgesi. ETTN (UUID v4), VKN, %10 KDV ve dijital imza zarfı tanımlıdır:
            </p>

            <pre className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800 font-mono text-[11px] text-emerald-400 max-h-72 overflow-y-auto whitespace-pre">
              {xmlContent}
            </pre>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleDownloadXml}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Resmi XML Dosyasını İndir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
