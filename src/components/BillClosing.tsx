/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { formatCurrency, Order } from '../types';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';

export const BillClosing: React.FC = () => {
  const { tenantSettings, tables, orders, closeBill } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastClosedOrder, setLastClosedOrder] = useState<Order | null>(null);

  const occupiedTables = tables.filter(t => t.status === 'occupied' && t.currentOrderId);
  const closedOrders = orders.filter(o => o.status === 'closed').sort(
    (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  );

  // Selected table helper
  const currentTable = tables.find(t => t.number === selectedTable);
  const currentOrder = orders.find(o => o.id === currentTable?.currentOrderId);

  // Client-side Thermal Style Receipt PDF generator using jsPDF
  const handleGenerateReceiptPDF = (order: Order) => {
    try {
      // Create a 80mm wide POS invoice receipt layout (custom height depending on item count)
      const itemCount = order.items.length;
      const pdfHeight = 100 + (itemCount * 6);
      const doc = new jsPDF({
        unit: 'mm',
        format: [80, Math.max(140, pdfHeight)]
      });

      // Receipt Header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(tenantSettings.restaurantName, 40, 10, { align: 'center' });
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('CONTA INTEGRADA DE CLIENTE', 40, 14, { align: 'center' });
      doc.text('------------------------------------------------', 40, 18, { align: 'center' });

      // Meta attributes
      doc.text(`CUPOM ID: #${order.id.split('-')[1]?.substring(0, 8).toUpperCase() || '0000'}`, 5, 23);
      doc.text(`DATA: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, 5, 27);
      doc.text(`MESA ATENDIDA: MESA ${order.tableNumber.toString().padStart(2, '0')}`, 5, 31);
      doc.text(`ATENDENTE: ${order.waiterName.toUpperCase()}`, 5, 35);
      doc.text(`PAGAMENTO: CARD/CARTÃO (DÉBITO/CRÉDITO)`, 5, 39);
      doc.text('------------------------------------------------', 40, 43, { align: 'center' });

      // Table columns
      doc.setFont('Helvetica', 'bold');
      doc.text('Item / Descricao', 5, 47);
      doc.text('Subtotal', 75, 47, { align: 'right' });
      doc.setFont('Helvetica', 'normal');
      
      let y = 51;
      order.items.forEach((item) => {
        const displayName = item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name;
        doc.text(`${displayName} x${item.quantity}`, 5, y);
        doc.text(formatCurrency(item.price * item.quantity), 75, y, { align: 'right' });
        y += 5;
      });

      doc.text('------------------------------------------------', 40, y, { align: 'center' });
      y += 4;

      // Pricing math
      doc.text('Subtotal Consumido:', 5, y);
      doc.text(formatCurrency(order.totalAmount), 75, y, { align: 'right' });
      y += 4;

      doc.text('Taxa de Servico (8%):', 5, y);
      doc.text(formatCurrency(order.totalAmount * 0.08), 75, y, { align: 'right' });
      y += 5;

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('VALOR TOTAL GERAL:', 5, y);
      doc.text(formatCurrency(order.totalAmount * 1.08), 75, y, { align: 'right' });
      y += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`--- ${tenantSettings.receiptMessage || tenantSettings.restaurantName + " AGRADECE A PREFERÊNCIA"} ---`, 40, y, { align: 'center' });

      // Save file local
      doc.save(`recibo-mesa-${order.tableNumber}-${order.id.split('-')[1]?.substring(0, 6)}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setErrorMsg('Erro ao gerar o PDF do recibo. Por favor, tente novamente.');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  const handleCloseTableBill = () => {
    if (!selectedTable || !currentOrder) return;

    // Cache order to let them generate PDF immediately in the success banner
    const orderToSave = { ...currentOrder };
    setLastClosedOrder(orderToSave);

    const finalAmountWithService = currentOrder.totalAmount * 1.08;

    // Trigger context billing close (defaulting silently to card payment behind the scenes)
    closeBill(currentOrder.id, 'card', finalAmountWithService);
    
    setSuccessMsg(`A comanda da Mesa ${selectedTable} foi encerrada com sucesso! Mesa liberada.`);
    setSelectedTable(null);
    
    setTimeout(() => {
      setSuccessMsg('');
    }, 8000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 pb-5">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-white rounded-full inline-block"></span>
            Fechamento de Conta & Caixa
          </h2>
          
        </div>
      </div>

      {/* Success Notification with direct PDF download option */}
      {successMsg && (
        <div className="bg-white/5 border border-white/20 text-slate-300 p-4 rounded-2xl text-xs font-bold animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div>
            <span className="uppercase tracking-wider block font-mono text-[9px] text-slate-300 mb-0.5">✓ TRANSACÃO PROCESSADA</span>
            {successMsg}
          </div>
          {lastClosedOrder && (
            <button
              onClick={() => handleGenerateReceiptPDF(lastClosedOrder)}
              className="bg-white hover:bg-slate-200 text-black font-extrabold px-3 py-1.5 rounded-xl uppercase tracking-wider text-[10px] cursor-pointer transition-all shrink-0 shadow-sm"
            >
              Baixar Recibo PDF
            </button>
          )}
        </div>
      )}
      
      {errorMsg && (
        <div className="bg-red-950/30 border border-red-200 text-red-800 p-4 rounded-2xl text-xs font-bold shadow-sm">
          {errorMsg}
        </div>
      )}

      {occupiedTables.length === 0 ? (
        <div className="py-14 text-center border border-white/20 rounded-3xl bg-white/20 space-y-3">
          <div className="max-w-xs mx-auto">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest font-mono">Contas em Aberto</h4>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed italic">
              Não há mesas ocupadas ou com comandas ativas aguardando fechamento no momento.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Select occupied table grid */}
          <div className="lg:col-span-2 space-y-4">
            <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-400 font-mono">
              Mesas Ocupadas ({occupiedTables.length})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {occupiedTables.map((table) => {
                const order = orders.find(o => o.id === table.currentOrderId);
                if (!order) return null;

                const isSelected = selectedTable === table.number;

                return (
                  <button
                    key={table.number}
                    onClick={() => { setSelectedTable(table.number); setLastClosedOrder(null); }}
                    className={`
                      rounded-3xl border p-5 flex flex-col justify-between text-left transition-all cursor-pointer relative overflow-hidden shadow-sm
                      ${isSelected 
                        ? 'bg-white/40 border-white/50 ring-2 ring-white/20' 
                        : 'bg-[#0c1622] border-white/10 hover:border-white/30'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Comanda</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-amber-950/30 text-amber-400 border border-amber-200">
                        {order.status === 'ready' ? 'PEDIDO PRONTO' : 'EM CONSUMO'}
                      </span>
                    </div>

                    <div className="my-3">
                      <span className="text-3xl font-extrabold text-white font-sans tracking-tight">
                        Mesa {table.number.toString().padStart(2, '0')}
                      </span>
                    </div>

                    <div className="w-full flex items-center justify-between text-[11px] border-t border-white/10 pt-3 text-slate-400 mt-1">
                      <div>
                        <span className="block text-[8px] text-slate-500 font-bold uppercase font-mono">Consumidos</span>
                        <span className="font-semibold text-slate-300 font-mono">{order.items.reduce((sum, item) => sum + item.quantity, 0)} un</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[8px] text-slate-500 font-bold uppercase font-mono">Subtotal</span>
                        <span className="font-mono font-bold text-white">{formatCurrency(order.totalAmount * 1.08)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settle Invoice panel (With Hiden receipt/payment methods selection) */}
          <div className="bg-[#0c1622] border border-white/10 rounded-3xl p-5 h-fit flex flex-col justify-between shadow-sm">
            {!selectedTable || !currentOrder ? (
              <div className="py-12 text-center space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">DETALHES DA CONTA</div>
                <div className="max-w-xs mx-auto">
                  <p className="text-[11px] text-slate-500 leading-relaxed italic">
                    Selecione uma mesa ativa ao lado para revisar a comanda e finalizar a conta correspondente.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-in text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h3 className="text-xs font-extrabold uppercase text-white tracking-wider">
                    Fechar Mesa {selectedTable}
                  </h3>
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="text-slate-500 hover:text-white font-mono text-xs cursor-pointer px-1"
                  >
                    [FECHAR]
                  </button>
                </div>

                {/* Simulated Paper printed invoice preview */}
                <div className="bg-[#070b14] border border-white/10 p-5 rounded-2xl font-mono text-slate-400 shadow-inner relative">
                  <div className="text-center space-y-1">
                    <h4 className="font-extrabold text-xs text-white tracking-tight">{tenantSettings.restaurantName}</h4>
                    <span className="text-[8px] text-slate-500 uppercase tracking-wider block font-bold">CONTA INTEGRADA DE CLIENTE</span>
                  </div>

                  <div className="border-t border-dashed border-white/10 my-4 pt-3 space-y-1 text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span>CUPOM ID:</span>
                      <span className="font-bold">#{currentOrder.id.split('-')[1]?.substring(0, 8).toUpperCase() || '0000'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>DATA/HORA:</span>
                      <span>{new Date(currentOrder.createdAt).toLocaleDateString()} {new Date(currentOrder.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ATENDENTE:</span>
                      <span>{currentOrder.waiterName.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Receipt Items list */}
                  <div className="border-t border-dashed border-white/10 my-4 pt-3 space-y-2">
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                      <span>Item / Descrição</span>
                      <span>Subtotal</span>
                    </div>
                    
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {currentOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-[11px] leading-tight text-slate-300">
                          <span className="truncate pr-2">
                            {item.name} <span className="text-[9px] text-white font-bold">x{item.quantity}</span>
                          </span>
                          <span className="font-bold text-slate-200">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing summaries */}
                  <div className="border-t border-dashed border-white/10 my-4 pt-3 space-y-1 text-slate-400">
                    <div className="flex justify-between text-[11px]">
                      <span>Subtotal Consumido:</span>
                      <span className="font-bold">{formatCurrency(currentOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Taxa de Serviço (8%):</span>
                      <span className="font-bold">{formatCurrency(currentOrder.totalAmount * 0.08)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-white border-t border-dashed border-white/20 pt-2 text-xs">
                      <span>VALOR TOTAL GERAL:</span>
                      <span className="text-white">{formatCurrency(currentOrder.totalAmount * 1.08)}</span>
                    </div>
                  </div>
                </div>

                {/* Settle confirm buttons - Clean of payment selection and mock prints */}
                <div className="pt-3 border-t border-white/5">
                  <button
                    onClick={handleCloseTableBill}
                    className="w-full bg-white hover:bg-slate-200 text-black font-extrabold py-3 px-4 rounded-xl text-xs text-center cursor-pointer transition-all shadow-md shadow-white/20 active:scale-95"
                  >
                    REGISTRAR RECEBIMENTO E EMITIR CONTA
                  </button>
                  <p className="text-[10px] text-slate-500 text-center mt-2 italic font-medium">
                    * Os meios de recebimento e impressão física foram automatizados e ocultados durante o fechamento para agilizar o fluxo de caixa.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECENTLY CLOSED BILLS / TRANSACTION AUDIT */}
      <div className="bg-[#0c1622] border border-white/10 rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="text-xs font-extrabold uppercase text-white tracking-wider font-mono">
            Histórico Recente de Contas Fechadas & Vias de Recibo
          </h3>
          <span className="text-[10px] text-white font-bold bg-white/10 px-2 py-0.5 rounded font-mono uppercase">
            Total Fechadas: {closedOrders.length}
          </span>
        </div>

        {closedOrders.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">Nenhuma conta finalizada nesta sessão do caixa.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-[#070b14]/50 text-white font-bold uppercase tracking-wider text-[9px] font-mono">
                  <th className="p-3">ID COMANDA</th>
                  <th className="p-3">MESA</th>
                  <th className="p-3">ATENDENTE</th>
                  <th className="p-3 text-right">VALOR TOTAL (C/ TAXA)</th>
                  <th className="p-3 text-center">FECHADO EM</th>
                  <th className="p-3 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-[11px] text-slate-400">
                {closedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#070b14]/50 transition-all">
                    <td className="p-3 font-mono font-bold text-white">
                      #{order.id.split('-')[1]?.substring(0, 8).toUpperCase() || '0000'}
                    </td>
                    <td className="p-3 font-bold text-slate-200">
                      Mesa {order.tableNumber.toString().padStart(2, '0')}
                    </td>
                    <td className="p-3">{order.waiterName.toUpperCase()}</td>
                    <td className="p-3 text-right font-bold text-white font-mono">
                      {formatCurrency(order.totalAmount * 1.08)}
                    </td>
                    <td className="p-3 text-center text-slate-500 font-mono">
                      {new Date(order.updatedAt || order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleGenerateReceiptPDF(order)}
                        className="bg-[#0c1622] hover:bg-[#070b14] border border-white/10 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer shadow-sm transition-all inline-flex items-center gap-1 hover:border-white/50"
                      >
                        🖨️ BAIXAR PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
