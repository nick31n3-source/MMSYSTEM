/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { formatCurrency, Supplier, SupplyOrder } from '../types';
import { motion, AnimatePresence } from 'motion/react';



export const SuppliesControl: React.FC = () => {
  const { inventory, restockIngredient, currentUser, suppliers: allSuppliers, supplyOrders: allSupplyOrders, addSupplier, addSupplyOrder, updateSupplyOrderStatus } = useRestaurant();

  const suppliers = allSuppliers.filter(s => {
    const currentTenant = currentUser?.tenantId || 'global';
    const supplierTenant = s.tenantId || 'global';
    return currentTenant === 'global' ? true : currentTenant === supplierTenant;
  });

  const supplyOrders = allSupplyOrders.filter(o => {
    const currentTenant = currentUser?.tenantId || 'global';
    const orderTenant = o.tenantId || 'global';
    return currentTenant === 'global' ? true : currentTenant === orderTenant;
  });
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'suppliers'>('orders');



  // Form states for registering new supply
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [ingredientId, setIngredientId] = useState('');
  const [qty, setQty] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [status, setStatus] = useState<'Pendente' | 'Recebido'>('Recebido');

  // Form states for new supplier
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supName, setSupName] = useState('');
  const [supCategory, setSupCategory] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');

  const isReadOnly = currentUser?.role === 'waiter';

  const handleRegisterSupply = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!supplierId || !ingredientId || !qty || !unitCost) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      setTimeout(() => setErrorMsg(''), 5000);
      return;
    }

    const selectedSupplier = suppliers.find(s => s.id === supplierId);
    const selectedIng = inventory.find(i => i.id === ingredientId);

    if (!selectedSupplier || !selectedIng) {
      setErrorMsg('Por favor, selecione um fornecedor e um insumo válidos.');
      setTimeout(() => setErrorMsg(''), 5000);
      return;
    }

    const quantityNum = Number(qty);
    const costNum = Number(unitCost);
    const totalCost = quantityNum * costNum;

    const newOrder: SupplyOrder = {
      id: `supord-${Date.now()}`,
      supplierName: selectedSupplier.name,
      ingredientId: selectedIng.id,
      ingredientName: selectedIng.name,
      quantity: quantityNum,
      unit: selectedIng.unit,
      unitCost: costNum,
      totalCost: Number(totalCost.toFixed(2)),
      status,
      createdAt: new Date().toISOString(),
      tenantId: currentUser?.tenantId || 'global'
    };

    addSupplyOrder(newOrder);

    // If marked as received, restock immediately in inventory context!
    if (status === 'Recebido') {
      restockIngredient(selectedIng.id, quantityNum);
    }

    // Reset Form
    setSupplierId('');
    setIngredientId('');
    setQty('');
    setUnitCost('');
    setStatus('Recebido');
    setIsModalOpen(false);
  };

  const handleRegisterSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (!supName || !supCategory || !supContact || !supPhone || !supEmail) {
      setErrorMsg('Por favor, preencha todos os campos do fornecedor.');
      setTimeout(() => setErrorMsg(''), 5000);
      return;
    }

    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: supName,
      category: supCategory,
      contactName: supContact,
      phone: supPhone,
      email: supEmail,
      tenantId: currentUser?.tenantId || 'global'
    };

    addSupplier(newSupplier);

    // Reset Form
    setSupName('');
    setSupCategory('');
    setSupContact('');
    setSupPhone('');
    setSupEmail('');
    setIsSupplierModalOpen(false);
  };

  const handleMarkAsReceived = (orderId: string) => {
    if (isReadOnly) return;
    
    // Find the order first to perform the side effect safely outside the state updater callback
    const orderToUpdate = supplyOrders.find(o => o.id === orderId);
    if (orderToUpdate && orderToUpdate.status === 'Pendente') {
      restockIngredient(orderToUpdate.ingredientId, orderToUpdate.quantity);
      updateSupplyOrderStatus(orderId, 'Recebido');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 pb-5">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-white rounded-full inline-block"></span>
            Gestão de Suprimentos & Fornecedores
          </h2>
          
        </div>

        {!isReadOnly && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsSupplierModalOpen(true)}
              className="bg-[#0c1622] hover:bg-[#070b14] text-white border border-white/30 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              + CADASTRAR FORNECEDOR
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white hover:bg-slate-200 text-black px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              + REGISTRAR ENTRADA DE SUPRIMENTO
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-1">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'orders'
              ? 'border-white/50 text-white font-extrabold'
              : 'border-transparent text-slate-400 hover:text-white hover:border-white/30'
          }`}
        >
          REGISTROS DE COMPRAS / SUPRIMENTOS
        </button>
        <button
          onClick={() => setActiveSubTab('suppliers')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'suppliers'
              ? 'border-white/50 text-white font-extrabold'
              : 'border-transparent text-slate-400 hover:text-white hover:border-white/30'
          }`}
        >
          FORNECEDORES PARCEIROS
        </button>
      </div>

      {/* CONTENT PANELS */}
      {activeSubTab === 'orders' ? (
        <div className="bg-[#0c1622] border border-white/10 rounded-2xl overflow-hidden shadow-sm animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#070b14] text-white font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">FORNECEDOR</th>
                  <th className="p-4">INSUMO ADQUIRIDO</th>
                  <th className="p-4 text-center">QUANTIDADE</th>
                  <th className="p-4 text-right">CUSTO UNITÁRIO</th>
                  <th className="p-4 text-right">CUSTO TOTAL</th>
                  <th className="p-4 text-center">STATUS</th>
                  <th className="p-4 text-center">DATA DA COMPRA</th>
                  <th className="p-4 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-[11px] text-slate-300">
                {supplyOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                      Nenhum registro de suprimento encontrado.
                    </td>
                  </tr>
                ) : (
                  supplyOrders.map(order => (
                    <tr key={order.id} className="hover:bg-white/20 transition-all">
                      <td className="p-4 font-bold text-white">{order.supplierName}</td>
                      <td className="p-4">
                        <span className="font-semibold text-white">{order.ingredientName}</span>
                      </td>
                      <td className="p-4 text-center font-mono font-bold">
                        {order.quantity} {order.unit}
                      </td>
                      <td className="p-4 text-right font-mono">{formatCurrency(order.unitCost)}</td>
                      <td className="p-4 text-right font-mono font-bold text-white">
                        {formatCurrency(order.totalCost)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${
                          order.status === 'Recebido'
                            ? 'bg-white/5 text-slate-300 border-white/20'
                            : 'bg-amber-950/30 text-amber-400 border-amber-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-center text-slate-500 font-mono">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        {order.status === 'Pendente' ? (
                          <button
                            onClick={() => handleMarkAsReceived(order.id)}
                            className="bg-white hover:bg-slate-200 text-black font-bold px-2.5 py-1 rounded-lg text-[9px] uppercase cursor-pointer tracking-wider transition-all"
                          >
                            Marcar Recebido
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono font-semibold">✓ INTEGRADO</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Suppliers view list with elegant color codes */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {suppliers.map(sup => (
            <div key={sup.id} className="bg-[#0c1622] border border-white/10 rounded-2xl p-5 shadow-sm hover:border-white/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white text-sm tracking-tight">{sup.name}</h3>
                  <span className="bg-white/10 border border-white/20 text-white text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {sup.category}
                  </span>
                </div>
                <div className="mt-4 space-y-1.5 text-xs text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase text-[9px]">Atendimento:</span>
                    <span>{sup.contactName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase text-[9px]">Telefone:</span>
                    <span className="font-semibold text-slate-200">{sup.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase text-[9px]">E-mail:</span>
                    <span className="underline text-white">{sup.email}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REGISTER NEW SUPPLY ORDER MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c1622] border border-white/10 rounded-3xl p-6 shadow-2xl max-w-md w-full relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white text-xs font-mono"
              >
                [FECHAR]
              </button>

              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3 mb-4">
                Registrar Novo Suprimento (Entrada)
              </h3>

              {errorMsg && (
                <div className="bg-red-950/30 text-red-400 p-3 rounded-xl text-xs font-bold border border-red-200 mb-4">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleRegisterSupply} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fornecedor Responsável *</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-[#070b14] border border-white/10 focus:border-white/50 rounded-xl py-2 px-3 text-white outline-none transition-all h-[38px]"
                  >
                    <option value="">Selecione o Fornecedor...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Insumo a Abastecer *</label>
                  <select
                    value={ingredientId}
                    onChange={(e) => setIngredientId(e.target.value)}
                    className="w-full bg-[#070b14] border border-white/10 focus:border-white/50 rounded-xl py-2 px-3 text-white outline-none transition-all h-[38px]"
                  >
                    <option value="">Selecione o Insumo do Estoque...</option>
                    {inventory.map(i => (
                      <option key={i.id} value={i.id}>{i.name} (Atual: {i.quantity} {i.unit})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Quantidade de Entrada *</label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      placeholder="Ex: 10"
                      className="w-full bg-[#070b14] border border-white/10 focus:border-white/50 rounded-xl py-2 px-3 text-white outline-none transition-all h-[38px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Custo Unitário (R$) *</label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={unitCost}
                      onChange={(e) => setUnitCost(e.target.value)}
                      placeholder="Ex: 4.50"
                      className="w-full bg-[#070b14] border border-white/10 focus:border-white/50 rounded-xl py-2 px-3 text-white outline-none transition-all h-[38px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status da Entrega</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('Recebido')}
                      className={`py-2 px-3 rounded-lg border font-bold text-center transition-all cursor-pointer ${
                        status === 'Recebido'
                          ? 'bg-white border-white/50 text-white'
                          : 'bg-[#070b14] border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      RECEBIDO (Restoca na hora)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('Pendente')}
                      className={`py-2 px-3 rounded-lg border font-bold text-center transition-all cursor-pointer ${
                        status === 'Pendente'
                          ? 'bg-white border-white/50 text-white'
                          : 'bg-[#070b14] border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      PENDENTE (Sem restoque)
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-[#091018] hover:bg-[#14293a] text-slate-400 font-bold py-2.5 rounded-xl cursor-pointer transition-all text-center"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-white hover:bg-slate-200 text-black font-bold py-2.5 rounded-xl cursor-pointer transition-all text-center"
                  >
                    REGISTRAR ENTRADA
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REGISTER NEW SUPPLIER MODAL */}
      <AnimatePresence>
        {isSupplierModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c1622] border border-white/10 rounded-3xl p-6 shadow-2xl max-w-md w-full relative"
            >
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white text-xs font-mono"
              >
                [FECHAR]
              </button>

              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3 mb-4">
                Cadastrar Novo Fornecedor Parceiro
              </h3>

              {errorMsg && (
                <div className="bg-red-950/30 text-red-400 p-3 rounded-xl text-xs font-bold border border-red-200 mb-4">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleRegisterSupplier} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Razão Social / Nome Fantasia *</label>
                  <input
                    type="text"
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    placeholder="Ex: Comercial Distribuidora de Alimentos S/A"
                    className="w-full bg-[#070b14] border border-white/10 focus:border-white/50 rounded-xl py-2 px-3 text-white outline-none transition-all h-[38px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Categoria de Atuação *</label>
                    <input
                      type="text"
                      value={supCategory}
                      onChange={(e) => setSupCategory(e.target.value)}
                      placeholder="Ex: Carnes e Frios"
                      className="w-full bg-[#070b14] border border-white/10 focus:border-white/50 rounded-xl py-2 px-3 text-white outline-none transition-all h-[38px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pessoa de Contato *</label>
                    <input
                      type="text"
                      value={supContact}
                      onChange={(e) => setSupContact(e.target.value)}
                      placeholder="Ex: Amanda Silva"
                      className="w-full bg-[#070b14] border border-white/10 focus:border-white/50 rounded-xl py-2 px-3 text-white outline-none transition-all h-[38px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Telefone de Contato *</label>
                    <input
                      type="text"
                      value={supPhone}
                      onChange={(e) => setSupPhone(e.target.value)}
                      placeholder="Ex: (11) 98877-6655"
                      className="w-full bg-[#070b14] border border-white/10 focus:border-white/50 rounded-xl py-2 px-3 text-white outline-none transition-all h-[38px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">E-mail Comercial *</label>
                    <input
                      type="email"
                      value={supEmail}
                      onChange={(e) => setSupEmail(e.target.value)}
                      placeholder="Ex: amanda@comercialdist.com"
                      className="w-full bg-[#070b14] border border-white/10 focus:border-white/50 rounded-xl py-2 px-3 text-white outline-none transition-all h-[38px]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSupplierModalOpen(false)}
                    className="flex-1 bg-[#091018] hover:bg-[#14293a] text-slate-400 font-bold py-2.5 rounded-xl cursor-pointer transition-all text-center"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-white hover:bg-slate-200 text-black font-bold py-2.5 rounded-xl cursor-pointer transition-all text-center"
                  >
                    CADASTRAR PARCEIRO
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
