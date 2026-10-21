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
} from 'lucide-react';
import { Customer } from '@/types/pos';

export default function CustomerManager() {
  const { customers, addLoyaltyPoints, recordCreditPayment } = usePOS();
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

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-[#090b10] text-stone-100 overflow-hidden select-none">
      {/* Top Header & KPI Cards */}
      <div className="p-4 border-b border-stone-800/80 bg-[#0e111a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-100">
                Cari Müşteri & Sadakat (CRM)
              </h2>
              <p className="text-xs text-stone-400">
                Veresiye / açık hesap takibi, puan yönetimi ve müşteri geçmişi
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              setIsNewCustomerModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Cari Müşteri Ekle</span>
          </button>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#121624] border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400">Toplam Açık Hesap (Cari Borç)</div>
              <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">
                {totalCreditDebt.toLocaleString('tr-TR')} ₺
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121624] border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400">Toplam Sadakat Puanı</div>
              <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                {totalLoyaltyPoints.toLocaleString('tr-TR')} Puan
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#121624] border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400">Kayıtlı Cari Müşteri</div>
              <div className="text-lg font-bold font-mono text-stone-100 mt-0.5">
                {customers.length} Müşteri
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Filters & Search Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => {
                sounds.playTap();
                setFilterType('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-[#141824] text-stone-300 hover:bg-stone-800'
              }`}
            >
              Tüm Müşteriler ({customers.length})
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setFilterType('credit');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === 'credit'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-[#141824] text-stone-300 hover:bg-stone-800'
              }`}
            >
              Borcu Olanlar ({customers.filter((c) => c.creditBalance > 0).length})
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setFilterType('vip');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === 'vip'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-[#141824] text-stone-300 hover:bg-stone-800'
              }`}
            >
              VIP Müşteriler
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="İsim, telefon veya adres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#141824] border border-stone-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* Customer Table / Card List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => {
            const hasDebt = customer.creditBalance > 0;

            return (
              <div
                key={customer.id}
                className="rounded-3xl bg-[#121622] border border-stone-800/80 p-5 flex flex-col justify-between hover:border-stone-700 transition-all shadow-lg"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-black text-sm flex items-center justify-center shadow-md">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-stone-100 flex items-center gap-1.5">
                          <span>{customer.name}</span>
                          {customer.loyaltyPoints > 200 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                              VIP
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-stone-400 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-500" />
                          <span>{customer.phone}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-stone-500">Cari Bakiye</div>
                      <div
                        className={`text-sm font-bold font-mono ${
                          hasDebt ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {customer.creditBalance > 0
                          ? `${customer.creditBalance.toLocaleString('tr-TR')} ₺ Borç`
                          : 'Temiz'}
                      </div>
                    </div>
                  </div>

                  {/* Customer Info Snippets */}
                  <div className="space-y-1.5 py-3 border-y border-stone-800/60 text-xs text-stone-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                      <span className="truncate text-stone-400">{customer.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                      <span className="truncate text-stone-400">{customer.email}</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 py-3 text-center">
                    <div className="bg-[#161a29] p-2 rounded-xl">
                      <div className="text-[10px] text-stone-500">Puan</div>
                      <div className="text-xs font-bold font-mono text-amber-400">
                        {customer.loyaltyPoints}
                      </div>
                    </div>
                    <div className="bg-[#161a29] p-2 rounded-xl">
                      <div className="text-[10px] text-stone-500">Sipariş</div>
                      <div className="text-xs font-bold font-mono text-stone-200">
                        {customer.totalOrdersCount}
                      </div>
                    </div>
                    <div className="bg-[#161a29] p-2 rounded-xl">
                      <div className="text-[10px] text-stone-500">Ciro</div>
                      <div className="text-xs font-bold font-mono text-stone-200">
                        {customer.totalSpent.toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleOpenPoints(customer)}
                    className="flex-1 py-2 rounded-xl bg-[#181c2b] hover:bg-[#20263a] text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Puan Ekle</span>
                  </button>

                  {hasDebt ? (
                    <button
                      onClick={() => handleOpenPayment(customer)}
                      className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-rose-600/20"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Tahsilat Gir</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => sounds.playTap()}
                      className="flex-1 py-2 rounded-xl bg-[#141824] text-stone-400 font-semibold text-xs border border-stone-800 hover:text-stone-200 transition-colors"
                    >
                      Geçmiş Adisyonlar
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#141824] border border-stone-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-sm text-stone-100 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-rose-400" />
                <span>Cari Borç Tahsilatı</span>
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-stone-400">
                <strong className="text-stone-200">{selectedCustomer.name}</strong> adlı
                müşterinin güncel borcu:{' '}
                <span className="font-mono text-rose-400 font-bold">
                  {selectedCustomer.creditBalance.toLocaleString('tr-TR')} ₺
                </span>
              </p>
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">
                Tahsil Edilen Miktar (₺)
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full bg-[#0e111a] border border-stone-700 rounded-xl px-3 py-2 text-sm font-mono text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={handleConfirmPayment}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-lg shadow-emerald-600/20"
              >
                Tahsilatı Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Points Modal */}
      {isPointsModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#141824] border border-stone-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-sm text-stone-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Sadakat Puanı Yükle</span>
              </h3>
              <button
                onClick={() => setIsPointsModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-stone-400">
                <strong className="text-stone-200">{selectedCustomer.name}</strong> mevcut puanı:{' '}
                <span className="font-mono text-amber-400 font-bold">
                  {selectedCustomer.loyaltyPoints} Puan
                </span>
              </p>
            </div>

            <div>
              <label className="text-xs text-stone-400 block mb-1">
                Eklenecek Puan
              </label>
              <input
                type="number"
                value={pointsToAdd}
                onChange={(e) => setPointsToAdd(e.target.value)}
                className="w-full bg-[#0e111a] border border-stone-700 rounded-xl px-3 py-2 text-sm font-mono text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsPointsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
              >
                Vazgeç
              </button>
              <button
                onClick={handleConfirmPoints}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors shadow-lg shadow-amber-500/20"
              >
                Puanı Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
