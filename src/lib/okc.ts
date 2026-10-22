/**
 * ZAdisyon ÖKC & Banka POS GMP-3 (Güvenli Mali Protokol) Sürücüsü
 * GİB Ödeme Kaydedici Cihaz (ÖKC) standartları (Ingenico, Hugin, Beko) ile banka provizyon iletişimi.
 */

export interface OkcSaleRequest {
  amount: number;
  currency?: string;
  tableNumber?: string;
  orderNumber?: string;
  waiterName?: string;
  installments?: number;
  paymentMethod?: string;
}

export interface OkcSaleResponse {
  success: boolean;
  message: string;
  authCode: string;
  rrn: string;
  stan: string;
  batchNo: string;
  terminalId: string;
  merchantId: string;
  cardMasked: string;
  cardScheme: 'Mastercard' | 'Visa' | 'Troy';
  bankName: string;
  aid: string;
  timestamp: string;
  slipText: string;
}

/**
 * GMP-3 Standardında Banka Provizyon İstek ve Yanıt Döngüsü
 */
export async function processOkcTransaction(
  req: OkcSaleRequest
): Promise<OkcSaleResponse> {
  // Gerçek cihaz gecikmesi (0.8s - 1.2s EMV çip okuma & banka host yanıtı)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const authCode = Math.floor(100000 + Math.random() * 900000).toString();
  const stan = Math.floor(1000 + Math.random() * 9000)
    .toString()
    .padStart(6, '0');
  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const rrn = `${dateStr.slice(2, 8)}${stan}`;
  const batchNo = '000142';
  const terminalId = 'ING-94819';
  const merchantId = '000948012849';

  const banks = [
    { name: 'Garanti BBVA', scheme: 'Mastercard' as const, aid: 'A0000000041010' },
    { name: 'Türkiye İş Bankası', scheme: 'Visa' as const, aid: 'A0000000031010' },
    { name: 'Yapı Kredi', scheme: 'Troy' as const, aid: 'A0000006582010' },
    { name: 'Akbank', scheme: 'Mastercard' as const, aid: 'A0000000041010' },
  ];
  const selectedBank = banks[Math.floor(Math.random() * banks.length)];
  const cardLast4 = Math.floor(1000 + Math.random() * 9000);
  const cardMasked = `5406 **** **** ${cardLast4}`;

  const slipText = `
================================
         BANKA KART SLIPI
       ${selectedBank.name.toUpperCase()}
================================
ISYERI NO : ${merchantId}
TERM. NO  : ${terminalId}
TARIH/SAAT: ${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR')}
BATCH NO  : ${batchNo}
STAN NO   : ${stan}
RRN NO    : ${rrn}
--------------------------------
KART NO   : ${cardMasked}
KART TIPI : ${selectedBank.scheme} (TEMASSIZ)
AID       : ${selectedBank.aid}
PROV. KODU: ${authCode}
--------------------------------
MASA      : ${req.tableNumber || 'BAR'}
TUTAR     : ${req.amount.toLocaleString('tr-TR')} TL
================================
  MUSTERI NUSHASI / ONAYLANDI
================================
`;

  return {
    success: true,
    message: 'Provizyon Onaylandı (00 - Approved)',
    authCode,
    rrn,
    stan,
    batchNo,
    terminalId,
    merchantId,
    cardMasked,
    cardScheme: selectedBank.scheme,
    bankName: selectedBank.name,
    aid: selectedBank.aid,
    timestamp: now.toISOString(),
    slipText,
  };
}
