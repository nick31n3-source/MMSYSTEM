/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem, formatCurrency, CATEGORY_COLORS } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const WaiterDashboard: React.FC = () => {
  const { 
    tenantSettings, tables, 
    menu, 
    orders, 
    createOrder, 
    addItemsToOrder, 
    checkMenuItemStock,
    closeBill
  } = useRestaurant();

  // Active state selection
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'tables' | 'new_order' | 'add_more'>('tables');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Mains' | 'Appetizers' | 'Desserts' | 'Beverages'>('All');
  const [notes, setNotes] = useState('');

  // Cart for ordering
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartNotes, setCartNotes] = useState<Record<string, string>>({});

  // Error/Success alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Closing account integration states
  const [isClosingBill, setIsClosingBill] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pix' | 'digital'>('card');

  // Confirmation state for launching items
  const [confirmActionType, setConfirmActionType] = useState<'create' | 'add_more' | null>(null);

  // Find active order of selected table
  const currentTable = tables.find(t => t.number === selectedTable);
  const currentTableOrder = orders.find(o => o.id === currentTable?.currentOrderId);

  // Filtered menu
  const filteredMenu = menu.filter(item => {
    if (!item.isActive) return false;
    if (categoryFilter === 'All') return true;
    return item.category === categoryFilter;
  });

  const handleTableSelect = (tableNum: number) => {
    setSelectedTable(tableNum);
    const tableObj = tables.find(t => t.number === tableNum);
    setErrorMsg('');
    setSuccessMsg('');
    setCart({});
    setCartNotes({});
    setNotes('');
    setIsClosingBill(false);

    if (tableObj?.status === 'occupied') {
      setActiveTab('add_more');
    } else {
      setActiveTab('new_order');
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    const currentQtyInCart = cart[item.id] || 0;
    
    // Check stock for item with quantity + 1
    const check = checkMenuItemStock(item.id, currentQtyInCart + 1);
    if (!check.available) {
      setErrorMsg(`ESTOQUE INSUFICIENTE: ${check.limitingIngredient || 'Desconhecido'}`);
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    setCart(prev => ({
      ...prev,
      [item.id]: currentQtyInCart + 1
    }));
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId] <= 1) {
        delete updated[itemId];
      } else {
        updated[itemId] -= 1;
      }
      return updated;
    });
  };

  const handleSetItemNote = (itemId: string, note: string) => {
    setCartNotes(prev => ({
      ...prev,
      [itemId]: note
    }));
  };

  // Cart summaries
  const cartItemsArray = Object.entries(cart)
    .map(([itemId, qty]) => {
      const item = menu.find(m => m.id === itemId);
      if (!item) return null;
      return {
        menuItemId: itemId,
        name: item.name,
        quantity: Number(qty),
        price: Number(item.price),
        notes: cartNotes[itemId] || undefined
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  const cartTotal = cartItemsArray.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handlePlaceOrder = () => {
    if (!selectedTable) return;
    if (cartItemsArray.length === 0) {
      setErrorMsg('Nao eh possivel registrar um pedido vazio.');
      return;
    }

    const result = createOrder(selectedTable, cartItemsArray, notes);
    if (result.success) {
      setSuccessMsg(`Pedido registrado com sucesso para a Mesa ${selectedTable}!`);
      setCart({});
      setCartNotes({});
      setNotes('');
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('tables');
        setSelectedTable(null);
      }, 2000);
    } else {
      setErrorMsg(result.error || 'Falha ao registrar o pedido.');
    }
  };

  const handleAddMoreToExisting = () => {
    if (!selectedTable || !currentTableOrder) return;
    if (cartItemsArray.length === 0) {
      setErrorMsg('Selecione pelo menos um item para adicionar.');
      return;
    }

    const result = addItemsToOrder(currentTableOrder.id, cartItemsArray);
    if (result.success) {
      setSuccessMsg(`Novos itens adicionados com sucesso para a comanda da Mesa ${selectedTable}!`);
      setCart({});
      setCartNotes({});
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('tables');
        setSelectedTable(null);
      }, 2000);
    } else {
      setErrorMsg(result.error || 'Falha ao adicionar itens.');
    }
  };

  // Category translator PT-BR
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'All': return 'Todos';
      case 'Appetizers': return 'Entradas';
      case 'Mains': return 'Pratos Principais';
      case 'Desserts': return 'Sobremesas';
      case 'Beverages': return 'Bebidas';
      default: return cat;
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Appetizers': return 'ENTRA';
      case 'Mains': return 'PRINC';
      case 'Desserts': return 'SOBRE';
      case 'Beverages': return 'BEBID';
      default: return 'PRATO';
    }
  };

  const handleCloseTableBill = () => {
    if (!selectedTable || !currentTableOrder) return;

    const finalAmountWithService = currentTableOrder.totalAmount * 1.08;
    closeBill(currentTableOrder.id, paymentMethod, finalAmountWithService);
    
    setSuccessMsg(`A comanda da Mesa ${selectedTable} foi encerrada! Recebimento de ${formatCurrency(finalAmountWithService)} registrado no financeiro.`);
    setSelectedTable(null);
    setActiveTab('tables');
    setIsClosingBill(false);
    
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <h2 className="text-xl font-bold font-sans tracking-tight text-white">
            Terminal de Pedidos (Garcons)
          </h2>
          
        </div>

        {selectedTable && (
          <button
            onClick={() => handleTableSelect(null)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10 text-sm font-semibold whitespace-nowrap"
          >
            &larr; Voltar para as Mesas
          </button>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-950/30 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl flex items-center gap-3 font-medium text-sm">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/30 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3 font-medium text-sm">
          {errorMsg}
        </div>
      )}

      {!selectedTable ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tables.map((table) => {
              const isOccupied = table.status === 'occupied';
              const activeOrder = orders.find(o => o.id === table.currentOrderId);
              return (
                <button
                  key={table.number}
                  onClick={() => handleTableSelect(table.number)}
                  className={`
                    h-full min-h-[9rem] rounded-2xl border flex flex-col justify-between p-4 text-left transition-all group cursor-pointer relative shadow-sm
                    bg-[#070b14] hover:bg-[#0c1622]
                    ${isOccupied 
                       ? 'border-amber-400/50 hover:border-amber-400' 
                       : 'border-white/10 hover:border-white/30'
                    }
                  `}
                >
                  <div className="flex justify-between items-start w-full shrink-0 gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mesa</span>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-extrabold uppercase shrink-0 ${isOccupied ? 'bg-amber-900/40 border border-amber-200/50 text-amber-400' : 'bg-white/5 border border-white/10 text-slate-400'}`}>
                      {isOccupied ? 'OCUPADA' : 'LIVRE'}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-h-0 py-2">
                    <span className={`text-4xl font-extrabold font-sans tracking-tight block break-words ${isOccupied ? 'text-white' : 'text-slate-300'}`}>
                      {table.number.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mt-1 break-words">
                      {isOccupied ? 'Comanda Aberta' : 'Disponível'}
                    </span>
                  </div>
                  <div className={`w-full flex flex-wrap items-center justify-between gap-1 text-[10px] border-t border-white/10 pt-2 mt-1 shrink-0 ${isOccupied ? 'text-slate-400' : 'text-slate-600'}`}>
                    <span className="font-semibold break-words flex-1 min-w-[50px]">{isOccupied && activeOrder ? activeOrder.waiterName.split(' ')[0] : 'Nenhum'}</span>
                    <span className={`font-mono font-bold whitespace-nowrap text-right ${isOccupied ? 'text-white' : 'text-slate-500'}`}>{isOccupied && activeOrder ? formatCurrency(activeOrder.totalAmount) : 'R$ 0,00'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* CREATE OR MODIFY ORDER VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Menu Selection Side */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Category Filter Menu */}
            <div className="flex flex-wrap md:flex-nowrap md:overflow-x-auto gap-1.5 p-1.5 bg-[#070b14] border border-white/10 rounded-2xl">
              {['All', 'Mains', 'Appetizers', 'Desserts', 'Beverages'].map((cat) => {
                const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.All;
                const isActive = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat as any)}
                    className={`
                      flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-250 cursor-pointer whitespace-nowrap uppercase border text-center
                      ${isActive 
                        ? `${colors.accentBg} ${colors.accentText} ${colors.accentBorder} shadow-sm` 
                        : `${colors.bg} ${colors.text} ${colors.border} hover:bg-[#0c1622]/90`
                      }
                    `}
                  >
                    {getCategoryLabel(cat)}
                  </button>
                );
              })}
            </div>

            {/* Dishes list */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredMenu.map((item) => {
                const qtyInCart = cart[item.id] || 0;
                const check = checkMenuItemStock(item.id, 1);
                const outOfStock = !check.available;

                return (
                  <div 
                    key={item.id}
                    onClick={() => !outOfStock && handleAddToCart(item)}
                    className={`
                      bg-[#0c1622] border rounded-2xl p-4 flex justify-between gap-4 items-center cursor-pointer transition-all select-none shadow-sm
                      ${outOfStock ? 'border-neutral-150 opacity-40 cursor-not-allowed' : 'border-white/10 hover:border-neutral-400'}
                    `}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className={`text-[10px] font-mono font-bold tracking-wider ${CATEGORY_COLORS[item.category]?.bg || 'bg-[#091018]'} border ${CATEGORY_COLORS[item.category]?.border || 'border-white/10'} ${CATEGORY_COLORS[item.category]?.text || 'text-slate-400'} px-2 py-1.5 rounded-lg`}>
                        {getCategoryBadge(item.category)}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{item.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400 font-bold block mt-0.5 truncate">{formatCurrency(item.price)}</span>
                        {outOfStock && (
                          <span className="text-[9px] text-rose-400 font-bold block mt-1 uppercase font-mono">
                            [FALTA INSUMO: {check.limitingIngredient}]
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {qtyInCart > 0 ? (
                        <div className="bg-[#040810] text-white px-2.5 py-1 rounded-lg font-mono text-xs font-extrabold">
                          {qtyInCart}
                        </div>
                      ) : (
                        <span className={`px-2.5 py-1.5 rounded border text-[10px] font-bold ${outOfStock ? 'border-white/5 text-slate-300' : 'border-white/10 bg-[#070b14]/50 hover:bg-[#091018] text-slate-300'}`}>
                          ADD
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart & Billing Confirmation Side */}
          <div className="bg-[#0c1622] border border-white/10 rounded-2xl p-5 flex flex-col justify-between h-fit shadow-sm">
            
            {/* Header info */}
            <div className="flex-1 flex flex-col justify-center min-h-0">
              <div className="pb-3 border-b border-white/10 mb-4 flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase text-white tracking-wider">
                  {isClosingBill ? 'FECHAMENTO' : 'REQUISICAO'} - MESA {selectedTable?.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase font-mono">
                  {isClosingBill ? 'EMITIR CONTA' : activeTab === 'add_more' ? 'ADC ITENS' : 'NOVO REG'}
                </span>
              </div>

              {/* Integrated Close Account Tabs */}
              {activeTab === 'add_more' && currentTableOrder && (
                <div className="flex bg-[#091018] p-1 rounded-xl mb-4">
                  <button
                    type="button"
                    onClick={() => setIsClosingBill(false)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      !isClosingBill
                        ? 'bg-[#0c1622] text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Lancando Itens
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsClosingBill(true)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      isClosingBill
                        ? 'bg-[#0c1622] text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Encerrar Conta
                  </button>
                </div>
              )}

              {isClosingBill && currentTableOrder ? (
                /* SIMULATED PAPER INVOICE CLOSING VIEW */
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="bg-[#070b14] border border-white/10 p-4 rounded-xl font-mono text-slate-400 shadow-inner relative text-[11px] leading-relaxed">
                    <div className="text-center space-y-0.5">
                      <h4 className="font-extrabold text-white tracking-wider">{tenantSettings.restaurantName}</h4>
                      <span className="text-[8px] text-slate-500 block font-semibold uppercase">CONTA INDIVIDUAL DE MESA</span>
                    </div>

                    <div className="border-t border-dashed border-white/10 my-3 pt-2 space-y-0.5 text-[9px] text-slate-500">
                      <div className="flex justify-between">
                        <span>COMANDA ID:</span>
                        <span>#{currentTableOrder.id.split('-')[1]?.substring(0, 8).toUpperCase() || '0000'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>MESA RELACIONADA:</span>
                        <span>MESA {currentTableOrder.tableNumber.toString().padStart(2, '0')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GARCOM RESPONSAVEL:</span>
                        <span>{currentTableOrder.waiterName.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-white/10 my-3 pt-2 space-y-1 max-h-36 overflow-y-auto pr-1">
                      {currentTableOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-[10px] text-slate-300">
                          <span className="truncate pr-2">
                            {item.name} <span className="text-[9px] text-slate-500 font-bold">x{item.quantity}</span>
                          </span>
                          <span className="font-semibold font-mono">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-white/10 my-3 pt-2 space-y-1 text-slate-400">
                      <div className="flex justify-between">
                        <span>Subtotal Consumo:</span>
                        <span>{formatCurrency(currentTableOrder.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Servico Facultativo (8%):</span>
                        <span>{formatCurrency(currentTableOrder.totalAmount * 0.08)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-white border-t border-dashed border-white/10 pt-1.5">
                        <span>TOTAL GERAL:</span>
                        <span className="text-white font-bold font-mono">{formatCurrency(currentTableOrder.totalAmount * 1.08)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Selection Method */}
                  <div className="space-y-2">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Meio de Recebimento
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'card', label: 'CARTAO' },
                        { id: 'cash', label: 'DINHEIRO' },
                        { id: 'pix', label: 'PIX' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPaymentMethod(m.id as any); }}
                          className={`
                            px-2 py-1 border text-[9px] font-bold cursor-pointer transition-all h-[36px] rounded-lg
                            ${paymentMethod === m.id 
                              ? 'bg-white border-white/50 text-[#0c1622] font-bold' 
                              : 'bg-[#070b14] border-white/10 text-slate-400 hover:text-white hover:bg-[#0c1622]'
                            }
                          `}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* STANDARD CART VIEW */
                <>
                  {/* Existing bill details if activeTab is add_more */}
                  {activeTab === 'add_more' && currentTableOrder && (
                    <div className="mb-4 p-3.5 bg-[#070b14] border border-white/10 rounded-xl text-[11px] space-y-1.5 font-mono">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">Comanda Acumulada Atual</span>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>{currentTableOrder.items.reduce((sum, item) => sum + item.quantity, 0)} itens lancados</span>
                        <span className="font-bold text-white">{formatCurrency(currentTableOrder.totalAmount)}</span>
                      </div>
                    </div>
                  )}

                  {/* Cart List */}
                  {cartItemsArray.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <div className="text-xs font-bold text-slate-500 tracking-wider">
                        CARRINHO VAZIO
                      </div>
                      <p className="text-[11px] text-slate-500 max-w-[180px] mx-auto italic leading-relaxed">
                        Selecione pratos no cardapio ao lado para adiciona-los a esta mesa.
                      </p>
                      {activeTab === 'add_more' && currentTableOrder && (
                        <button
                          type="button"
                          onClick={() => setIsClosingBill(true)}
                          className="text-[10px] font-bold text-slate-400 hover:text-white underline block mx-auto cursor-pointer"
                        >
                          Ir para Fechamento de Conta &rarr;
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {cartItemsArray.map((item) => (
                        <div key={item.menuItemId} className="bg-[#070b14] p-3 rounded-xl border border-white/10 space-y-2.5">
                          <div className="flex justify-between items-start gap-2 text-xs">
                            <span className="font-bold text-slate-200 truncate flex-1">{item.name}</span>
                            <span className="font-mono text-slate-400 shrink-0 font-semibold">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-[#0c1622] border border-white/10 rounded-lg p-0.5 font-mono">
                              <button
                                type="button"
                                onClick={() => handleRemoveFromCart(item.menuItemId)}
                                className="px-1.5 py-0.5 hover:text-white text-slate-500 font-bold cursor-pointer"
                              >
                                -
                              </button>
                              <span className="text-[11px] font-bold text-slate-200 px-1">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const menuObj = menu.find(m => m.id === item.menuItemId);
                                  if (menuObj) handleAddToCart(menuObj);
                                }}
                                className="px-1.5 py-0.5 hover:text-white text-slate-500 font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            {/* Optional item level note */}
                            <input
                              type="text"
                              placeholder="Observacoes..."
                              value={cartNotes[item.menuItemId] || ''}
                              onChange={(e) => handleSetItemNote(item.menuItemId, e.target.value)}
                              className="bg-[#0c1622] border border-white/10 rounded px-2 py-1 text-[10px] text-slate-300 outline-none w-36 placeholder-neutral-400 focus:border-neutral-400"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom details & action buttons */}
            <div className="mt-6 border-t border-white/10 pt-4 space-y-4">
              
              {isClosingBill && currentTableOrder ? (
                /* BUTTONS FOR CLOSING BILL */
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleCloseTableBill}
                    className="w-full bg-white hover:bg-slate-200 text-black font-extrabold py-3 px-4 rounded-xl text-xs text-center cursor-pointer transition-colors"
                  >
                    REGISTRAR RECEBIMENTO E LIBERAR MESA
                  </button>

                </div>
              ) : (
                /* BUTTONS FOR ORDERING */
                <>
                  {/* Optional overall note for order */}
                  {activeTab === 'new_order' && cartItemsArray.length > 0 && (
                    <div className="flex-1 flex flex-col justify-center min-h-0">
                      <label className="block text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Observacoes Gerais</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ex: Mesa quer tudo servido junto."
                        className="w-full bg-[#070b14] border border-white/10 rounded-xl px-3 py-2 text-[10px] text-slate-300 outline-none placeholder-neutral-400 focus:border-neutral-400"
                      />
                    </div>
                  )}

                  {/* Automatic Value Calculations */}
                  {cartItemsArray.length > 0 && (
                    <div className="bg-[#070b14] p-3.5 rounded-xl border border-white/10 space-y-2 font-mono text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>Consumacao Parcial</span>
                        <span>{formatCurrency(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Servico Opcional (8%)</span>
                        <span>{formatCurrency(cartTotal * 0.08)}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-slate-200 text-sm">
                        <span>VALOR PARCIAL TOTAL</span>
                        <span className="text-white">{formatCurrency(cartTotal * 1.08)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setSelectedTable(null); setActiveTab('tables'); }}
                      className="flex-1 bg-[#091018] hover:bg-[#14293a] border border-white/10 text-slate-400 font-bold py-3 px-3 rounded-xl text-xs cursor-pointer transition-colors"
                    >
                      CANCELAR
                    </button>

                    {activeTab === 'add_more' ? (
                      <button
                        type="button"
                        onClick={() => setConfirmActionType('add_more')}
                        disabled={cartItemsArray.length === 0}
                        className="flex-1 bg-white hover:bg-slate-200 text-black font-extrabold py-3 px-3 rounded-xl text-xs cursor-pointer transition-all disabled:opacity-40 shadow-md shadow-white/20"
                      >
                        REVISAR E ADICIONAR
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmActionType('create')}
                        disabled={cartItemsArray.length === 0}
                        className="flex-1 bg-white hover:bg-slate-200 text-black font-extrabold py-3 px-3 rounded-xl text-xs cursor-pointer transition-all disabled:opacity-40 shadow-md shadow-white/20"
                      >
                        REVISAR E LANÇAR
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ORDER LAUNCHING CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmActionType && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c1622] border border-white/10 rounded-3xl p-6 shadow-2xl max-w-md w-full relative"
            >
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3 mb-4">
                Confirmar Lançamento de Pedido
              </h3>

              <div className="space-y-4">
                {/* Table details */}
                <div className="flex justify-between items-center bg-white/50 border border-white/20 rounded-xl p-3">
                  <div className="flex-1 flex flex-col justify-center min-h-0">
                     <span className="block text-[9px] font-bold text-white uppercase tracking-widest">Destinação</span>
                    <span className="text-sm font-extrabold text-white">MESA {selectedTable?.toString().padStart(2, '0')}</span>
                  </div>
                  <div className="text-right">
                     <span className="block text-[9px] font-bold text-white uppercase tracking-widest">Operação</span>
                    <span className="text-xs font-bold text-white">
                      {confirmActionType === 'create' ? 'NOVO PEDIDO' : 'ADICIONAR ITENS'}
                    </span>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-2">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Itens a Lançar para a Cozinha:</span>
                  <div className="max-h-44 overflow-y-auto divide-y divide-neutral-100 border border-white/10 rounded-xl bg-[#070b14]/50 p-2 space-y-1.5">
                    {cartItemsArray.map(item => (
                      <div key={item.menuItemId} className="flex justify-between items-center text-xs py-1.5">
                        <div className="truncate pr-2">
                          <span className="font-bold text-white">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            Qtd: {item.quantity} x {formatCurrency(item.price)}
                            {item.notes && <span className="text-white block italic font-normal">Obs: {item.notes}</span>}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-white shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="border-t border-dashed border-white/10 pt-3 space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal Consumido:</span>
                    <span className="font-mono">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Serviço (8%):</span>
                    <span className="font-mono">{formatCurrency(cartTotal * 0.08)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-white text-sm">
                    <span>VALOR TOTAL DO LANÇAMENTO:</span>
                    <span className="font-mono text-white font-extrabold">{formatCurrency(cartTotal * 1.08)}</span>
                  </div>
                </div>

                {/* Confirm buttons */}
                <div className="pt-4 border-t border-white/5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmActionType(null)}
                    className="flex-1 bg-[#091018] hover:bg-[#14293a] text-slate-400 font-extrabold py-3 rounded-xl text-xs cursor-pointer transition-all text-center"
                  >
                    VOLTAR E AJUSTAR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmActionType === 'create') {
                        handlePlaceOrder();
                      } else {
                        handleAddMoreToExisting();
                      }
                      setConfirmActionType(null);
                    }}
                    className="flex-1 bg-white hover:bg-slate-200 text-black font-extrabold py-3 rounded-xl text-xs cursor-pointer transition-all text-center shadow-md shadow-white/20"
                  >
                    CONFIRMAR E LANÇAR
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
