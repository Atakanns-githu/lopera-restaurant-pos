export type SectionId = 'ana_salon' | 'teras' | 'bahce' | 'vip' | 'bar';

export type TableStatus = 'empty' | 'occupied' | 'bill_requested' | 'reserved' | 'cleaning';

export interface TableItem {
  id: string;
  tableNumber: string;
  name: string;
  section: SectionId;
  capacity: number;
  status: TableStatus;
  posX: number;
  posY: number;
  posZ: number;
  shape: 'round' | 'rect';
  width?: number;
  height?: number;
  currentOrderId?: string;
  seatedAt?: string; // ISO date
  guestCount?: number;
  waiterName?: string;
}

export type KitchenStation = 'hot_kitchen' | 'cold_kitchen' | 'bar' | 'pastry';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface MenuItemModifier {
  id: string;
  name: string;
  priceDelta: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  station: KitchenStation;
  prepTimeMinutes: number;
  calories?: number;
  allergens?: string[];
  isAvailable: boolean;
  image?: string;
  modifiers?: {
    groupName: string;
    required: boolean;
    options: MenuItemModifier[];
  }[];
}

export interface OrderItemModifierSelection {
  groupName: string;
  name: string;
  priceDelta: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  selectedModifiers: OrderItemModifierSelection[];
  specialNote?: string;
  station: KitchenStation;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  isGift?: boolean; // İkram
  addedAt: string;
}

export type PaymentMethod = 'cash' | 'credit_card' | 'meal_voucher' | 'online';

export interface PaymentRecord {
  id: string;
  amount: number;
  method: PaymentMethod;
  tipAmount: number;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: string;
  section: SectionId;
  waiterId: string;
  waiterName: string;
  guestCount: number;
  items: OrderItem[];
  subtotal: number;
  discountRate: number; // percentage (e.g. 10 for 10%)
  discountAmount: number;
  coverCharge: number; // kuver ücreti
  taxRate: number; // e.g. 10 or 20
  total: number;
  paidAmount: number;
  remainingAmount: number;
  payments: PaymentRecord[];
  status: 'open' | 'paid' | 'cancelled';
  createdAt: string;
  closedAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: 'kg' | 'gr' | 'lt' | 'ml' | 'adet' | 'porsiyon';
  currentStock: number;
  criticalStock: number;
  costPerUnit: number;
  lastUpdated: string;
}

export interface RecipeIngredient {
  inventoryItemId: string;
  ingredientName: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  menuItemId: string;
  menuItemName: string;
  ingredients: RecipeIngredient[];
}

export interface Staff {
  id: string;
  name: string;
  pin: string;
  role: 'waiter' | 'cashier' | 'chef' | 'manager';
  avatarBg: string;
}

export interface ZReport {
  id: string;
  reportNumber: string;
  openedAt: string;
  closedAt: string;
  cashTotal: number;
  creditCardTotal: number;
  mealVoucherTotal: number;
  discountTotal: number;
  totalVat: number;
  grandTotal: number;
  totalOrdersCount: number;
  totalGuestsCount: number;
  categorySales: { categoryName: string; amount: number; count: number }[];
  waiterSales: { waiterName: string; amount: number; count: number }[];
}
