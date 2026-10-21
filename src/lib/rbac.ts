// Rol Tabanlı Erişim Kontrolü (Role-Based Access Control - RBAC) Modülü

export type StaffRole = 'admin' | 'manager' | 'cashier' | 'chef' | 'waiter' | 'courier';

export interface RoleMeta {
  role: StaffRole;
  title: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  allowedPaths: string[];
}

export const ROLE_DEFINITIONS: Record<StaffRole, RoleMeta> = {
  admin: {
    role: 'admin',
    title: 'İşletme Sahibi / Admin',
    badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
    badgeText: 'Admin',
    description: 'Sistem genelinde tam yetki; personel, audit, finans, şube ve donanım kontrolü.',
    allowedPaths: ['*'], // Her yere tam yetki
  },
  manager: {
    role: 'manager',
    title: 'Şube Müdürü',
    badgeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-400',
    badgeText: 'Müdür',
    description: 'Şube içi tam operasyon; iptal/indirim onayı, Z-raporu alma, personel ve stok takibi.',
    allowedPaths: [
      '/terminal',
      '/terminal/tables',
      '/terminal/pos',
      '/terminal/kds',
      '/terminal/delivery',
      '/terminal/couriers',
      '/terminal/crm',
      '/terminal/inventory',
      '/terminal/branches',
      '/terminal/hardware',
      '/terminal/reports',
      '/terminal/admin',
    ],
  },
  cashier: {
    role: 'cashier',
    title: 'Kasa & Muhasebe',
    badgeBg: 'bg-blue-500/15 border-blue-500/40 text-blue-400',
    badgeText: 'Kasiyer',
    description: 'Tahsilat alma, fatura/fiş kesme, paket servis ve cari hesap yönetimi.',
    allowedPaths: [
      '/terminal',
      '/terminal/tables',
      '/terminal/pos',
      '/terminal/delivery',
      '/terminal/crm',
      '/terminal/reports', // Kasa gün sonu için
    ],
  },
  chef: {
    role: 'chef',
    title: 'Mutfak Şefi',
    badgeBg: 'bg-orange-500/15 border-orange-500/40 text-orange-400',
    badgeText: 'Mutfak Şefi',
    description: 'Mutfak KDS ekranı, sipariş hazırlama ve mutfak stok seviyeleri.',
    allowedPaths: ['/terminal', '/terminal/kds', '/terminal/inventory'],
  },
  waiter: {
    role: 'waiter',
    title: 'Servis Görevlisi / Garson',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
    badgeText: 'Garson',
    description: 'Masa açma, sipariş alma, servis ve garson çağrılarını yanıtlama.',
    allowedPaths: ['/terminal', '/terminal/tables', '/terminal/pos'],
  },
  courier: {
    role: 'courier',
    title: 'Motorlu Kurye',
    badgeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400',
    badgeText: 'Kurye',
    description: 'Paket servis rota takibi ve teslimat onaylama.',
    allowedPaths: ['/terminal', '/terminal/delivery', '/terminal/couriers'],
  },
};

/**
 * Belirli bir rolün verilen URL yoluna erişim izni olup olmadığını kontrol eder.
 */
export function canAccessModule(role: StaffRole, path: string): boolean {
  if (role === 'admin') return true;

  const meta = ROLE_DEFINITIONS[role];
  if (!meta) return false;

  // Ana terminal redirecti veya tam eşleşme
  return meta.allowedPaths.some((allowed) => {
    if (allowed === '*') return true;
    if (allowed === path) return true;
    if (path.startsWith(allowed) && allowed !== '/terminal') return true;
    return false;
  });
}

/**
 * Modülün gerektirdiği minimum yetki başlığını döner
 */
export function getRequiredRoleForPath(path: string): string {
  if (path.includes('/admin')) return 'Yönetici (Admin / Müdür)';
  if (path.includes('/reports')) return 'Müdür veya Kasiyer';
  if (path.includes('/branches') || path.includes('/hardware')) return 'Müdür veya Admin';
  if (path.includes('/inventory')) return 'Mutfak Şefi veya Müdür';
  if (path.includes('/pos') || path.includes('/tables')) return 'Garson, Kasiyer veya Müdür';
  if (path.includes('/kds')) return 'Mutfak Şefi veya Müdür';
  if (path.includes('/couriers') || path.includes('/delivery')) return 'Kurye, Kasiyer veya Müdür';
  return 'Yetkili Personel';
}
