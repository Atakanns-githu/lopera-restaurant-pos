// Web Crypto API tabanlı kriptografik şifreleme ve oturum imzalama modülü

const APP_SECRET_KEY = 'zadisyon_zynox_secure_pos_secret_key_2026';

/**
 * SHA-256 hash üretir (Salt ile birlikte)
 */
export async function hashPin(pin: string, salt: string = 'zynox_pos_salt_v3'): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${pin}:${APP_SECRET_KEY}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Benzersiz salt anahtarı üretir
 */
export function generateSalt(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface SessionPayload {
  staffId: string;
  name: string;
  role: string;
  branchId: string;
  issuedAt: number;
  expiresAt: number;
  sessionId: string;
}

/**
 * Oturum tokenı üretir (Base64 URL kodlamalı ve HMAC-SHA256 imzalı)
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const enc = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = btoa(unescape(encodeURIComponent(payloadStr)));

  // HMAC SHA-256 anahtarı oluştur
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(APP_SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureHex = signatureArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return `${payloadB64}.${signatureHex}`;
}

/**
 * Oturum tokenını doğrular ve süresi dolmamışsa payload'ı döner
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadB64, signatureHex] = parts;
    const enc = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(APP_SECRET_KEY),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // İmzayı hex'ten Uint8Array'e dönüştür
    const sigBytes = new Uint8Array(
      signatureHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payloadB64));
    if (!isValid) return null;

    const payloadJson = decodeURIComponent(escape(atob(payloadB64)));
    const payload: SessionPayload = JSON.parse(payloadJson);

    // Zaman aşımı kontrolü
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Oturum token doğrulama hatası:', error);
    return null;
  }
}
