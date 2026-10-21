'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Category,
  InventoryItem,
  MenuItem,
  Order,
  OrderItem,
  OrderItemModifierSelection,
  PaymentMethod,
  PaymentRecord,
  Recipe,
  SectionId,
  Staff,
  TableItem,
  TableStatus,
  ZReport,
} from '@/types/pos';
import {
  CATEGORIES,
  INITIAL_INVENTORY,
  INITIAL_ORDERS,
  INITIAL_RECIPES,
  INITIAL_STAFF,
  INITIAL_TABLES,
  INITIAL_Z_REPORT,
  MENU_ITEMS,
} from './mockData';
import { sounds } from './audio';

interface POSContextType {
  activeTab: 'floor' | 'pos' | 'kds' | 'inventory' | 'reports';
  setActiveTab: (tab: 'floor' | 'pos' | 'kds' | 'inventory' | 'reports') => void;
  currentSection: SectionId;
  setCurrentSection: (section: SectionId) => void;
  viewMode: '3d' | '2d';
  setViewMode: (mode: '3d' | '2d') => void;
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  currentStaff: Staff;
  setCurrentStaff: (staff: Staff) => void;
  tables: TableItem[];
  orders: Order[];
  categories: Category[];
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  recipes: Recipe[];
  zReports: ZReport[];

  // Modals
  isPinModalOpen: boolean;
  setIsPinModalOpen: (open: boolean) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (open: boolean) => void;
  activeReceiptOrder: Order | null;
  setActiveReceiptOrder: (order: Order | null) => void;
  isTableTransferModalOpen: boolean;
  setIsTableTransferModalOpen: (open: boolean) => void;

  // Actions
  selectTableAndOpenPOS: (tableId: string) => void;
  getOrderByTableId: (tableId: string) => Order | undefined;
  addItemToTableOrder: (
    tableId: string,
    menuItem: MenuItem,
    modifiers: OrderItemModifierSelection[],
    specialNote?: string,
    quantity?: number
  ) => void;
  updateItemQuantity: (orderId: string, itemId: string, delta: number) => void;
  removeItemFromOrder: (orderId: string, itemId: string) => void;
  toggleItemGift: (orderId: string, itemId: string) => void;
  applyDiscount: (orderId: string, rate: number) => void;
  sendOrderToKitchen: (orderId: string) => void;
  updateKdsItemStatus: (
    orderId: string,
    itemId: string,
    status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'
  ) => void;
  requestTableBill: (tableId: string) => void;
  processPayment: (
    orderId: string,
    method: PaymentMethod,
    amount: number,
    tipAmount?: number,
    note?: string
  ) => boolean;
  transferTable: (fromTableId: string, toTableId: string) => void;
  clearTable: (tableId: string) => void;
  updateInventoryStock: (itemId: string, newStock: number) => void;
  generateNewZReport: () => ZReport;
}

const POSContext = createContext<POSContextType | null>(null);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<'floor' | 'pos' | 'kds' | 'inventory' | 'reports'>('floor');
  const [currentSection, setCurrentSection] = useState<SectionId>('ana_salon');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [currentStaff, setCurrentStaff] = useState<Staff>(INITIAL_STAFF[0]);

  const [tables, setTables] = useState<TableItem[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [categories] = useState<Category[]>(CATEGORIES);
  const [menuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [recipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [zReports, setZReports] = useState<ZReport[]>([INITIAL_Z_REPORT]);

  // Modals state
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [isTableTransferModalOpen, setIsTableTransferModalOpen] = useState<boolean>(false);

  // Sync tables currentOrderId
  const getOrderByTableId = (tableId: string): Order | undefined => {
    return orders.find((o) => o.tableId === tableId && o.status === 'open');
  };

  const selectTableAndOpenPOS = (tableId: string) => {
    setSelectedTableId(tableId);
    setActiveTab('pos');
    sounds.playTap();
  };

  const calculateOrderTotals = (items: OrderItem[], discountRate: number, coverCharge: number, taxRate: number = 10) => {
    const subtotal = items.reduce((sum, item) => {
      if (item.isGift || item.status === 'cancelled') return sum;
      const modTotal = item.selectedModifiers.reduce((mSum, m) => mSum + m.priceDelta, 0);
      return sum + (item.unitPrice + modTotal) * item.quantity;
    }, 0);

    const discountAmount = Math.round((subtotal * discountRate) / 100);
    const total = Math.max(0, subtotal - discountAmount + coverCharge);

    return { subtotal, discountAmount, total };
  };

  const addItemToTableOrder = (
    tableId: string,
    menuItem: MenuItem,
    modifiers: OrderItemModifierSelection[],
    specialNote?: string,
    quantity: number = 1
  ) => {
    sounds.playAddItem();

    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    let existingOrder = orders.find((o) => o.tableId === tableId && o.status === 'open');

    const newItem: OrderItem = {
      id: 'oi-' + Math.random().toString(36).substring(2, 9),
      menuItemId: menuItem.id,
      name: menuItem.name,
      unitPrice: menuItem.price,
      quantity,
      selectedModifiers: modifiers,
      specialNote,
      station: menuItem.station,
      status: 'pending',
      addedAt: new Date().toISOString(),
    };

    if (existingOrder) {
      const updatedItems = [...existingOrder.items, newItem];
      const { subtotal, discountAmount, total } = calculateOrderTotals(
        updatedItems,
        existingOrder.discountRate,
        existingOrder.coverCharge,
        existingOrder.taxRate
      );

      const updatedOrder: Order = {
        ...existingOrder,
        items: updatedItems,
        subtotal,
        discountAmount,
        total,
        remainingAmount: total - existingOrder.paidAmount,
      };

      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    } else {
      // Create new order
      const coverCharge = (table.capacity || 2) * 80;
      const { subtotal, discountAmount, total } = calculateOrderTotals([newItem], 0, coverCharge);

      const newOrder: Order = {
        id: 'ord-' + Math.random().toString(36).substring(2, 9),
        tableId,
        tableNumber: table.tableNumber,
        section: table.section,
        waiterId: currentStaff.id,
        waiterName: currentStaff.name,
        guestCount: table.guestCount || table.capacity,
        items: [newItem],
        subtotal,
        discountRate: 0,
        discountAmount,
        coverCharge,
        taxRate: 10,
        total,
        paidAmount: 0,
        remainingAmount: total,
        payments: [],
        status: 'open',
        createdAt: new Date().toISOString(),
      };

      setOrders((prev) => [...prev, newOrder]);

      // Update table status to occupied
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? {
                ...t,
                status: 'occupied',
                currentOrderId: newOrder.id,
                seatedAt: t.seatedAt || new Date().toISOString(),
                guestCount: newOrder.guestCount,
                waiterName: currentStaff.name,
              }
            : t
        )
      );
    }
  };

  const updateItemQuantity = (orderId: string, itemId: string, delta: number) => {
    sounds.playTap();
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const updatedItems = order.items
          .map((item) => {
            if (item.id === itemId) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as OrderItem[];

        const { subtotal, discountAmount, total } = calculateOrderTotals(
          updatedItems,
          order.discountRate,
          order.coverCharge,
          order.taxRate
        );

        return {
          ...order,
          items: updatedItems,
          subtotal,
          discountAmount,
          total,
          remainingAmount: Math.max(0, total - order.paidAmount),
        };
      })
    );
  };

  const removeItemFromOrder = (orderId: string, itemId: string) => {
    sounds.playTap();
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.filter((item) => item.id !== itemId);
        const { subtotal, discountAmount, total } = calculateOrderTotals(
          updatedItems,
          order.discountRate,
          order.coverCharge,
          order.taxRate
        );
        return {
          ...order,
          items: updatedItems,
          subtotal,
          discountAmount,
          total,
          remainingAmount: Math.max(0, total - order.paidAmount),
        };
      })
    );
  };

  const toggleItemGift = (orderId: string, itemId: string) => {
    sounds.playTap();
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map((item) =>
          item.id === itemId ? { ...item, isGift: !item.isGift } : item
        );
        const { subtotal, discountAmount, total } = calculateOrderTotals(
          updatedItems,
          order.discountRate,
          order.coverCharge,
          order.taxRate
        );
        return {
          ...order,
          items: updatedItems,
          subtotal,
          discountAmount,
          total,
          remainingAmount: Math.max(0, total - order.paidAmount),
        };
      })
    );
  };

  const applyDiscount = (orderId: string, rate: number) => {
    sounds.playTap();
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const { subtotal, discountAmount, total } = calculateOrderTotals(
          order.items,
          rate,
          order.coverCharge,
          order.taxRate
        );
        return {
          ...order,
          discountRate: rate,
          subtotal,
          discountAmount,
          total,
          remainingAmount: Math.max(0, total - order.paidAmount),
        };
      })
    );
  };

  const sendOrderToKitchen = (orderId: string) => {
    sounds.playOrderSent();
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map((item) =>
          item.status === 'pending' ? { ...item, status: 'preparing' as const } : item
        );
        return { ...order, items: updatedItems };
      })
    );
  };

  const updateKdsItemStatus = (
    orderId: string,
    itemId: string,
    status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'
  ) => {
    sounds.playTap();
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          items: order.items.map((item) => (item.id === itemId ? { ...item, status } : item)),
        };
      })
    );
  };

  const requestTableBill = (tableId: string) => {
    sounds.playTap();
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, status: 'bill_requested' as TableStatus } : t))
    );
  };

  // Recipe-based inventory deduction
  const deductInventoryFromOrder = (order: Order) => {
    setInventory((prevInv) => {
      const invCopy = [...prevInv];
      order.items.forEach((item) => {
        if (item.status === 'cancelled') return;
        const recipe = recipes.find((r) => r.menuItemId === item.menuItemId);
        if (recipe) {
          recipe.ingredients.forEach((ing) => {
            const invIndex = invCopy.findIndex((i) => i.id === ing.inventoryItemId);
            if (invIndex !== -1) {
              const deductAmount = ing.amount * item.quantity;
              invCopy[invIndex] = {
                ...invCopy[invIndex],
                currentStock: Math.max(0, Number((invCopy[invIndex].currentStock - deductAmount).toFixed(3))),
                lastUpdated: new Date().toISOString(),
              };
            }
          });
        }
      });
      return invCopy;
    });
  };

  const processPayment = (
    orderId: string,
    method: PaymentMethod,
    amount: number,
    tipAmount: number = 0,
    note?: string
  ): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    const newPayment: PaymentRecord = {
      id: 'pay-' + Math.random().toString(36).substring(2, 9),
      amount,
      method,
      tipAmount,
      timestamp: new Date().toISOString(),
      note,
    };

    const newPaidAmount = order.paidAmount + amount;
    const newRemainingAmount = Math.max(0, order.total - newPaidAmount);
    const isFullyPaid = newRemainingAmount <= 0;

    const updatedOrder: Order = {
      ...order,
      paidAmount: newPaidAmount,
      remainingAmount: newRemainingAmount,
      payments: [...order.payments, newPayment],
      status: isFullyPaid ? 'paid' : 'open',
      closedAt: isFullyPaid ? new Date().toISOString() : undefined,
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));

    if (isFullyPaid) {
      sounds.playPaymentSuccess();
      deductInventoryFromOrder(updatedOrder);

      // Free table
      setTables((prev) =>
        prev.map((t) =>
          t.id === order.tableId
            ? {
                ...t,
                status: 'cleaning',
                currentOrderId: undefined,
                seatedAt: undefined,
                guestCount: undefined,
              }
            : t
        )
      );

      // Auto trigger receipt modal
      setActiveReceiptOrder(updatedOrder);
      setIsReceiptModalOpen(true);
    } else {
      sounds.playTap();
    }

    return true;
  };

  const transferTable = (fromTableId: string, toTableId: string) => {
    sounds.playTap();
    const fromTable = tables.find((t) => t.id === fromTableId);
    const toTable = tables.find((t) => t.id === toTableId);
    if (!fromTable || !toTable) return;

    const order = orders.find((o) => o.tableId === fromTableId && o.status === 'open');

    setTables((prev) =>
      prev.map((t) => {
        if (t.id === fromTableId) {
          return {
            ...t,
            status: 'empty',
            currentOrderId: undefined,
            seatedAt: undefined,
            guestCount: undefined,
            waiterName: undefined,
          };
        }
        if (t.id === toTableId) {
          return {
            ...t,
            status: fromTable.status,
            currentOrderId: order?.id,
            seatedAt: fromTable.seatedAt,
            guestCount: fromTable.guestCount,
            waiterName: fromTable.waiterName,
          };
        }
        return t;
      })
    );

    if (order) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, tableId: toTableId, tableNumber: toTable.tableNumber, section: toTable.section } : o
        )
      );
    }
  };

  const clearTable = (tableId: string) => {
    sounds.playTap();
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'empty',
              currentOrderId: undefined,
              seatedAt: undefined,
              guestCount: undefined,
              waiterName: undefined,
            }
          : t
      )
    );
  };

  const updateInventoryStock = (itemId: string, newStock: number) => {
    setInventory((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, currentStock: newStock, lastUpdated: new Date().toISOString() } : i))
    );
  };

  const generateNewZReport = (): ZReport => {
    sounds.playPrintReceipt();
    const paidOrders = orders.filter((o) => o.status === 'paid');

    let cashTotal = 0;
    let creditCardTotal = 0;
    let mealVoucherTotal = 0;
    let discountTotal = 0;
    let totalVat = 0;
    let grandTotal = 0;
    let totalGuestsCount = 0;

    paidOrders.forEach((o) => {
      discountTotal += o.discountAmount;
      grandTotal += o.total;
      totalGuestsCount += o.guestCount;
      totalVat += Math.round(o.total * 0.1);

      o.payments.forEach((p) => {
        if (p.method === 'cash') cashTotal += p.amount;
        else if (p.method === 'credit_card') creditCardTotal += p.amount;
        else if (p.method === 'meal_voucher') mealVoucherTotal += p.amount;
      });
    });

    const newReport: ZReport = {
      id: 'z-' + Date.now(),
      reportNumber: 'Z-' + String(zReports.length + 843).padStart(5, '0'),
      openedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      closedAt: new Date().toISOString(),
      cashTotal: cashTotal || 19200,
      creditCardTotal: creditCardTotal || 48500,
      mealVoucherTotal: mealVoucherTotal || 7500,
      discountTotal: discountTotal || 3600,
      totalVat: totalVat || 6800,
      grandTotal: grandTotal || 75200,
      totalOrdersCount: paidOrders.length || 45,
      totalGuestsCount: totalGuestsCount || 124,
      categorySales: INITIAL_Z_REPORT.categorySales,
      waiterSales: INITIAL_Z_REPORT.waiterSales,
    };

    setZReports((prev) => [newReport, ...prev]);
    return newReport;
  };

  return (
    <POSContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentSection,
        setCurrentSection,
        viewMode,
        setViewMode,
        selectedTableId,
        setSelectedTableId,
        currentStaff,
        setCurrentStaff,
        tables,
        orders,
        categories,
        menuItems,
        inventory,
        recipes,
        zReports,
        isPinModalOpen,
        setIsPinModalOpen,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        activeReceiptOrder,
        setActiveReceiptOrder,
        isTableTransferModalOpen,
        setIsTableTransferModalOpen,
        selectTableAndOpenPOS,
        getOrderByTableId,
        addItemToTableOrder,
        updateItemQuantity,
        removeItemFromOrder,
        toggleItemGift,
        applyDiscount,
        sendOrderToKitchen,
        updateKdsItemStatus,
        requestTableBill,
        processPayment,
        transferTable,
        clearTable,
        updateInventoryStock,
        generateNewZReport,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}
