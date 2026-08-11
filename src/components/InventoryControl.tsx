/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { Ingredient, formatCurrency } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const InventoryControl: React.FC = () => {
  const { inventory, addIngredient, updateIngredient, deleteIngredient, restockIngredient, menu, currentUser } = useRestaurant();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit/Add Ingredient form
  const [editingIng, setEditingIng] = useState<Ingredient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [unit, setUnit] = useState('un');
  const [costPrice, setCostPrice] = useState('');

  // Quick Restock State
  const [restockAmount, setRestockAmount] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; message: string } | null>(null);

  const isReadOnly = currentUser?.role === 'waiter' || currentUser?.role === 'cook';

  const resetForm = () => {
    setName('');
    setQuantity('');
    setMinQuantity('');
    setUnit('un');
    setCostPrice('');
    setEditingIng(null);
    setIsFormOpen(false);
  };

  const handleEditClick = (ing: Ingredient) => {
    if (isReadOnly) return;
    setEditingIng(ing);
    setName(ing.name);
    setQuantity(ing.quantity.toString());
    setMinQuantity(ing.minQuantity.toString());
    setUnit(ing.unit);
    setCostPrice(ing.costPrice.toString());
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!name.trim() || quantity === '' || minQuantity === '' || costPrice === '') return;

    const ingData = {
      name: name.trim(),
      quantity: Number(quantity),
      minQuantity: Number(minQuantity),
      unit,
      costPrice: Number(costPrice)
    };

    if (editingIng) {
      updateIngredient({ ...ingData, id: editingIng.id });
    } else {
      addIngredient(ingData);
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    if (isReadOnly) return;
    const linkedDishes = menu.filter(m => m.ingredients.some(ri => ri.ingredientId === id));
    let alertMsg = 'Tem certeza de que deseja excluir este insumo?';
    if (linkedDishes.length > 0) {
      alertMsg = `ATENCAO: Este insumo eh utilizado nas receitas de: ${linkedDishes.map(d => d.name).join(', ')}. Remover ira desconfigurar as receitas. Prosseguir?`;
    }

    setConfirmDelete({ isOpen: true, id, message: alertMsg });
  };

  const handleQuickRestockSubmit = (id: string) => {
    const amount = Number(restockAmount[id]);
    if (!amount || amount <= 0) return;
    restockIngredient(id, amount);
    setRestockAmount(prev => ({ ...prev, [id]: '' }));
  };

  // Filter list
  const filteredInventory = inventory.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = inventory.filter(i => i.quantity <= i.minQuantity).length;

  const totalInvestedAsset = inventory.reduce((sum, i) => sum + i.quantity * i.costPrice, 0);

  // Unit translation mapping
  const getUnitLabel = (u: string) => {
    switch (u) {
      case 'pcs': return 'un';
      case 'un': return 'un';
      case 'slices': return 'fatias';
      case 'g': return 'g';
      case 'kg': return 'kg';
      case 'ml': return 'ml';
      case 'l': return 'l';
      default: return u;
    }
  };

  return (
    <div className="space-y-6">
      {confirmDelete && confirmDelete.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#0c1622] border-2 border-[#14293a] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-red-400 text-sm font-mono font-bold uppercase tracking-wider">Confirmar Exclusão</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">{confirmDelete.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="bg-[#091018] hover:bg-[#14293a] text-slate-200 font-mono font-bold text-[10px] uppercase px-4 py-2 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteIngredient(confirmDelete.id);
                  setConfirmDelete(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-[10px] uppercase px-4 py-2 rounded-xl"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white">
            Controle Integrado de Estoque
          </h2>
          
        </div>
        
        {!isReadOnly && (
          <button
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="bg-white hover:bg-slate-200 text-black px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            + CADASTRAR NOVO INSUMO
          </button>
        )}
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0c1622] border border-white/10 p-5 rounded-2xl shadow-sm">
          <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-extrabold">Insumos Cadastrados</span>
          <span className="text-xl font-extrabold text-white font-mono mt-1 block">{inventory.length} itens</span>
        </div>

        <div className="bg-[#0c1622] border border-white/10 p-5 rounded-2xl shadow-sm">
          <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-extrabold">Estoques em Alerta</span>
          <span className={`text-xl font-extrabold font-mono mt-1 block ${lowStockCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {lowStockCount} {lowStockCount === 1 ? 'item critico' : 'itens criticos'}
          </span>
        </div>

        <div className="bg-[#0c1622] border border-white/10 p-5 rounded-2xl shadow-sm">
          <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-extrabold">Ativo em Estoque (Custo)</span>
          <span className="text-xl font-extrabold text-white font-mono mt-1 block">
            {formatCurrency(totalInvestedAsset)}
          </span>
        </div>
      </div>

      {/* Main Panel layout - Full width for comfortable list browsing */}
      <div className="space-y-4">
        
        {/* Search/Filter Bar */}
        <div className="relative bg-[#0c1622] border border-white/10 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase pl-2">FILTRAR:</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar insumos por nome..."
            className="bg-transparent border-none text-xs text-white placeholder-neutral-400 outline-none w-full"
          />
        </div>

        {/* Ingredient Table Card */}
        <div className="bg-[#0c1622] border border-white/10 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-[#070b14]/50 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Insumo / Detalhes</th>
                  <th className="py-3.5 px-4 text-center">Quantidade Atual</th>
                  <th className="py-3.5 px-4">Preco de Custo</th>
                  <th className="py-3.5 px-4">Status</th>
                  {!isReadOnly && <th className="py-3.5 px-4 text-center">Reabastecer</th>}
                  {!isReadOnly && <th className="py-3.5 px-5 text-right">Acoes</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                      Nenhum insumo encontrado no estoque com os criterios definidos.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((ing) => {
                    const isLow = ing.quantity <= ing.minQuantity;
                    const connectedDishes = menu.filter(m => m.ingredients.some(ri => ri.ingredientId === ing.id));

                    return (
                      <tr key={ing.id} className="hover:bg-[#070b14]/50 transition-colors group">
                        <td className="py-4 px-5 font-bold text-slate-200">
                          <div>
                            <span>{ing.name}</span>
                            <span className="block text-[9px] text-slate-500 font-normal mt-0.5">
                              Vinculado em {connectedDishes.length} {connectedDishes.length === 1 ? 'receita' : 'receitas'} do cardapio
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center font-mono text-slate-300">
                          <span className={`font-bold ${isLow ? 'text-rose-400' : ''}`}>
                            {ing.quantity.toLocaleString()}
                          </span>{' '}
                          <span className="text-slate-500 text-[10px]">{getUnitLabel(ing.unit)}</span>
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-400">
                          {formatCurrency(ing.costPrice)}<span className="text-[9px] text-slate-500">/{getUnitLabel(ing.unit)}</span>
                        </td>
                        <td className="py-4 px-4">
                          {isLow ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-950/30 text-rose-400 border border-rose-200">
                              BAIXO (MIN: {ing.minQuantity})
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-white/5 text-slate-300 border border-white/20">
                              ADEQUADO
                            </span>
                          )}
                        </td>
                        
                        {/* Quick Restock Input Field */}
                        {!isReadOnly && (
                          <td className="py-4 px-4">
                            <div className="flex gap-1 justify-center max-w-[120px] mx-auto">
                              <input
                                type="number"
                                placeholder="Qtd"
                                value={restockAmount[ing.id] || ''}
                                onChange={(e) => setRestockAmount(prev => ({ ...prev, [ing.id]: e.target.value }))}
                                className="w-12 bg-[#070b14] border border-white/10 focus:border-neutral-400 rounded px-1.5 py-1 text-center font-mono text-[10px] outline-none text-white h-[28px]"
                              />
                              <button
                                onClick={() => handleQuickRestockSubmit(ing.id)}
                                className="bg-white hover:bg-slate-200 text-black font-extrabold px-2 rounded text-[10px] cursor-pointer"
                              >
                                +ADD
                              </button>
                            </div>
                          </td>
                        )}

                        {/* Action buttons */}
                        {!isReadOnly && (
                          <td className="py-4 px-5 text-right">
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => handleEditClick(ing)}
                                className="px-2 py-1 bg-[#070b14] hover:bg-[#091018] border border-white/10 text-slate-400 rounded text-[9px] font-bold cursor-pointer transition-all"
                              >
                                EDITAR
                              </button>
                              <button
                                onClick={() => handleDelete(ing.id)}
                                className="px-2 py-1 bg-[#070b14] hover:bg-[#091018] border border-white/10 text-slate-400 hover:text-rose-750 hover:border-rose-200 rounded text-[9px] font-bold cursor-pointer transition-all"
                              >
                                EXCLUIR
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Informational tip card at the bottom - Accordion */}
      <div className="bg-[#091018]/60 border border-white/10 rounded-2xl overflow-hidden transition-all">
        <details className="group">
          <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-4">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Controle de Baixas Automatizado (Tempo Real)
            </span>
            <span className="transition group-open:rotate-180 text-slate-500">
              <svg fill="none" height="16" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="16"><path d="M6 9l6 6 6-6"></path></svg>
            </span>
          </summary>
          <div className="text-[11px] text-slate-400 leading-relaxed px-4 pb-4 border-t border-white/10/50 mt-1 pt-3">
            O estoque de insumos sofre baixa automatizada no exato instante em que o garçom registra um pedido na mesa. Caso haja falta de algum ingrediente crítico, o garçom receberá um aviso impedindo a criação do pedido.
          </div>
        </details>
      </div>

      {/* Floating Modal Panel for Registering/Editing supplies */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <div 
              onClick={resetForm}
              className="absolute inset-0 bg-white/40 backdrop-blur-md transition-opacity duration-300"
            />

            {/* Modal Card Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="relative bg-[#0c1622] border border-white/10 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden font-sans z-10 p-6 md:p-8 space-y-5"
            >
              <div className="flex justify-between items-baseline pb-3.5 border-b border-neutral-150">
                <div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest block">Estoque Geral</span>
                  <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                    {editingIng ? 'Editar Insumo Cadastrado' : 'Registrar Novo Insumo'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-slate-500 hover:text-slate-300 font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer border border-white/10 hover:bg-[#070b14] px-2.5 py-1 rounded-lg"
                >
                  Fechar
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nome do Insumo</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Queijo Mucarela Ralado"
                      className="w-full bg-[#070b14] border border-white/10 focus:border-neutral-400 focus:bg-[#0c1622] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all h-[40px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Estoque Inicial</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={quantity}
                        disabled={!!editingIng}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Ex: 50.00"
                        className="w-full bg-[#070b14] border border-white/10 focus:border-neutral-400 focus:bg-[#0c1622] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono disabled:opacity-50 h-[40px] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Medida Unitária</label>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full bg-[#070b14] border border-white/10 focus:border-neutral-400 focus:bg-[#0c1622] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer h-[40px] transition-all"
                      >
                        <option value="un">un (unidades)</option>
                        <option value="slices">fatias</option>
                        <option value="g">g (gramas)</option>
                        <option value="kg">kg (quilogramas)</option>
                        <option value="ml">ml (mililitros)</option>
                        <option value="l">l (litros)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Estoque Mínimo (Alerta)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={minQuantity}
                        onChange={(e) => setMinQuantity(e.target.value)}
                        placeholder="Ex: 10.00"
                        className="w-full bg-[#070b14] border border-white/10 focus:border-neutral-400 focus:bg-[#0c1622] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono h-[40px] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Preço Unitário de Custo</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={costPrice}
                        onChange={(e) => setCostPrice(e.target.value)}
                        placeholder="Ex: 2.50"
                        className="w-full bg-[#070b14] border border-white/10 focus:border-neutral-400 focus:bg-[#0c1622] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono h-[40px] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-neutral-150">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-[#091018] hover:bg-[#14293a] border border-white/10 text-slate-300 font-semibold py-2.5 px-3 rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-white hover:bg-slate-200 text-black font-bold py-2.5 px-3 rounded-xl text-xs cursor-pointer transition-colors shadow-sm"
                  >
                    {editingIng ? 'SALVAR ALTERACOES' : 'CONFIRMAR CADASTRO'}
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
