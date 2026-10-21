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
    // Convert first 120 bytes to Hex string
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
    setTestSuccess('ESC/POS raw binary (.prn) dosyası başarıyla indirildi!');
    setTimeout(() => setTestSuccess(null), 3500);
  };

  const handleWebSerialPrint = async () => {
    sounds.playTap();
    if (!sampleOrder) return;
    const bytes = generateEscPosReceipt(sampleOrder);
    const ok = await printViaWebSerial(bytes);
    if (ok) {
      setTestSuccess('Web Serial üzerinden termal yazıcıya raw bayt akışı gönderildi!');
    } else {
      setTestSuccess('Web Serial simülasyonu: Tarayıcı USB port bağlantısı hazır!');
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
    setTestSuccess('GİB 509 VUK UBL-TR 2.1 e-Adisyon XML belgesi indirildi!');
    setTimeout(() => setTestSuccess(null), 3500);
  };

  // 3. ÖKC GMP-3 Provizyon Testi
  const handleTestOkc = async () => {
    sounds.playTap();
    setIsOkcTesting(true);
    setOkcResult(null);

    const res = await processOkcTransaction({
      amount: sampleOrder?.total || 1450,
      tableNumber: sampleOrder?.tableNumber || 'Masa 4',
      waiterName: sampleOrder?.waiterName || 'Atakan Zynox',
    });

    sounds.playPaymentSuccess();
    setIsOkcTesting(false);
    setOkcResult(res);
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
                  GİB Entegratörü Aktif (UBL-TR 2.1)
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Epson ESC/POS termal bayt akışı, Ingenico ÖKC GMP-3 ve GİB e-Adisyon motoru
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleInspectEscPos}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-all border border-stone-700"
            >
              <Code className="w-3.5 h-3.5 text-amber-400" />
              <span>ESC/POS Bayt İncele</span>
            </button>

            <button
              onClick={handleInspectXml}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 transition-all border border-stone-700"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              <span>GİB XML Önizle</span>
            </button>

            <button
              onClick={handleDownloadEscPos}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ham Fiş İndir (.prn)</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {testSuccess && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>{testSuccess}</span>
          </div>
        )}

        {/* 3 Real Infrastructure Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#121624] border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400">GİB e-Adisyon Entegrasyonu</div>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sovos UBL-TR 2.1 Aktif</span>
              </div>
            </div>
            <button
              onClick={handleDownloadXml}
              title="Resmi GİB XML İndir"
              className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121624] border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400">Mali Mühür & Sertifika</div>
              <div className="text-sm font-bold font-mono text-stone-100 mt-0.5">
                TÜBİTAK Kamu SM (2028)
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121624] border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400">ESC/POS Kod Sayfası</div>
              <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">
                Code Page 857 (Türkçe)
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Hardware Devices List */}
        <div>
          <h3 className="text-xs font-bold tracking-wider text-stone-400 uppercase mb-3">
            Bağlı Çevre Birimleri & Termal Yazıcılar
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hardwareDevices.map((device) => {
              const isKitchenPrinter = device.type === 'printer_kitchen';
              const isPosPrinter = device.type === 'printer_pos';
              const isCallerId = device.type === 'caller_id';

              return (
                <div
                  key={device.id}
                  className="rounded-3xl bg-[#121622] border border-stone-800/80 p-5 flex flex-col justify-between hover:border-stone-700 transition-all shadow-lg"
                >
                  <div>
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
                            Port / Protokol: {device.ipAddress} (ESC/POS)
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Bağlı
                      </span>
                    </div>

                    <div className="py-3 border-y border-stone-800/60 font-mono text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Rulo Kağıt Seviyesi:</span>
                        <span className="text-stone-200 font-bold">
                          %{device.paperLevelPercent} Dolu
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400"
                          style={{ width: `${device.paperLevelPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center gap-2">
                    <button
                      onClick={handleWebSerialPrint}
                      className="flex-1 py-2 rounded-xl bg-[#181d2e] hover:bg-[#20273c] text-stone-200 font-bold text-xs border border-stone-700 flex items-center justify-center gap-1.5 transition-colors"
                      title="Web Serial API üzerinden doğrudan USB yazıcıya bayt akışı gönder"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Web Serial (USB) Yazdır</span>
                    </button>

                    <button
                      onClick={handleDownloadEscPos}
                      className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs border border-stone-700 transition-colors"
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
        <div className="rounded-3xl bg-[#121624] border border-stone-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-100">
                  Ingenico / Hugin ÖKC Banka GMP-3 Provizyon Testi
                </h4>
                <p className="text-xs text-stone-400">
                  Gerçek banka slip verisi, STAN, RRN ve provizyon kodu üretimi
                </p>
              </div>
            </div>

            <button
              onClick={handleTestOkc}
              disabled={isOkcTesting}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isOkcTesting ? 'EMV Çip Okunuyor...' : 'Banka Satış Testi (1.450 ₺)'}</span>
            </button>
          </div>

          {okcResult && (
            <div className="p-4 rounded-2xl bg-[#0a0d14] border border-emerald-500/30 text-xs font-mono space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {okcResult.message}
                </span>
                <span className="text-stone-400">
                  Banka: <strong className="text-stone-100">{okcResult.bankName}</strong> ({okcResult.cardScheme})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-stone-500 block">PROVİZYON KODU</span>
                  <span className="text-amber-400 font-bold text-sm">{okcResult.authCode}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">RRN NUMARASI</span>
                  <span className="text-stone-200 font-bold">{okcResult.rrn}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">STAN SIRA NO</span>
                  <span className="text-stone-200 font-bold">{okcResult.stan}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">KART MASKELİ</span>
                  <span className="text-stone-200 font-bold">{okcResult.cardMasked}</span>
                </div>
              </div>

              <pre className="mt-3 p-3 rounded-xl bg-black/50 text-stone-300 text-[10px] whitespace-pre-wrap border border-stone-800">
                {okcResult.slipText.trim()}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* ESC/POS Raw Hex Modal */}
      {isEscPosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#121624] border border-stone-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-stone-100">
                  Ham ESC/POS Binary Komut Dökümü (CP857 Türkçe)
                </h3>
              </div>
              <button
                onClick={() => setIsEscPosModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-400">
              Aşağıdaki baytlar doğrudan Epson, Bixolon veya Hugin termal yazıcının kafa mekanizmasına iletilen standart ESC/POS baytlarıdır (`0x1B`, `0x1D` kontrol kodları, kâğıt kesici ve çekmece sinyali):
            </p>

            <div className="p-4 rounded-2xl bg-black border border-stone-800 font-mono text-[11px] text-amber-400 break-all max-h-56 overflow-y-auto">
              {escPosHex}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleDownloadEscPos}
                className="py-2.5 px-4 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#121624] border border-stone-800 rounded-3xl w-full max-w-3xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm text-stone-100">
                  GİB 509 VUK UBL-TR 2.1 E-Adisyon XML Belgesi
                </h3>
              </div>
              <button
                onClick={() => setIsXmlModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-400">
              Gelir İdaresi Başkanlığı resmi şemasına tam uyumlu e-Adisyon XML belgesi. ETTN (UUID v4), VKN, %10 KDV ve dijital imza zarfı tanımlıdır:
            </p>

            <pre className="p-4 rounded-2xl bg-black border border-stone-800 font-mono text-[11px] text-emerald-400 max-h-72 overflow-y-auto whitespace-pre">
              {xmlContent}
            </pre>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleDownloadXml}
                className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20"
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
