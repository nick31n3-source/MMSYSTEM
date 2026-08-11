/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Ingredient, MenuItem, Order, SalesRecord, Table } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'u-nick31',
    username: 'nick31',
    password: 'password',
    name: 'Nick User',
    role: 'admin',
    avatar: '',
    cpf: '000.000.000-00',
    phone: '(11) 99999-9999',
    email: 'nick31.N3@gmail.com',
    permissions: ['dashboard', 'reports', 'menu', 'inventory', 'supplies', 'waiter', 'kitchen', 'billing', 'employees', 'master_dashboard', 'settings', 'audit']
  }
];

export const INITIAL_INGREDIENTS: Ingredient[] = [];

export const INITIAL_MENU: MenuItem[] = [];

export const INITIAL_TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({
  number: i + 1,
  status: 'available',
}));

// Returns a completely clean sales history in a fresh, uninitialized state
export function generateMockSalesHistory(): { sales: SalesRecord[], historicalOrders: Order[] } {
  return {
    sales: [],
    historicalOrders: []
  };
}
