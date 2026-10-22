'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import { Staff, StaffRole } from '@/types/pos';
import { ROLE_DEFINITIONS } from '@/lib/rbac';
import {
  ShieldCheck,
  Users,
  KeyRound,
  FileText,
  Settings,
  Lock,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Search,
  Filter,
  X,
  ShieldAlert,
} from 'lucide-react';

export default function AdminPage() {
  const {
    currentStaff,
    staffList,
    addStaff,
    updateStaff,
    deleteStaff,
    auditLogs,
    securitySettings,
    setSecuritySettings,
    toggleEmergencyLockdown,
    zReports,
    orders,
    tables,
    currentBranch,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'overview' | 'staff' | 'security' | 'settings'>('overview');

  // Staff Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // New Staff Modal State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newRole, setNewRole] = useState<StaffRole>('waiter');
  const [newPin, setNewPin] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Edit PIN Modal State
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editPinValue, setEditPinValue] = useState<string>('');

  // Audit Logs Filter
  const [logSeverityFilter, setLogSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');

  // Save Settings Feedback
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Calculate live statistics
  const currentZ = zReports[0];
  const occupiedTablesCount = tables.filter((t) => t.status === 'occupied').length;
  const activeOrdersTotal = orders
    .filter((o) => o.status === 'open')
    .reduce((sum, o) => sum + o.total, 0);

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredLogs = auditLogs.filter((log) => {
    if (logSeverityFilter === 'all') return true;
    return log.severity === logSeverityFilter;
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError('Lütfen personel adı giriniz');
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setFormError('PIN tam olarak 4 haneli rakamlardan oluşmalıdır');
      return;
    }

    sounds.playTap();
    const avatarBgs = [
      'bg-amber-600',
      'bg-emerald-600',
      'bg-blue-600',
      'bg-purple-600',
      'bg-rose-600',
      'bg-cyan-600',
    ];
    const randomBg = avatarBgs[Math.floor(Math.random() * avatarBgs.length)];

    await addStaff({
      name: newName.trim(),
      role: newRole,
      pin: newPin,
      email: newEmail.trim() || undefined,
      phone: newPhone.trim() || undefined,
      isActive: true,
      avatarBg: randomBg,
      branchId: currentBranch.id,
    });

    sounds.playPaymentSuccess();
    setIsAddStaffOpen(false);
    setNewName('');
    setNewPin('');
    setNewEmail('');
    setNewPhone('');
    setFormError(null);
  };

  const handleUpdatePin = () => {
    if (!editingStaff) return;
    if (editPinValue.length !== 4 || !/^\d{4}$/.test(editPinValue)) {
      alert('PIN 4 haneli rakam olmalıdır');
      return;
    }
    sounds.playPaymentSuccess();
    updateStaff(editingStaff.id, { pin: editPinValue });
    setEditingStaff(null);
    setEditPinValue('');
  };

  const handleSaveSettings = () => {
    sounds.playPaymentSuccess();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f17] text-slate-100 overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="px-6 py-4 bg-[#0e1320] border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-100">
                Yönetici & Güvenlik Konsolu
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                {currentBranch.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ciro özetleri, personel yetkilendirme, PIN güvenliği ve 509 VUK denetimi
            </p>
          </div>
        </div>

        {/* Quick Role Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-[#111827] border border-slate-800 text-slate-300 font-medium">
            Yetkili: <strong className="text-amber-400 font-semibold">{currentStaff.name}</strong> ({currentStaff.role.toUpperCase()})
          </span>
        </div>
      </div>

      {/* Sub Navbar Tabs */}
      <div className="px-6 border-b border-slate-800 bg-[#0e1320] flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('overview');
          }}
          className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Yönetim Özeti & KPI</span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('staff');
          }}
          className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'staff'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Personel & Rol Yönetimi ({staffList.length})</span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('security');
          }}
          className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'security'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Güvenlik & Audit Logs ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveTab('settings');
          }}
          className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Sistem & Şube Ayarları</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ======================= TAB 1: OVERVIEW ======================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm space-y-2">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Bugünkü Toplam Ciro
                </span>
                <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
                  ₺{currentZ.grandTotal.toLocaleString('tr-TR')}
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span>+18.4% dünün aynı saatine göre</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm space-y-2">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Anlık Açık Masalar
                </span>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
                  {occupiedTablesCount} / {tables.length}
                </div>
                <div className="text-[11px] text-slate-400 tabular-nums">
                  Açık Adisyon Tutarı: ₺{activeOrdersTotal.toLocaleString('tr-TR')}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm space-y-2">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Aktif Görevli Personel
                </span>
                <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
                  {staffList.filter((s) => s.isActive).length} Kişi
                </div>
                <div className="text-[11px] text-slate-400">
                  Yönetici: {staffList.filter((s) => s.role === 'admin' || s.role === 'manager').length} | Servis: {staffList.filter((s) => s.role === 'waiter').length}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#111827] border border-slate-800 shadow-sm space-y-2">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  509 VUK e-Adisyon Durumu
                </span>
                <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>GİB Canlı Aktif</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Mali Mühür: TÜBİTAK Kamu SM OK
                </div>
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Sales */}
              <div className="p-6 rounded-3xl bg-[#121624] border border-stone-800 space-y-4">
                <h3 className="font-bold text-sm text-stone-200 flex items-center justify-between">
                  <span>Kategori Bazlı Ciro Dağılımı</span>
                  <span className="text-xs font-mono text-stone-400">Z-Raporu v00842</span>
                </h3>
                <div className="space-y-3">
                  {currentZ.categorySales.map((cat) => {
                    const pct = Math.round((cat.amount / currentZ.grandTotal) * 100);
                    return (
                      <div key={cat.categoryName} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-300 font-medium">{cat.categoryName}</span>
                          <span className="font-bold text-stone-200">
                            {cat.amount.toLocaleString('tr-TR')} ₺ ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Staff Performance */}
              <div className="p-6 rounded-3xl bg-[#121624] border border-stone-800 space-y-4">
                <h3 className="font-bold text-sm text-stone-200 flex items-center justify-between">
                  <span>Personel Satış Performansı</span>
                  <span className="text-xs text-amber-400 font-mono">Bugünkü Ciro</span>
                </h3>
                <div className="space-y-3">
                  {currentZ.waiterSales.map((waiter) => {
                    const pct = Math.round((waiter.amount / currentZ.grandTotal) * 100);
                    return (
                      <div key={waiter.waiterName} className="p-3 rounded-2xl bg-[#181d2e] border border-stone-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                            {waiter.waiterName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-stone-200">{waiter.waiterName}</div>
                            <div className="text-[10px] text-stone-400">{waiter.count} Kapalı Adisyon</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-amber-400">
                            {waiter.amount.toLocaleString('tr-TR')} ₺
                          </div>
                          <div className="text-[10px] text-stone-500">Ciro Payı: %{pct}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 2: STAFF & RBAC ======================= */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Personel ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#121624] border border-stone-800 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-[#121624] border border-stone-800 text-xs text-stone-300 focus:outline-none"
                >
                  <option value="all">Tüm Roller</option>
                  <option value="admin">Admin / Patron</option>
                  <option value="manager">Müdür</option>
                  <option value="cashier">Kasiyer</option>
                  <option value="chef">Mutfak Şefi</option>
                  <option value="waiter">Garson</option>
                  <option value="courier">Kurye</option>
                </select>
              </div>

              <button
                onClick={() => {
                  sounds.playTap();
                  setIsAddStaffOpen(true);
                }}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Personel Tanımla</span>
              </button>
            </div>

            {/* Staff Table */}
            <div className="rounded-3xl bg-[#121624] border border-stone-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181d2e] text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-800">
                  <tr>
                    <th className="px-5 py-3.5">Personel</th>
                    <th className="px-5 py-3.5">Yetki Rolü</th>
                    <th className="px-5 py-3.5">4 Haneli PIN</th>
                    <th className="px-5 py-3.5">Son Oturum</th>
                    <th className="px-5 py-3.5">Durum</th>
                    <th className="px-5 py-3.5 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  {filteredStaff.map((staff) => {
                    const roleMeta = ROLE_DEFINITIONS[staff.role] || ROLE_DEFINITIONS.waiter;
                    return (
                      <tr key={staff.id} className="hover:bg-[#161a29] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl ${staff.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-sm`}
                            >
                              {staff.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-stone-100">{staff.name}</div>
                              <div className="text-[11px] text-stone-400">
                                {staff.phone || staff.email || 'Telefon belirtilmedi'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${roleMeta.badgeBg}`}
                          >
                            {roleMeta.badgeText}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-mono font-bold text-amber-400">
                          •••• ({staff.pin})
                        </td>

                        <td className="px-5 py-4 text-stone-400 text-[11px]">
                          {staff.lastLoginAt
                            ? new Date(staff.lastLoginAt).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Henüz girmedi'}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              staff.isActive
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            {staff.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                sounds.playTap();
                                setEditingStaff(staff);
                                setEditPinValue(staff.pin);
                              }}
                              title="PIN Değiştir"
                              className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-amber-500/20 text-stone-300 hover:text-amber-400 transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {staff.role !== 'admin' && (
                              <button
                                onClick={() => {
                                  sounds.playTap();
                                  if (confirm(`${staff.name} adlı personeli silmek istediğinize emin misiniz?`)) {
                                    deleteStaff(staff.id);
                                  }
                                }}
                                title="Personeli Sil"
                                className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: SECURITY & AUDIT ======================= */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Filter Chips */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-bold">Filtrele:</span>
                {(['all', 'info', 'warning', 'critical'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => {
                      sounds.playTap();
                      setLogSeverityFilter(sev);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      logSeverityFilter === sev
                        ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-sm'
                        : 'bg-[#121624] text-stone-400 border-stone-800 hover:text-white'
                    }`}
                  >
                    {sev === 'all' && 'Tümü'}
                    {sev === 'info' && 'Bilgi (Info)'}
                    {sev === 'warning' && 'Uyarı (Warning)'}
                    {sev === 'critical' && 'Kritik'}
                  </button>
                ))}
              </div>

              <span className="text-xs text-stone-500 font-mono">
                Toplam {filteredLogs.length} denetim kaydı listeleniyor
              </span>
            </div>

            {/* Audit Logs List */}
            <div className="rounded-3xl bg-[#121624] border border-stone-800 divide-y divide-stone-800/80 overflow-hidden">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 flex items-start justify-between gap-4 hover:bg-[#161a29] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        log.severity === 'critical'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : log.severity === 'warning'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      }`}
                    >
                      {log.severity === 'critical' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-100">{log.action}</span>
                        <span
                          className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            log.severity === 'critical'
                              ? 'bg-red-500/20 text-red-400'
                              : log.severity === 'warning'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {log.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-300 mt-0.5">{log.details}</p>
                      <div className="text-[10px] text-stone-500 mt-1 flex items-center gap-2 font-mono">
                        <span>İşlemi Yapan: {log.staffName} ({log.staffRole})</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>
                        {new Date(log.timestamp).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= TAB 4: SETTINGS ======================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-3xl bg-[#121624] border border-stone-800 space-y-5">
              <h3 className="font-bold text-sm text-stone-200 border-b border-stone-800 pb-3">
                Güvenlik ve Oturum Parametreleri
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-400">
                    Otomatik Ekran Kilit Süresi
                  </label>
                  <select
                    value={securitySettings.sessionTimeoutMinutes}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        sessionTimeoutMinutes: Number(e.target.value),
                      }))
                    }
                    className="w-full py-2.5 px-3 rounded-xl bg-[#181d2e] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value={5}>5 Dakika (Yüksek Güvenlik)</option>
                    <option value={15}>15 Dakika (Önerilen)</option>
                    <option value={30}>30 Dakika</option>
                    <option value={60}>1 Saat</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-400">
                    Maksimum Hatalı PIN Limiti
                  </label>
                  <select
                    value={securitySettings.maxFailedAttempts}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        maxFailedAttempts: Number(e.target.value),
                      }))
                    }
                    className="w-full py-2.5 px-3 rounded-xl bg-[#181d2e] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value={3}>3 Deneme (60sn Kilit)</option>
                    <option value={5}>5 Deneme</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#121624] border border-stone-800 space-y-5">
              <h3 className="font-bold text-sm text-stone-200 border-b border-stone-800 pb-3">
                Maliye ve e-Adisyon Parametreleri (VUK 509)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-400">Gıda KDV Oranı (%)</label>
                  <input
                    type="number"
                    value={securitySettings.vatFoodRate}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        vatFoodRate: Number(e.target.value),
                      }))
                    }
                    className="w-full py-2.5 px-3 rounded-xl bg-[#181d2e] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-400">İçki/Hizmet KDV (%)</label>
                  <input
                    type="number"
                    value={securitySettings.vatDrinkRate}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        vatDrinkRate: Number(e.target.value),
                      }))
                    }
                    className="w-full py-2.5 px-3 rounded-xl bg-[#181d2e] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-400">Varsayılan Kuver (₺)</label>
                  <input
                    type="number"
                    value={securitySettings.defaultCoverCharge}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        defaultCoverCharge: Number(e.target.value),
                      }))
                    }
                    className="w-full py-2.5 px-3 rounded-xl bg-[#181d2e] border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-stone-200">GİB Canlı e-Adisyon Entegrasyonu</div>
                  <div className="text-[11px] text-stone-400">
                    Özel Entegratör ve TÜBİTAK Kamu SM mali mühür aktif
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  Sertifika Geçerli
                </span>
              </div>
            </div>

            {/* Emergency Lockdown Zone */}
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-200">
                      Acil Durum Terminal Kilidi (Lockdown)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Tüm terminal ekranlarını anında dondurur ve sadece yetkili şifresiyle açılır.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    toggleEmergencyLockdown();
                  }}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors ${
                    securitySettings.emergencyLockdown
                      ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                      : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>
                    {securitySettings.emergencyLockdown
                      ? 'ACİL KİLİT AKTİF (Kaldır)'
                      : 'Acil Durum Kilidini Başlat'}
                  </span>
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sistem ayarları başarıyla kaydedildi!</span>
                </span>
              )}
              <button
                onClick={handleSaveSettings}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                Ayarları Kaydet & Uygula
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================= MODAL: ADD STAFF ======================= */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#121624] border border-stone-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-stone-100">Yeni Personel Tanımla</h3>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-400">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Burak Özdemir"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#181d2e] border border-stone-800 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-400">Yetki Rolü *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as StaffRole)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#181d2e] border border-stone-800 text-xs text-stone-200 focus:outline-none"
                  >
                    <option value="waiter">Garson</option>
                    <option value="cashier">Kasiyer</option>
                    <option value="chef">Mutfak Şefi</option>
                    <option value="manager">Müdür</option>
                    <option value="courier">Kurye</option>
                    <option value="admin">İşletme Sahibi (Admin)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-400">4 Haneli PIN *</label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="1234"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#181d2e] border border-stone-800 text-xs font-mono text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 text-center tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-400">Telefon Numarası</label>
                <input
                  type="text"
                  placeholder="0532 000 00 00"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#181d2e] border border-stone-800 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {formError && (
                <div className="text-xs text-rose-400 font-semibold">{formError}</div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-semibold text-xs"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  Personeli Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: EDIT PIN ======================= */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#121624] border border-stone-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-stone-100">PIN Değiştir</h3>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-400">
              <strong className="text-stone-200">{editingStaff.name}</strong> için yeni 4 haneli PIN belirleyin:
            </p>

            <input
              type="password"
              maxLength={4}
              value={editPinValue}
              onChange={(e) => setEditPinValue(e.target.value)}
              placeholder="Yeni 4 Haneli PIN"
              className="w-full py-3 px-4 rounded-xl bg-[#181d2e] border border-stone-800 text-center font-mono text-lg tracking-widest text-amber-400 focus:outline-none focus:border-amber-500"
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingStaff(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 font-semibold text-xs"
              >
                Vazgeç
              </button>
              <button
                onClick={handleUpdatePin}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
              >
                PIN'i Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
