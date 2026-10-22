'use client';

import React, { useState } from 'react';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import {
  Users,
  Search,
  Plus,
  Award,
  Wallet,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  X,
  CreditCard,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { Customer } from '@/types/pos';

export default function CustomerManager() {
  const { customers, addLoyaltyPoints, recordCreditPayment, addCustomer } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'vip'>('all');

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState('');

  // New Customer Modal
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustError, setNewCustError] = useState<string | null>(null);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'credit') return c.creditBalance > 0;
    if (filterType === 'vip') return c.loyaltyPoints > 200 || c.totalSpent > 10000;
    return true;
  });

  const totalCreditDebt = customers.reduce((sum, c) => sum + c.creditBalance, 0);
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);

  const handleOpenPayment = (customer: Customer) => {
    sounds.playTap();
    setSelectedCustomer(customer);
    setPaymentAmount(customer.creditBalance.toString());
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedCustomer) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    recordCreditPayment(selectedCustomer.id, amount);
    setIsPaymentModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleOpenPoints = (customer: Customer) => {
    sounds.playTap();
    setSelectedCustomer(customer);
    setPointsToAdd('50');
    setIsPointsModalOpen(true);
  };

  const handleConfirmPoints = () => {
    if (!selectedCustomer) return;
    const pts = parseInt(pointsToAdd, 10);
    if (isNaN(pts) || pts <= 0) return;

    addLoyaltyPoints(selectedCustomer.id, pts);
    setIsPointsModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      setNewCustError('Lütfen müşteri adı ve soyadı giriniz');
      return;
    }
    if (!newCustPhone.trim()) {
      setNewCustError('Lütfen telefon numarası giriniz');
      return;
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      email: newCustEmail.trim() || `${newCustName.toLowerCase().replace(/\s+/g, '')}@musteri.com`,
      address: newCustAddress.trim() || 'İstanbul',
      loyaltyPoints: 0,
      creditBalance: 0,
      totalOrdersCount: 0,
      totalSpent: 0,
      lastOrderDate: new Date().toISOString(),
    };

    if (addCustomer) {
      addCustomer(newCustomer);
    }
    sounds.playTap();
    setIsNewCustomerModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustAddress('');
    setNewCustError(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#0b0f17] text-slate-100 overflow-hidden select-none">
      {/* Top Header & Metrics Banner */}
      <div className="p-5 border-b border-slate-800/80 bg-[#0e1320]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 text-amber-400 flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-base text-slate-100 tracking-tight">
                  Cari & Sadakat Portföyü
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  CRM v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Açık hesap bakiyeleri, veresiye mutabakatı ve kurumsal misafir yönetimi
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              setIsNewCustomerModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Yeni Cari Müşteri Ekle</span>
          </button>
        </div>

        {/* 3 High-Craft Financial Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-[#121826] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-400">Toplam Açık Hesap (Cari Borç)</div>
              <div className="text-xl font-bold font-mono tabular-nums text-rose-400 mt-1">
                ₺{totalCreditDebt.toLocaleString('tr-TR')}
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#121826] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-400">Toplam Sadakat Puanı</div>
              <div className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-1">
                {totalLoyaltyPoints.toLocaleString('tr-TR')} <span className="text-xs font-normal text-slate-400">Puan</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#121826] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-400">Kayıtlı Cari Müşteri</div>
              <div className="text-xl font-bold font-mono tabular-nums text-slate-100 mt-1">
                {customers.length} <span className="text-xs font-normal text-slate-400">Misafir</span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Clean Segmented Control & Search Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/60">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111827] border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => {
                sounds.playTap();
                setFilterType('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tüm Portföy ({customers.length})
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setFilterType('credit');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === 'credit'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Açık Hesap / Borçlular ({customers.filter((c) => c.creditBalance > 0).length})
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setFilterType('vip');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === 'vip'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              VIP Misafirler
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="İsim, telefon veya adres ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111827] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => {
            const hasDebt = customer.creditBalance > 0;
            const isVip = customer.loyaltyPoints > 200 || customer.totalSpent > 25000;

            return (
              <div
                key={customer.id}
                className="rounded-2xl bg-[#111827] border border-slate-800/80 p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm group"
              >
                <div>
                  {/* Card Header: Neutral Slate Avatar + Name + Balance */}
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center shrink-0">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-slate-100">
                            {customer.name}
                          </h3>
                          {isVip && (
                            <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              VIP
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{customer.phone}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Cari Bakiye</div>
                      <div
                        className={`text-sm font-bold font-mono tabular-nums mt-0.5 ${
                          hasDebt ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {hasDebt
                          ? `₺${customer.creditBalance.toLocaleString('tr-TR')} Borç`
                          : 'Temiz (0 ₺)'}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info Snippets */}
                  <div className="space-y-1.5 py-3 border-y border-slate-800/60 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate text-slate-400">{customer.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate text-slate-400">{customer.email}</span>
                    </div>
                  </div>

                  {/* Tabular Performance Bar */}
                  <div className="grid grid-cols-3 gap-2 py-3 text-center">
                    <div className="bg-[#0e1320] p-2.5 rounded-xl border border-slate-800/60">
                      <div className="text-[10px] font-medium text-slate-500">Puan</div>
                      <div className="text-xs font-bold font-mono tabular-nums text-amber-400 mt-0.5">
                        {customer.loyaltyPoints}
                      </div>
                    </div>
                    <div className="bg-[#0e1320] p-2.5 rounded-xl border border-slate-800/60">
                      <div className="text-[10px] font-medium text-slate-500">Sipariş</div>
                      <div className="text-xs font-bold font-mono tabular-nums text-slate-200 mt-0.5">
                        {customer.totalOrdersCount}
                      </div>
                    </div>
                    <div className="bg-[#0e1320] p-2.5 rounded-xl border border-slate-800/60">
                      <div className="text-[10px] font-medium text-slate-500">Toplam Ciro</div>
                      <div className="text-xs font-bold font-mono tabular-nums text-slate-200 mt-0.5">
                        ₺{customer.totalSpent.toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Action Buttons (No Hot Pink!) */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleOpenPoints(customer)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-amber-300 font-semibold text-xs border border-amber-500/20 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Puan Ekle</span>
                  </button>

                  {hasDebt ? (
                    <button
                      onClick={() => handleOpenPayment(customer)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                      <span>Tahsilat Al</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => sounds.playTap()}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-900/60 text-slate-400 font-medium text-xs border border-slate-800 hover:text-slate-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Adisyon Geçmişi</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credit Payment Modal */}
      {isPaymentModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#111827] border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-400" />
                <span>Cari Borç Tahsilatı</span>
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#0e1320] p-3 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400">Müşteri:</div>
              <div className="text-sm font-semibold text-slate-200">{selectedCustomer.name}</div>
              <div className="text-xs text-slate-400 mt-2">Güncel Açık Hesap Bakiyesi:</div>
              <div className="text-lg font-bold font-mono tabular-nums text-rose-400">
                ₺{selectedCustomer.creditBalance.toLocaleString('tr-TR')}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                Tahsil Edilen Tutar (₺)
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full bg-[#0e1320] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmPayment}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors shadow-sm"
              >
                Tahsilatı Onayla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Points Modal */}
      {isPointsModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#111827] border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Sadakat Puanı Tanımla</span>
              </h3>
              <button
                onClick={() => setIsPointsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#0e1320] p-3 rounded-xl border border-slate-800/80">
              <div className="text-xs text-slate-400">Müşteri:</div>
              <div className="text-sm font-semibold text-slate-200">{selectedCustomer.name}</div>
              <div className="text-xs text-slate-400 mt-2">Mevcut Sadakat Puanı:</div>
              <div className="text-lg font-bold font-mono tabular-nums text-amber-400">
                {selectedCustomer.loyaltyPoints} Puan
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
                Eklenecek Puan
              </label>
              <input
                type="number"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
                className="w-full bg-[#0e1320] border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsPointsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmPoints}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors shadow-sm"
              >
                Puanı Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustomer}
            className="w-full max-w-md rounded-2xl bg-[#111827] border border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Yeni Cari Müşteri Kaydı</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newCustError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{newCustError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Müşteri Adı & Soyadı / Kurum Ünvanı *
                </label>
                <input
                  type="text"
                  placeholder="örn: Selin Yılmaz veya Nova A.Ş."
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-[#0e1320] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Telefon Numarası *
                </label>
                <input
                  type="text"
                  placeholder="örn: 0532 555 44 33"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full bg-[#0e1320] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  E-Posta (E-Fatura / Mutabakat)
                </label>
                <input
                  type="email"
                  placeholder="örn: muhasebe@sirket.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full bg-[#0e1320] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Adres & İlçe
                </label>
                <input
                  type="text"
                  placeholder="örn: Teşvikiye Cad. No: 14 Şişli / İstanbul"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full bg-[#0e1320] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors shadow-sm"
              >
                Müşteriyi Kaydet
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
