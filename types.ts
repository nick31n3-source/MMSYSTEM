/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'manager' | 'waiter' | 'cook' | 'superuser';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  cpf?: string;
  phone?: string;
  email?: string;
  permissions?: string[]; // e.g. ['dashboard', 'menu', 'inventory', 'waiter', 'kitchen', 'billing', 'employees']
  tenantId?: string;
}

export const DEFAULT_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['dashboard', 'reports', 'menu', 'inventory', 'supplies', 'waiter', 'kitchen', 'billing', 'employees', 'audit', 'settings'],
  manager: ['dashboard', 'reports', 'menu', 'inventory', 'supplies', 'waiter', 'kitchen', 'billing', 'employees', 'audit'],
  waiter: ['waiter', 'menu', 'billing'],
  cook: ['kitchen', 'inventory', 'supplies'],
  superuser: ['master_dashboard', 'dashboard', 'reports', 'menu', 'inventory', 'supplies', 'waiter', 'kitchen', 'billing', 'employees', 'audit', 'settings']
};

export const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number; // For low stock alerts
  unit: string;
  costPrice: number; // Cost to buy this unit
}

export interface RecipeIngredient {
  ingredientId: string;
  quantityNeeded: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Appetizers' | 'Mains' | 'Desserts' | 'Beverages';
  image: string;
  ingredients: RecipeIngredient[];
  isActive: boolean;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'closed';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: 'cash' | 'card' | 'pix' | 'digital';
  notes?: string;
}

export interface SalesRecord {
  id: string;
  orderId: string;
  tableNumber: number;
  itemsCount: number;
  totalAmount: number;
  costAmount: number; // Sum of ingredient costs
  profitAmount: number; // total - cost
  paymentMethod: 'cash' | 'card' | 'pix' | 'digital';
  timestamp: string; // ISO String
}

export interface Table {
  number: number;
  status: 'available' | 'occupied' | 'waiting_payment';
  currentOrderId?: string;
}

export interface ClientInstance {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  subscriptionTier: 'trial' | 'standard' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'suspended' | 'expired';
  subscriptionCost: number;
  nextBillingDate: string;
  activeOrdersCount: number;
  monthlyRevenue: number;
  databaseSizeMB: number;
  createdAt: string;
  dbHost: string;
  adminUsername?: string;
  adminPassword?: string;
}


export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  ipAddress: string;
  details: string;
  tenantId?: string;
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; accentBg: string; accentText: string; accentBorder: string }> = {
  All: {
    bg: 'bg-white/5',
    text: 'text-slate-300',
    border: 'border-white/10',
    accentBg: 'bg-white/10',
    accentText: 'text-white',
    accentBorder: 'border-white/20'
  },
  Mains: {
    bg: 'bg-[#0c1622]',
    text: 'text-slate-300',
    border: 'border-white/10',
    accentBg: 'bg-white/10',
    accentText: 'text-white',
    accentBorder: 'border-white/20'
  },
  Appetizers: {
    bg: 'bg-[#0c1622]',
    text: 'text-slate-300',
    border: 'border-white/10',
    accentBg: 'bg-white/10',
    accentText: 'text-white',
    accentBorder: 'border-white/20'
  },
  Desserts: {
    bg: 'bg-[#0c1622]',
    text: 'text-slate-300',
    border: 'border-white/10',
    accentBg: 'bg-white/10',
    accentText: 'text-white',
    accentBorder: 'border-white/20'
  },
  Beverages: {
    bg: 'bg-[#0c1622]',
    text: 'text-slate-300',
    border: 'border-white/10',
    accentBg: 'bg-white/10',
    accentText: 'text-white',
    accentBorder: 'border-white/20'
  }
};


export interface Supplier {
  id: string;
  name: string;
  category: string;
  contactName: string;
  phone: string;
  email: string;
  tenantId?: string;
}

export interface SupplyOrder {
  id: string;
  supplierName: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  status: 'Pendente' | 'Recebido';
  createdAt: string;
  tenantId?: string;
}

export interface TenantSettings {
  id: string; // The tenantId (e.g. 'global' or client id)
  restaurantName: string;
  cnpj?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  logoUrl?: string;
  themeColor?: string;
  receiptMessage?: string;
}
