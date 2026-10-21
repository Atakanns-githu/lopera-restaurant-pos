'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { usePOS } from '@/lib/store';
import { sounds } from '@/lib/audio';
import { MenuItem, OrderItemModifierSelection } from '@/types/pos';
import {
  QrCode,
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Bell,
  Receipt,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  X,
  UtensilsCrossed,
  Info,
} from 'lucide-react';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  modifiers: OrderItemModifierSelection[];
  specialNote: string;
}

function CustomerMenuContent() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get('table');

  const {
    categories,
    menuItems,
    tables,
    addItemToTableOrder,
    getOrderByTableId,
    requestTableBill,
  } = usePOS();

  const [selectedTableId, setSelectedTableId] = useState<string>(
    tables.find((t) => t.tableNumber === tableParam)?.id || tables[0]?.id || ''
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Customization modal state
  const [activeItemForModal, setActiveItemForModal] = useState<MenuItem | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<OrderItemModifierSelection[]>([]);
  const [specialNote, setSpecialNote] = useState('');
  const [modalQuantity, setModalQuantity] = useState(1);

  // Bell request state
  const [waiterCalled, setWaiterCalled] = useState(false);

  useEffect(() => {
    if (tableParam) {
      const found = tables.find((t) => t.tableNumber.toLowerCase() === tableParam.toLowerCase());
      if (found) setSelectedTableId(found.id);
    }
  }, [tableParam, tables]);

  const currentTable = tables.find((t) => t.id === selectedTableId) || tables[0];
  const tableOrder = selectedTableId ? getOrderByTableId(selectedTableId) : undefined;

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategoryId === 'all' || item.categoryId === selectedCategoryId;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenDetail = (item: MenuItem) => {
    sounds.playTap();
    setActiveItemForModal(item);
    setSelectedModifiers([]);
    setSpecialNote('');
    setModalQuantity(1);
  };

  const handleAddToCart = () => {
    if (!activeItemForModal) return;
    sounds.playAddItem();

    setCart((prev) => [
      ...prev,
      {
        menuItem: activeItemForModal,
        quantity: modalQuantity,
        modifiers: selectedModifiers,
        specialNote,
      },
    ]);

    setActiveItemForModal(null);
  };

  const handleSendOrder = () => {
    if (cart.length === 0 || !selectedTableId) return;

    cart.forEach((c) => {
      addItemToTableOrder(
        selectedTableId,
        c.menuItem,
        c.modifiers,
        c.specialNote,
        c.quantity
      );
    });

    sounds.playOrderSent();
    setCart([]);
    setIsCartOpen(false);
    setOrderSuccessMsg(`Siparişiniz Masa ${currentTable.tableNumber} adına mutfağa iletildi!`);
    setTimeout(() => setOrderSuccessMsg(null), 4000);
  };

  const handleCallWaiter = () => {
    sounds.playKitchenAlert();
    setWaiterCalled(true);
    setTimeout(() => setWaiterCalled(false), 3500);
  };

  const handleRequestBill = () => {
    if (!selectedTableId) return;
    sounds.playTap();
    requestTableBill(selectedTableId);
    setOrderSuccessMsg(`Hesap talebiniz servis görevlisine iletildi.`);
    setTimeout(() => setOrderSuccessMsg(null), 4000);
  };

  const cartTotal = cart.reduce((sum, item) => {
    const mods = item.modifiers.reduce((mSum, m) => mSum + m.priceDelta, 0);
    return sum + (item.menuItem.price + mods) * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen w-full bg-[#090b10] text-stone-100 flex flex-col font-sans select-none pb-28">
      {/* Top Customer Header */}
      <header className="sticky top-0 z-40 bg-[#0e111a]/95 backdrop-blur-xl border-b border-stone-800/80 px-4 py-3 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-serif font-black text-stone-950 shadow-md"
            >
              Z
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-extrabold text-sm tracking-wider text-stone-100">
                  L’OPÉRA RESTORAN
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                  Masadan Sipariş
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono">
                Zynox Temassız QR Menü
              </p>
            </div>
          </div>

          {/* Table Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 hidden sm:inline">Masa:</span>
            <select
              value={selectedTableId}
              onChange={(e) => {
                sounds.playTap();
                setSelectedTableId(e.target.value);
              }}
              className="bg-[#141824] border border-stone-700 text-amber-400 text-xs font-bold font-mono rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  Masa {t.tableNumber} ({t.section})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-4 space-y-4">
        {/* Table & Bill Status Banner */}
        {tableOrder && tableOrder.status === 'open' && (
          <div className="p-3.5 rounded-2xl bg-[#141824] border border-amber-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400">
                Masa {currentTable.tableNumber} Açık Siparişiniz
              </div>
              <div className="text-sm font-bold font-mono text-amber-400">
                {tableOrder.total.toLocaleString('tr-TR')} ₺ ({tableOrder.items.length} Kalem)
              </div>
            </div>
            <button
              onClick={handleRequestBill}
              className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Hesap İste</span>
            </button>
          </div>
        )}

        {/* Success Alert */}
        {orderSuccessMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{orderSuccessMsg}</span>
          </div>
        )}

        {/* Waiter Alert */}
        {waiterCalled && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <Bell className="w-4 h-4 flex-shrink-0 animate-bounce" />
            <span>Garson çağrınız masanıza yönlendirildi, birazdan yanınızda olacaktır.</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            placeholder="Lezzet ara (Antrikot, Tiramisu, Burrata, Şarap)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121622] border border-stone-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/50 shadow-inner"
          />
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => {
              sounds.playTap();
              setSelectedCategoryId('all');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategoryId === 'all'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'bg-[#121622] text-stone-400 hover:text-stone-200 border border-stone-800'
            }`}
          >
            Tüm Lezzetler ({menuItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playTap();
                setSelectedCategoryId(cat.id);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-[#121622] text-stone-400 hover:text-stone-200 border border-stone-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-[#121622] border border-stone-800/80 hover:border-amber-500/30 transition-all flex flex-col justify-between shadow-lg group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-bold text-sm text-stone-100 group-hover:text-amber-400 transition-colors">
                    {item.name}
                  </h4>
                  <span className="font-bold font-mono text-sm text-amber-400 whitespace-nowrap">
                    {item.price.toLocaleString('tr-TR')} ₺
                  </span>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-2 mt-3 text-[10px] text-stone-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{item.prepTimeMinutes} dk</span>
                  </span>
                  {item.calories && <span>• {item.calories} kcal</span>}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-stone-800/60 flex items-center justify-between">
                <button
                  onClick={() => handleOpenDetail(item)}
                  className="text-xs text-stone-400 hover:text-stone-200 underline font-medium"
                >
                  Detay & Seçenekler
                </button>

                <button
                  onClick={() => handleOpenDetail(item)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 transition-all shadow-md shadow-amber-500/20 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ekle</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Bottom Bar: Garson Çağır + Sepet Çubuğu */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0e111a]/95 backdrop-blur-xl border-t border-stone-800 p-3 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={handleCallWaiter}
            className="px-4 py-2.5 rounded-2xl bg-[#141824] hover:bg-[#1c2235] text-stone-300 hover:text-amber-400 border border-stone-800 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Garson Çağır</span>
          </button>

          {cart.length > 0 ? (
            <button
              onClick={() => {
                sounds.playTap();
                setIsCartOpen(true);
              }}
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-xl shadow-amber-500/20 active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Sepeti Gör ({cart.reduce((s, i) => s + i.quantity, 0)} Ürün)</span>
              </div>
              <span className="font-mono text-base">{cartTotal.toLocaleString('tr-TR')} ₺</span>
            </button>
          ) : (
            <div className="text-xs text-stone-500 font-mono">
              Sepetiniz boş • Ürün ekleyin
            </div>
          )}
        </div>
      </div>

      {/* Customization Modal */}
      {activeItemForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#141824] border border-stone-800 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-100">
                  {activeItemForModal.name}
                </h3>
                <p className="text-xs text-amber-400 font-mono font-bold mt-0.5">
                  {activeItemForModal.price.toLocaleString('tr-TR')} ₺
                </p>
              </div>
              <button
                onClick={() => setActiveItemForModal(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-400">{activeItemForModal.description}</p>

            {/* Modifier Groups */}
            {activeItemForModal.modifiers?.map((grp) => (
              <div key={grp.groupName} className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300">
                  {grp.groupName}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {grp.options.map((opt) => {
                    const isSelected = selectedModifiers.some(
                      (m) => m.groupName === grp.groupName && m.name === opt.name
                    );

                    return (
                      <button
                        key={opt.name}
                        onClick={() => {
                          sounds.playTap();
                          setSelectedModifiers((prev) => {
                            const without = prev.filter((m) => m.groupName !== grp.groupName);
                            return [
                              ...without,
                              {
                                groupName: grp.groupName,
                                name: opt.name,
                                priceDelta: opt.priceDelta,
                              },
                            ];
                          });
                        }}
                        className={`p-2 rounded-xl text-xs font-semibold text-left border transition-all ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-[#181d2e] border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <div>{opt.name}</div>
                        {opt.priceDelta > 0 && (
                          <div className="text-[10px] text-amber-400 font-mono">
                            +{opt.priceDelta} ₺
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Special Note */}
            <div>
              <label className="text-xs text-stone-400 block mb-1">
                Şefe Özel İstek / Not
              </label>
              <input
                type="text"
                placeholder="Örn: Az tuzlu olsun, sosu ayrı gelsin..."
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                className="w-full bg-[#0e111a] border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 bg-[#0e111a] p-1.5 rounded-xl border border-stone-700">
                <button
                  onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg bg-stone-800 text-stone-200 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-sm font-bold text-stone-100 w-4 text-center">
                  {modalQuantity}
                </span>
                <button
                  onClick={() => setModalQuantity((q) => q + 1)}
                  className="w-7 h-7 rounded-lg bg-stone-800 text-stone-200 flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20"
              >
                Sepete Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#141824] border border-stone-800 p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-stone-100">
                  Masa {currentTable.tableNumber} Sipariş Sepeti
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {cart.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#0e111a] border border-stone-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-stone-100">
                      {item.quantity}x {item.menuItem.name}
                    </div>
                    {item.modifiers.length > 0 && (
                      <div className="text-[10px] text-amber-400 font-mono">
                        {item.modifiers.map((m) => m.name).join(', ')}
                      </div>
                    )}
                    {item.specialNote && (
                      <div className="text-[10px] text-stone-400 italic">
                        &quot;{item.specialNote}&quot;
                      </div>
                    )}
                  </div>
                  <div className="font-mono text-xs font-bold text-stone-200">
                    {(item.menuItem.price * item.quantity).toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-sm">
              <span className="text-stone-400">Toplam Sepet Tutarı:</span>
              <span className="font-mono font-bold text-amber-400 text-lg">
                {cartTotal.toLocaleString('tr-TR')} ₺
              </span>
            </div>

            <button
              onClick={handleSendOrder}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-sm transition-all shadow-xl shadow-amber-500/20 active:scale-95"
            >
              Siparişi Onayla & Mutfağa İlet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090b10] flex items-center justify-center text-amber-400 font-mono text-sm">
          Menü Yükleniyor...
        </div>
      }
    >
      <CustomerMenuContent />
    </Suspense>
  );
}
