/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { formatCurrency } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const DashboardOverview: React.FC = () => {
  const restaurantContext = useRestaurant();
  const { sales = [], inventory = [], orders = [], tables = [], menu = [] } = restaurantContext;


  // Compute operational statistics
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaySales = useMemo(() => {
    return sales.filter(s => new Date(s.timestamp) >= todayStart);
  }, [sales]);

  const totalRevenue = useMemo(() => todaySales.reduce((sum, s) => sum + s.totalAmount, 0), [todaySales]);
  const avgTicket = useMemo(() => todaySales.length > 0 ? totalRevenue / todaySales.length : 0, [todaySales, totalRevenue]);
  
  // Active tables (status !== 'available')
  const busyTablesCount = useMemo(() => tables.filter(t => t.status !== 'available').length, [tables]);
  
  // Active orders (status !== 'closed') ignoring beverages
  const nonBeverageMenuIds = useMemo(() => {
    const set = new Set<string>();
    menu.forEach(m => {
      if (m.category !== 'Beverages') set.add(m.id);
    });
    return set;
  }, [menu]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter(o => o.status !== 'closed').filter(o => {
      return o.items.some(item => nonBeverageMenuIds.has(item.menuItemId));
    }).length;
  }, [orders, nonBeverageMenuIds]);
  
  // Ingredients below critical level
  const lowStockCount = inventory.filter(ing => ing.quantity <= ing.minQuantity).length;

  // Recent transactions (last 5)
  const recentSales = useMemo(() => {
    return [...sales]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [sales]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2 font-sans text-white animate-fade-in">
      
      {/* Refined Color Palette Header */}
      <div className="border-b border-white/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          
          <h1 className="text-2xl font-extrabold tracking-tight text-white mt-1 flex items-center gap-2">
            <span className="w-3 h-3 bg-white rounded-full"></span>
            Painel de Controle Operacional
          </h1>
          
        </div>
      </div>

      {/* Grid of Rigid Geometric Cards with Refined Colors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-[#14293a] border border-white/10 overflow-hidden rounded-2xl shadow-sm">
        <div className="bg-[#0c1622] p-6">
          <span className="block text-[9px] font-mono font-bold text-white uppercase tracking-widest">FATURAMENTO TOTAL</span>
          <span className="block text-2xl font-bold font-mono text-white tracking-tight mt-1.5">
            {formatCurrency(totalRevenue)}
          </span>
          <span className="block text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-wide font-medium">HOJE</span>
        </div>

        <div className="bg-[#0c1622] p-6">
          <span className="block text-[9px] font-mono font-bold text-white uppercase tracking-widest">TICKET MÉDIO</span>
          <span className="block text-2xl font-bold font-mono text-white tracking-tight mt-1.5">
            {formatCurrency(avgTicket)}
          </span>
          <span className="block text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-wide font-medium">POR PEDIDO FECHADO</span>
        </div>

        <div className="bg-[#0c1622] p-6">
          <span className="block text-[9px] font-mono font-bold text-white uppercase tracking-widest">PEDIDOS ATIVOS</span>
          <span className="block text-2xl font-bold font-mono text-white tracking-tight mt-1.5">
            {activeOrdersCount}
          </span>
          <span className="block text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-wide font-medium">NA FILA DE PRODUÇÃO</span>
        </div>

        <div className="bg-[#0c1622] p-6">
          <span className="block text-[9px] font-mono font-bold text-white uppercase tracking-widest">ALERTAS DE ESTOQUE</span>
          <span className={`block text-2xl font-bold font-mono tracking-tight mt-1.5 ${
            lowStockCount > 0 ? 'text-rose-400 font-extrabold underline decoration-rose-300 decoration-2 underline-offset-4' : 'text-slate-300'
          }`}>
            {lowStockCount}
          </span>
          <span className="block text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-wide font-medium">INSUMOS CRÍTICOS</span>
        </div>
      </div>

      {/* Geometric Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Transactions & Active Tables */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Tables Overview */}
          <div className="bg-[#0c1622] border border-white/10 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-baseline border-b border-white/10 pb-3">
              <div>
                <span className="text-[9px] font-mono font-bold text-white uppercase tracking-widest block">OCUPAÇÃO GERAL</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">Status das Mesas no Salão</h3>
              </div>
              <span className="text-[10px] font-mono text-white font-bold uppercase tracking-wide bg-white/10 px-2 py-0.5 rounded">
                {busyTablesCount} de {tables.length} ocupadas
              </span>
            </div>

            {/* Geometric Grid of Small Table Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-1">
              {tables.map(table => {
                const isBusy = table.status !== 'available';
                return (
                  <div 
                    key={table.number}
                    className={`
                      border p-3.5 rounded-2xl text-center font-mono transition-all duration-200
                      ${isBusy 
                        ? 'bg-[#070b14] border-amber-400 text-white shadow-[0_0_10px_rgba(251,191,36,0.15)]' 
                        : 'bg-[#0c1622] border-white/10 text-slate-400'
                      }
                    `}
                  >
                    <span className="block text-[8px] uppercase tracking-wider opacity-60 font-bold">MESA</span>
                    <span className="block text-lg font-black tracking-tight my-0.5">{table.number.toString().padStart(2, '0')}</span>
                    <span className={`inline-block text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                      isBusy ? 'bg-amber-900/40 border border-amber-200 text-amber-400' : 'bg-white/5 text-slate-400'
                    }`}>
                      {isBusy ? 'OCUPADA' : 'LIVRE'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Closed bills Table */}
          <div className="bg-[#0c1622] border border-white/10 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="border-b border-white/10 pb-3 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono font-bold text-white uppercase tracking-widest block">FLUXO DE CAIXA</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-0.5">Últimas Transações Fechadas</h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 font-mono text-[9px] font-bold uppercase tracking-wider">
                    <th className="pb-3">IDENTIFICADOR</th>
                    <th className="pb-3 text-center">MESA</th>
                    <th className="pb-3">MÉTODO PAGAMENTO</th>
                    <th className="pb-3 text-right">VALOR TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-[11px] text-slate-400">
                  {recentSales.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-500 italic">
                        Nenhuma transação fechada nesta sessão.
                      </td>
                    </tr>
                  ) : (
                    recentSales.map(sale => (
                      <tr key={sale.id} className="hover:bg-[#070b14]/50 transition-all">
                        <td className="py-3 font-mono text-white font-bold">
                          #{sale.id.split('-')[1]?.substring(0, 8).toUpperCase() || '0000'}
                        </td>
                        <td className="py-3 text-center font-mono font-semibold text-white">
                          Mesa {sale.tableNumber.toString().padStart(2, '0')}
                        </td>
                        <td className="py-3 font-mono uppercase tracking-wider text-[10px] text-white font-bold">
                          {sale.paymentMethod === 'card' ? 'CARTÃO' : sale.paymentMethod.toUpperCase()}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-white">
                          {formatCurrency(sale.totalAmount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Platform Status & Diagnostic Monitor */}
        <div className="lg:col-span-4 space-y-6">
          
          

          {/* Quick Inventory Alert List */}
          <div className="bg-[#0c1622] border border-white/10 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="border-b border-white/10 pb-3">
              <span className="text-[9px] font-mono font-bold text-white uppercase tracking-widest block">ALERTA FÍSICO</span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mt-0.5">Insumos Críticos</h3>
            </div>

            <div className="space-y-2">
              {inventory.filter(ing => ing.quantity <= ing.minQuantity).length === 0 ? (
                <div className="py-4 text-center text-slate-500 italic text-[11px]">
                  Todos os insumos com estoque adequado.
                </div>
              ) : (
                inventory
                  .filter(ing => ing.quantity <= ing.minQuantity)
                  .slice(0, 4)
                  .map(ing => (
                    <div key={ing.id} className="flex justify-between items-center p-3 bg-rose-950/30/30 border border-rose-100 rounded-xl text-xs">
                      <div>
                        <span className="block font-bold text-white uppercase text-[10px] tracking-tight">{ing.name}</span>
                        <span className="block text-[9px] text-slate-500 font-mono">MÍNIMO: {ing.minQuantity} {ing.unit}</span>
                      </div>
                      <span className="font-mono font-bold text-rose-400 bg-rose-900/40 border border-rose-200 px-2.5 py-0.5 rounded text-[10px]">
                        {ing.quantity} {ing.unit}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Audit compliance notice */}
      <div className="text-center py-4 border-t border-white/10">
        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest leading-relaxed">
          SISTEMA DE AUDITORIA INTERNA MM SYSTEMS &middot; LOGS DE SISTEMA INTEGROS E REGISTRADOS
        </p>
      </div>

    </div>
  );
};
