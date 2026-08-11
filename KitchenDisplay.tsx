/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { OrderStatus } from '../types';

export const KitchenDisplay: React.FC = () => {
  const { orders, updateOrderStatus, menu } = useRestaurant();
  const [timeState, setTimeState] = useState(new Date());

  // Keep a ticking clock to update "Minutes ago" timestamps in real-time
  useEffect(() => {
    const timer = setInterval(() => setTimeState(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Filter orders that are relevant to the kitchen (all except served or closed)
  const kitchenOrders = useMemo(() => {
    return orders
      .filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready')
      .map(order => {
        const filteredItems = order.items.filter(item => {
          const menuItem = menu.find(m => m.id === item.menuItemId);
          return menuItem && menuItem.category !== 'Beverages';
        });
        return { ...order, items: filteredItems };
      })
      .filter(order => order.items.length > 0);
  }, [orders, menu]);

  // Group kitchen orders: first pending, then preparing, then ready
  const sortedOrders = kitchenOrders.slice().sort((a, b) => {
    const statusWeight = { pending: 1, preparing: 2, ready: 3 };
    const weightA = statusWeight[a.status] || 9;
    const weightB = statusWeight[b.status] || 9;
    
    if (weightA !== weightB) {
      return weightA - weightB; // Pending first
    }
    // Then oldest first
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Calculate elapsed time in minutes
  const getElapsedTime = (isoString: string) => {
    const orderTime = new Date(isoString);
    const diffMs = timeState.getTime() - orderTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins > 0 ? `${diffMins} min atras` : 'Agora mesmo';
  };

  // Get color coding based on wait times
  const getWaitTimeColor = (isoString: string, status: string) => {
    if (status === 'ready') return 'text-slate-300 font-bold';
    const orderTime = new Date(isoString);
    const diffMins = Math.floor((timeState.getTime() - orderTime.getTime()) / 60000);
    if (diffMins >= 15) return 'text-rose-750 font-extrabold underline';
    if (diffMins >= 8) return 'text-amber-400 font-bold';
    return 'text-slate-400';
  };

  // BATCH PREP SUMMARY: Sum up all items that need cooking (pending & preparing status only)
  const batchSummary: Record<string, { quantity: number; category: string }> = {};
  
  orders.filter(o => o.status === 'pending' || o.status === 'preparing').forEach(o => {
    o.items.forEach(item => {
      if (!batchSummary[item.name]) {
        batchSummary[item.name] = { quantity: 0, category: '' };
      }
      batchSummary[item.name].quantity += item.quantity;
    });
  });

  const hasBatchItems = Object.keys(batchSummary).length > 0;

  // Status badge translator
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'PENDENTE';
      case 'preparing': return 'EM PREPARO';
      case 'ready': return 'PRONTO';
      default: return status.toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white">
            Painel de Preparo (KDS)
          </h2>
          
        </div>
        
        {/* KPI indicators */}
        <div className="flex gap-3">
          <div className="bg-[#0c1622] border border-white/10 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="block text-[9px] text-slate-500 uppercase font-bold">Novos / Fila</span>
            <span className="text-base font-extrabold text-white font-mono">
              {kitchenOrders.filter(o => o.status === 'pending').length}
            </span>
          </div>
          <div className="bg-[#0c1622] border border-white/10 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="block text-[9px] text-slate-500 uppercase font-bold">No Fogao</span>
            <span className="text-base font-extrabold text-white font-mono">
              {kitchenOrders.filter(o => o.status === 'preparing').length}
            </span>
          </div>
          <div className="bg-[#0c1622] border border-white/10 px-4 py-2 rounded-xl text-center shadow-sm">
            <span className="block text-[9px] text-slate-500 uppercase font-bold">Prontos</span>
            <span className="text-base font-extrabold text-white font-mono">
              {kitchenOrders.filter(o => o.status === 'ready').length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Active Preparation Tickets */}
        <div className="xl:col-span-3 space-y-4">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            Comandas na Cozinha ({sortedOrders.length})
          </span>

          {sortedOrders.length === 0 ? (
            <div className="py-20 text-center border border-white/10 rounded-3xl bg-[#070b14]/50 space-y-3">
              <div className="max-w-xs mx-auto">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Nenhum Pedido na Fila</h4>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Nao ha comandas ativas na cozinha neste momento. Novos pedidos lancados pelos garcons aparecem aqui automaticamente.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              {sortedOrders.map((order) => {
                let statusBg = 'bg-[#0c1622] border-white/10';
                let btnLabel = 'INICIAR PREPARO';
                let targetStatus: OrderStatus = 'preparing';
                let statusBadge = 'bg-[#091018] border-white/20 text-slate-300';

                if (order.status === 'preparing') {
                  statusBg = 'bg-[#0c1622] border-[#14293a] ring-1 ring-neutral-900/10';
                  btnLabel = 'PRONTO PARA RETIRADA';
                  targetStatus = 'ready';
                  statusBadge = 'bg-[#040810] border-[#14293a] text-white';
                } else if (order.status === 'ready') {
                  statusBg = 'bg-[#0c1622] border-white/10 opacity-80';
                  btnLabel = 'FINALIZADO';
                  targetStatus = 'served';
                  statusBadge = 'bg-white/5 border-white/20 text-slate-300';
                }

                return (
                  <div 
                    key={order.id} 
                    className={`border rounded-3xl overflow-hidden shadow-sm transition-all flex flex-col justify-between ${statusBg}`}
                  >
                    {/* Card Header */}
                    <div className="p-4 border-b border-white/5 bg-[#070b14]/30 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-white">Mesa {order.tableNumber.toString().padStart(2, '0')}</span>
                          <span className={`text-[8px] font-mono font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${statusBadge}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold block mt-1 uppercase tracking-wider">
                          Ref: #{order.id.split('-')[1]?.slice(-4).toUpperCase() || 'N/A'} &middot; Garcom: {order.waiterName.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-mono">
                        <span className={getWaitTimeColor(order.createdAt, order.status)}>
                          [{getElapsedTime(order.createdAt).toUpperCase()}]
                        </span>
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="p-4 flex-1 space-y-3">
                      <div className="divide-y divide-neutral-100">
                        {order.items.map((item) => (
                          <div key={item.id} className="py-2 flex justify-between items-start gap-3 first:pt-0 last:pb-0">
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="font-extrabold text-white font-mono text-xs">x{item.quantity}</span>
                                <span className="font-bold text-xs text-slate-200">{item.name}</span>
                              </div>
                              {item.notes && (
                                <p className="text-[10px] text-slate-400 bg-[#070b14] px-2.5 py-1 rounded-lg border border-white/10 mt-1.5 inline-block font-mono font-bold">
                                  OBS: "{item.notes.toUpperCase()}"
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="mt-3 p-2 bg-rose-950/30 border border-rose-100 rounded-xl text-[10px] text-rose-800 font-bold font-mono">
                          <span className="font-extrabold block uppercase text-rose-400 tracking-wider text-[8px] mb-0.5">OBSERVACOES GERAIS</span>
                          "{order.notes.toUpperCase()}"
                        </div>
                      )}
                    </div>

                    {/* Card Footer action bar */}
                    <div className="p-4 bg-[#070b14]/20 border-t border-white/5 flex gap-2">
                      {order.status !== 'ready' ? (
                        <button
                          onClick={() => updateOrderStatus(order.id, targetStatus)}
                          className={`
                            w-full py-2.5 rounded-xl text-xs font-bold text-center cursor-pointer transition-all active:scale-95
                            ${order.status === 'pending' 
                              ? 'bg-white text-black hover:bg-slate-200 shadow-sm' 
                              : 'bg-[#040810] text-white hover:bg-white shadow-sm'
                            }
                          `}
                        >
                          {btnLabel}
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-between text-[11px] text-slate-300 bg-white/5 border border-white/20 p-2.5 rounded-xl font-bold font-mono">
                          <span className="flex items-center gap-1.5 uppercase font-extrabold">
                            [AGUARDANDO RETIRADA]
                          </span>
                          
                          <button
                            onClick={() => updateOrderStatus(order.id, 'served')}
                            className="bg-[#0c1622] border border-white/10 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg text-[9px] font-bold cursor-pointer shadow-sm uppercase"
                          >
                            ENTREGUE
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Batch Prep Summary Side (Aggregated ingredients list) */}
        <div className="bg-[#0c1622] border border-white/10 rounded-3xl p-5 h-fit space-y-4 shadow-sm">
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
              Quadro de Preparo (Lote)
            </span>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-sans">
              Resumo total acumulado de todas as comandas na fila. Ajuda o chef a otimizar a grelha e a chapa.
            </p>
          </div>

          {!hasBatchItems ? (
            <p className="text-[10px] text-slate-500 font-bold uppercase text-center py-8 border border-dashed border-white/10 rounded-xl bg-[#070b14]/30 font-mono">
              [AGUARDANDO PEDIDOS]
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {Object.entries(batchSummary).map(([dishName, detail]) => (
                <div key={dishName} className="bg-[#070b14] border border-white/10 p-2.5 rounded-xl flex justify-between items-center font-mono">
                  <span className="text-xs font-bold text-slate-200 truncate pr-2 uppercase">{dishName}</span>
                  <span className="text-xs font-extrabold bg-[#040810] text-white px-2 py-0.5 rounded-lg shrink-0">
                    x{detail.quantity}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-[#070b14] p-3.5 border border-white/10 rounded-xl space-y-1.5 text-[10px] text-slate-400 font-semibold font-mono">
            <span className="font-extrabold text-[9px] uppercase tracking-wider text-slate-500 block">RECOMENDACAO DE ALERTA:</span>
            Pedidos com mais de <span className="text-amber-400 font-bold">[8 MIN]</span> ficam em amarelo; com mais de <span className="text-rose-750 font-bold underline">[15 MIN]</span> sao marcados com alerta critico.
          </div>
        </div>
      </div>
    </div>
  );
};
