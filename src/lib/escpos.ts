/**
 * ZAdisyon Enterprise ESC/POS Binary Thermal Printer Driver
 * Standard Epson ESC/POS Command Set with Code Page 857 (Turkish Character Set) Support
 * Compatible with Epson TM-T20/TM-T88, Bixolon, Hugin, Posiflex and Star thermal receipt printers.
 */

import { Order, OrderItem } from '@/types/pos';

// Standard ESC/POS Control Codes
export const ESC = 0x1b;
export const GS = 0x1d;
export const LF = 0x0a;

// Turkish CP857 Character Mapping Table
export const CP857_MAP: Record<string, number> = {
  ç: 0x87,
  Ç: 0x80,
  ğ: 0xa6,
  Ğ: 0xa7,
  ı: 0x8d,
  İ: 0x98,
  ö: 0x94,
  Ö: 0x99,
  ş: 0x9e,
  Ş: 0x9f,
  ü: 0x81,
  Ü: 0x9a,
};

/**
 * Encodes a UTF-8 string into a binary byte array with CP857 Turkish codepage support
 */
export function encodeCp857(text: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (CP857_MAP[char] !== undefined) {
      bytes.push(CP857_MAP[char]);
    } else {
      const code = char.charCodeAt(0);
      if (code < 128) {
        bytes.push(code);
      } else {
        // Fallback for non-ASCII characters outside CP857
        bytes.push(0x3f); // '?'
      }
    }
  }
  return bytes;
}

/**
 * Sütun hizalama yardımcısı (80mm kâğıt için varsayılan 42 karakter genişlik)
 */
export function formatColumns(left: string, right: string, width = 42): string {
  const leftClean = left.slice(0, width - right.length - 1);
  const spaceCount = Math.max(1, width - leftClean.length - right.length);
  return leftClean + ' '.repeat(spaceCount) + right;
}

export class EscPosBuilder {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  /**
   * Yazıcıyı fabrika ayarlarına sıfırlar
   */
  init(): this {
    this.buffer.push(ESC, 0x40); // ESC @
    // Code Page 857 (Turkish) seç
    this.buffer.push(ESC, 0x74, 18); // ESC t 18 (CP857)
    return this;
  }

  /**
   * Metin hizalama: 0 = Sol, 1 = Orta, 2 = Sağ
   */
  align(align: 'left' | 'center' | 'right'): this {
    const code = align === 'center' ? 1 : align === 'right' ? 2 : 0;
    this.buffer.push(ESC, 0x61, code); // ESC a n
    return this;
  }

  /**
   * Kalın yazı aç/kapat
   */
  bold(enable = true): this {
    this.buffer.push(ESC, 0x45, enable ? 1 : 0); // ESC E n
    return this;
  }

  /**
   * Çift boy / Çift en (Büyük başlık modu)
   */
  size(mode: 'normal' | 'double_height' | 'double_width' | 'double_both'): this {
    let code = 0x00;
    if (mode === 'double_height') code = 0x01;
    if (mode === 'double_width') code = 0x10;
    if (mode === 'double_both') code = 0x11;
    this.buffer.push(GS, 0x21, code); // GS ! n
    return this;
  }

  /**
   * Alt çizgi aç/kapat
   */
  underline(enable = true): this {
    this.buffer.push(ESC, 0x2d, enable ? 1 : 0); // ESC - n
    return this;
  }

  /**
   * CP857 uyumlu metin ekler
   */
  text(str: string): this {
    const encoded = encodeCp857(str);
    this.buffer.push(...encoded);
    return this;
  }

  /**
   * Metin ve satır sonu ekler
   */
  textLine(str = ''): this {
    this.text(str);
    this.buffer.push(LF);
    return this;
  }

  /**
   * 80mm çizgi çekici
   */
  divider(char = '-', width = 42): this {
    this.textLine(char.repeat(width));
    return this;
  }

  /**
   * Boş satır bırakır
   */
  feed(lines = 1): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(LF);
    }
    return this;
  }

  /**
   * Kâğıt kesici komutu (Partial / Full cut)
   */
  cut(feedLines = 3): this {
    this.buffer.push(GS, 0x56, 66, feedLines); // GS V 66 n
    return this;
  }

  /**
   * Para çekmecesi açma sinyali (Drawer Kick)
   */
  openDrawer(): this {
    this.buffer.push(ESC, 0x70, 0x00, 25, 250); // ESC p 0 25 250
    return this;
  }

  /**
   * Barkod yazdır (Code128 formatı)
   */
  barcode(codeStr: string): this {
    this.buffer.push(GS, 0x68, 64); // GS h 64 (Yükseklik 64 dot)
    this.buffer.push(GS, 0x77, 2); // GS w 2 (Genişlik)
    this.buffer.push(GS, 0x48, 2); // GS H 2 (Metni barkod altına yaz)
    this.buffer.push(GS, 0x6b, 73); // GS k 73 (Code128)
    const codeBytes = encodeCp857(codeStr);
    this.buffer.push(codeBytes.length, ...codeBytes);
    this.buffer.push(LF);
    return this;
  }

  /**
   * Uint8Array binary formatında ham çıktıyı döndürür
   */
  toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

/**
 * Resmi Restoran Masası Adisyon / Hesap Fişi ESC/POS Bayt Üreticisi
 */
export function generateEscPosReceipt(
  order: Order,
  options: {
    branchName?: string;
    eAdisyonUUID?: string;
    waiterName?: string;
    cashierName?: string;
  } = {}
): Uint8Array {
  const b = new EscPosBuilder();
  const branchName = options.branchName || 'ZADİSYON NIŞANTAŞI (MERKEZ)';
  const dateStr = new Date().toLocaleDateString('tr-TR');
  const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  // 1. Restoran Başlığı
  b.align('center')
    .size('double_both')
    .bold(true)
    .textLine('ZADISYON')
    .size('normal')
    .bold(false)
    .textLine(branchName)
    .textLine('Vergi No: 9480128491 - V.D.: Beyoglu')
    .textLine('Tel: +90 (212) 234 56 78')
    .divider('=')
    .bold(true)
    .size('double_height')
    .textLine(`MASA: ${order.tableNumber}`)
    .size('normal')
    .bold(false)
    .align('left')
    .textLine(`Adisyon No : #${order.id.slice(0, 8).toUpperCase()}`)
    .textLine(`Tarih/Saat : ${dateStr} - ${timeStr}`)
    .textLine(`Garson     : ${order.waiterName || options.waiterName || 'Atakan Zynox'}`)
    .textLine(`Kişi Sayısı: ${order.guestCount} Kişi`)
    .divider('-');

  // 2. Ürün Kalemleri
  b.bold(true)
    .textLine(formatColumns('URUN ADI / PORSİYON', 'TUTAR (TL)'))
    .bold(false)
    .divider('-');

  order.items.forEach((item) => {
    const modTotal = item.selectedModifiers.reduce((sum, m) => sum + m.priceDelta, 0);
    const linePrice = (item.unitPrice + modTotal) * item.quantity;
    const namePrefix = `${item.quantity}x ${item.name}`;
    const priceStr = item.isGift ? 'IKRAM' : `${linePrice.toLocaleString('tr-TR')} TL`;

    b.textLine(formatColumns(namePrefix, priceStr));

    // Modifiers / varyantlar
    item.selectedModifiers.forEach((mod) => {
      b.textLine(`  + ${mod.name} ${mod.priceDelta > 0 ? `(+${mod.priceDelta} TL)` : ''}`);
    });

    if (item.specialNote) {
      b.textLine(`  Not: "${item.specialNote}"`);
    }
  });

  b.divider('-');

  // 3. Mali Toplamlar
  b.textLine(formatColumns('Ara Toplam', `${order.subtotal.toLocaleString('tr-TR')} TL`));

  if (order.coverCharge > 0) {
    b.textLine(formatColumns('Kuver Bedeli', `+${order.coverCharge.toLocaleString('tr-TR')} TL`));
  }

  if (order.discountAmount > 0) {
    b.textLine(
      formatColumns(
        `Indirim (%${order.discountRate})`,
        `-${order.discountAmount.toLocaleString('tr-TR')} TL`
      )
    );
  }

  // KDV Dağılımı (VUK 509 zorunlu)
  const kdv10 = Math.round(order.total * 0.1);
  b.textLine(formatColumns('KDV (%10 Dahil)', `${kdv10.toLocaleString('tr-TR')} TL`));
  b.divider('=');

  // 4. Genel Toplam
  b.size('double_height')
    .bold(true)
    .textLine(formatColumns('GENEL TOPLAM:', `${order.total.toLocaleString('tr-TR')} TL`))
    .size('normal')
    .bold(false)
    .divider('=');

  // 5. e-Adisyon ve Mali Bilgi
  if (options.eAdisyonUUID) {
    b.align('center')
      .bold(true)
      .textLine('509 SIRA NO VUK E-ADISYON BILGISI')
      .bold(false)
      .textLine(`ETTN: ${options.eAdisyonUUID}`)
      .textLine('GIB Mali Muhur Onayli Dijital Adisyon')
      .feed(1)
      .barcode(options.eAdisyonUUID.slice(0, 16))
      .feed(1);
  }

  // 6. Kapanış & Kâğıt Kesme
  b.align('center')
    .textLine('Afiyet Olsun. Bizi Tercih Ettiginiz Icin')
    .textLine('Tesekkur Ederiz!')
    .feed(2)
    .cut()
    .openDrawer();

  return b.toUint8Array();
}

/**
 * Mutfak İstasyonu İçin Sipariş Fişi ESC/POS Bayt Üreticisi
 */
export function generateEscPosKitchenSlip(
  order: Order,
  itemsToCook: OrderItem[]
): Uint8Array {
  const b = new EscPosBuilder();
  const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  b.align('center')
    .size('double_both')
    .bold(true)
    .textLine('*** MUTFAK KDS FISI ***')
    .textLine(`MASA: ${order.tableNumber}`)
    .size('normal')
    .bold(false)
    .align('left')
    .textLine(`Saat: ${timeStr} | Garson: ${order.waiterName || 'Garson'}`)
    .divider('=')
    .size('double_height')
    .bold(true);

  itemsToCook.forEach((item) => {
    b.textLine(`[ ] ${item.quantity} ADET ${item.name.toUpperCase()}`);
    item.selectedModifiers.forEach((mod) => {
      b.textLine(`    -> ${mod.name}`);
    });
    if (item.specialNote) {
      b.textLine(`    ** ACIL NOT: ${item.specialNote} **`);
    }
    b.feed(1);
  });

  b.size('normal')
    .bold(false)
    .divider('=')
    .align('center')
    .textLine('MUTFAK SIPARIS ONAYI')
    .feed(3)
    .cut();

  return b.toUint8Array();
}

/**
 * Tarayıcı Web Serial API ile doğrudan USB termal yazıcıya ESC/POS binary verisini gönderir.
 */
export async function printViaWebSerial(data: Uint8Array): Promise<boolean> {
  if (typeof window === 'undefined' || !('serial' in navigator)) {
    console.warn('Web Serial API bu tarayıcıda desteklenmiyor.');
    return false;
  }

  try {
    const nav = navigator as unknown as { serial: { requestPort: () => Promise<any> } };
    const port = await nav.serial.requestPort();
    await port.open({ baudRate: 9600 });
    const writer = port.writable.getWriter();
    await writer.write(data);
    writer.releaseLock();
    await port.close();
    return true;
  } catch (err) {
    console.error('Web Serial ile yazdırma hatası:', err);
    return false;
  }
}

/**
 * ESC/POS binary verisini `.prn` / `.bin` dosyası olarak doğrudan bilgisayara indirir.
 */
export function downloadEscPosFile(data: Uint8Array, filename = 'adisyon_fis.prn'): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([data.buffer as ArrayBuffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
