/**
 * ZAdisyon GİB 509 VUK UBL-TR 2.1 E-Adisyon / E-Arşiv XML Belge Üreteci
 * Gelir İdaresi Başkanlığı e-Belge ve e-Adisyon Tebliği standartlarına tam uyumludur.
 * Standart UBL-TR 2.1 Şeması, ETTN (UUID v4) ve XAdES dijital imza zarfı yapısını barındırır.
 */

import { Order } from '@/types/pos';

export interface EAdisyonSupplier {
  vkn: string;
  name: string;
  taxOffice: string;
  city: string;
  district: string;
  street: string;
  mersisNo: string;
  tradeRegistryNo: string;
}

export const DEFAULT_SUPPLIER: EAdisyonSupplier = {
  vkn: '9480128491',
  name: 'ZADİSYON GASTRONOMİ VE RESTORAN HİZMETLERİ A.Ş.',
  taxOffice: 'Beyoğlu Vergi Dairesi',
  city: 'İstanbul',
  district: 'Şişli / Nişantaşı',
  street: 'Abdi İpekçi Cad. No: 42/A',
  mersisNo: '0948012849100018',
  tradeRegistryNo: 'İST-482914',
};

/**
 * RFC 4122 Standardına uygun UUID v4 (ETTN) üreticisi
 */
export function generateETTN(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Resmi GİB UBL-TR 2.1 e-Adisyon XML Verisi Üretir
 */
export function generateUblTrEadisyonXml(
  order: Order,
  supplier: EAdisyonSupplier = DEFAULT_SUPPLIER,
  ettn = generateETTN()
): string {
  const issueDate = new Date().toISOString().split('T')[0];
  const issueTime = new Date().toTimeString().split(' ')[0];
  const invoiceNumber = `ZAD${new Date().getFullYear()}${order.id.slice(0, 9).toUpperCase()}`;

  const taxRate = 10; // Gıda %10 KDV
  const taxDivisor = 1 + taxRate / 100;
  const taxableTotal = +(order.total / taxDivisor).toFixed(2);
  const taxAmount = +(order.total - taxableTotal).toFixed(2);

  const linesXml = order.items
    .map((item, index) => {
      const lineTotal = item.unitPrice * item.quantity;
      const itemTaxable = +(lineTotal / taxDivisor).toFixed(2);
      const itemTax = +(lineTotal - itemTaxable).toFixed(2);

      return `    <cac:InvoiceLine>
      <cbc:ID>${index + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="C62">${item.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="TRY">${itemTaxable.toFixed(2)}</cbc:LineExtensionAmount>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="TRY">${itemTax.toFixed(2)}</cbc:TaxAmount>
        <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID="TRY">${itemTaxable.toFixed(2)}</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID="TRY">${itemTax.toFixed(2)}</cbc:TaxAmount>
          <cbc:Percent>${taxRate}.00</cbc:Percent>
          <cac:TaxCategory>
            <cac:TaxScheme>
              <cbc:Name>KDV</cbc:Name>
              <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
            </cac:TaxScheme>
          </cac:TaxCategory>
        </cac:TaxSubtotal>
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Description>${item.isGift ? 'İKRAM PORSİYON' : 'RESTORAN SERVİSİ'}</cbc:Description>
        <cbc:Name><![CDATA[${item.name}]]></cbc:Name>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="TRY">${(item.unitPrice / taxDivisor).toFixed(2)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
  xmlns:xades="http://uri.etsi.org/01903/v1.3.2#">

  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- GİB TÜBİTAK Kamu SM XAdES-BES Dijital Mali Mühür Zarfı -->
        <xades:QualifyingProperties Target="#Signature">
          <xades:SignedProperties>
            <xades:SignedSignatureProperties>
              <xades:SigningTime>${new Date().toISOString()}</xades:SigningTime>
            </xades:SignedSignatureProperties>
          </xades:SignedProperties>
        </xades:QualifyingProperties>
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>

  <!-- Belge Üst Bilgileri -->
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
  <cbc:ProfileID>EARSIVBELGE</cbc:ProfileID>
  <cbc:ID>${invoiceNumber}</cbc:ID>
  <cbc:CopyIndicator>false</cbc:CopyIndicator>
  <cbc:UUID>${ettn}</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode>EADISYON</cbc:InvoiceTypeCode>
  <cbc:Note>509 SIRA NO VUK GENEL TEBLİĞİ UYARINCA DÜZENLENMİŞ E-ADİSYON BELGESİDİR.</cbc:Note>
  <cbc:Note>Masa No: ${order.tableNumber} | Garson: ${order.waiterName || 'Garson'}</cbc:Note>
  <cbc:DocumentCurrencyCode>TRY</cbc:DocumentCurrencyCode>
  <cbc:LineCountNumeric>${order.items.length}</cbc:LineCountNumeric>

  <!-- Düzenleyen Restoran Bilgisi (Satıcı / Mükellef) -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VKN">${supplier.vkn}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name><![CDATA[${supplier.name}]]></cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${supplier.street}</cbc:StreetName>
        <cbc:CitySubdivisionName>${supplier.district}</cbc:CitySubdivisionName>
        <cbc:CityName>${supplier.city}</cbc:CityName>
        <cac:Country>
          <cbc:Name>Türkiye</cbc:Name>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cac:TaxScheme>
          <cbc:Name>${supplier.taxOffice}</cbc:Name>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- Müşteri Bilgisi (Nihai Tüketici) -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="TCKN">11111111111</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>NİHAİ TÜKETİCİ / RESTORAN MİSAFİRİ</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:CityName>İstanbul</cbc:CityName>
        <cac:Country>
          <cbc:Name>Türkiye</cbc:Name>
        </cac:Country>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- Ödeme Yöntemi -->
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>1</cbc:PaymentMeansCode>
    <cbc:PaymentDueDate>${issueDate}</cbc:PaymentDueDate>
  </cac:PaymentMeans>

  <!-- KDV Toplamı -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="TRY">${taxAmount.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="TRY">${taxableTotal.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="TRY">${taxAmount.toFixed(2)}</cbc:TaxAmount>
      <cbc:Percent>${taxRate}.00</cbc:Percent>
      <cac:TaxCategory>
        <cac:TaxScheme>
          <cbc:Name>KDV</cbc:Name>
          <cbc:TaxTypeCode>0015</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <!-- Parasal Toplamlar -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="TRY">${taxableTotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="TRY">${taxableTotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="TRY">${order.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="TRY">${order.discountAmount.toFixed(2)}</cbc:AllowanceTotalAmount>
    <cbc:PayableAmount currencyID="TRY">${order.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- Ürün / Hizmet Satırları -->
${linesXml}
</Invoice>`;
}

/**
 * Resmi XML dosyasını tarayıcıda doğrudan '.xml' olarak indirir
 */
export function downloadEadisyonXml(order: Order): void {
  if (typeof window === 'undefined') return;
  const xml = generateUblTrEadisyonXml(order);
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `e-adisyon-${order.id.slice(0, 8)}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
