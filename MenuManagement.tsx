/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { MenuItem, RecipeIngredient, formatCurrency, CATEGORY_COLORS } from '../types';

export const MenuManagement: React.FC = () => {
  const { menu, inventory, addMenuItem, updateMenuItem, deleteMenuItem, currentUser, addIngredient } = useRestaurant();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'Appetizers' | 'Mains' | 'Desserts' | 'Beverages'>('Mains');
  const [recipe, setRecipe] = useState<RecipeIngredient[]>([]);

  // Recipe Helper state
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; message: string } | null>(null);

  const isReadOnly = currentUser?.role === 'waiter' || currentUser?.role === 'cook';

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Mains');
    setRecipe([]);
    setEditingItem(null);
    setSelectedIngredientId('');
    setIngredientQuantity('');
  };

  const handleEditClick = (item: MenuItem) => {
    if (isReadOnly) return;
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategory(item.category);
    setRecipe(item.ingredients);
    setIsFormOpen(true);
  };

  const handleAddNewClick = () => {
    if (isReadOnly) return;
    resetForm();
    setIsFormOpen(true);
  };

  const handleAddRecipeItem = () => {
    if (!selectedIngredientId || !ingredientQuantity || Number(ingredientQuantity) <= 0) return;
    
    const existingIdx = recipe.findIndex(r => r.ingredientId === selectedIngredientId);
    if (existingIdx !== -1) {
      const updated = [...recipe];
      updated[existingIdx] = {
        ...updated[existingIdx],
        quantityNeeded: Number((updated[existingIdx].quantityNeeded + Number(ingredientQuantity)).toFixed(4))
      };
      setRecipe(updated);
    } else {
      setRecipe(prev => [...prev, { ingredientId: selectedIngredientId, quantityNeeded: Number(ingredientQuantity) }]);
    }
    
    setSelectedIngredientId('');
    setIngredientQuantity('');
  };

  const handleRemoveRecipeItem = (id: string) => {
    setRecipe(prev => prev.filter(r => r.ingredientId !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!name.trim() || !price || Number(price) <= 0) return;

    const itemData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(Number(price).toFixed(2)),
      category,
      image: '', // completely emoji/image free
      ingredients: recipe,
      isActive: editingItem ? editingItem.isActive : true
    };

    if (editingItem) {
      updateMenuItem({ ...itemData, id: editingItem.id });
    } else {
      addMenuItem(itemData);
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (isReadOnly) return;
    setConfirmDelete({ isOpen: true, id, message: 'Tem certeza de que deseja excluir este prato do cardapio? Ele sera removido das opcoes de novos pedidos.' });
  };

  const toggleActive = (item: MenuItem) => {
    if (isReadOnly) return;
    updateMenuItem({
      ...item,
      isActive: !item.isActive
    });
  };

  // Human category translator PT-BR
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'Appetizers': return 'Entradas';
      case 'Mains': return 'Pratos Principais';
      case 'Desserts': return 'Sobremesas';
      case 'Beverages': return 'Bebidas';
      default: return cat;
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Appetizers': return 'ENTRADA';
      case 'Mains': return 'PRINCIP';
      case 'Desserts': return 'SOBREM';
      case 'Beverages': return 'BEBIDA';
      default: return 'PRATO';
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
                  deleteMenuItem(confirmDelete.id);
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
            Gerenciamento do Cardapio
          </h2>
          
        </div>
        
        {!isReadOnly && (
          <div className="flex gap-2">
            <button
              onClick={handleAddNewClick}
              className="bg-white hover:bg-slate-200 text-black px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              + NOVO PRATO
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dishes list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Categories header filter */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Mains', 'Appetizers', 'Desserts', 'Beverages'].map((cat) => {
              const count = menu.filter(m => m.category === cat).length;
              const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.All;
              return (
                <div key={cat} className={`${colors.bg} border ${colors.border} p-3.5 rounded-2xl text-center shadow-sm transition-all hover:scale-[1.02] flex flex-col items-center justify-center`}>
                  <span className={`block text-[10px] ${colors.text} uppercase tracking-widest font-extrabold`}>{getCategoryLabel(cat)}</span>
                  <span className="text-sm font-extrabold text-white mt-0.5 block">{count} {count === 1 ? 'item' : 'itens'}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menu.map((item) => (
              <div 
                key={item.id} 
                className={`bg-[#0c1622] border rounded-3xl p-5 flex flex-col justify-between transition-all shadow-sm ${item.isActive ? 'border-white/10 hover:border-neutral-400' : 'border-white/5 opacity-60'}`}
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <span className={`text-[10px] font-mono font-bold tracking-widest ${CATEGORY_COLORS[item.category]?.bg || 'bg-[#091018]'} border ${CATEGORY_COLORS[item.category]?.border || 'border-white/10'} ${CATEGORY_COLORS[item.category]?.text || 'text-slate-400'} px-2.5 py-1.5 rounded-lg`}>
                      [{getCategoryBadge(item.category)}]
                    </span>
                    <div className="flex gap-1">
                      {!isReadOnly && (
                        <>
                          <button
                            onClick={() => toggleActive(item)}
                            className="px-2 py-1 bg-[#070b14] hover:bg-[#091018] border border-white/10 rounded text-[9px] font-bold text-slate-400 transition-all cursor-pointer"
                          >
                            {item.isActive ? 'DESATIVAR' : 'ATIVAR'}
                          </button>
                          <button
                            onClick={() => handleEditClick(item)}
                            className="px-2 py-1 bg-[#070b14] hover:bg-[#091018] border border-white/10 rounded text-[9px] font-bold text-slate-400 transition-all cursor-pointer"
                          >
                            EDITAR
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-2 py-1 bg-[#070b14] hover:bg-[#091018] border border-white/10 hover:text-rose-400 hover:border-rose-200 rounded text-[9px] font-bold text-slate-400 transition-all cursor-pointer"
                          >
                            EXCLUIR
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-white leading-tight">{item.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description || 'Nenhuma descricao detalhada informada.'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-500">Preco de Venda</span>
                    <span className="text-base font-bold text-white font-mono">{formatCurrency(item.price)}</span>
                  </div>
                  
                  <div className="text-right">
                    <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-500">Ficha Tecnica</span>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                      {item.ingredients.length} {item.ingredients.length === 1 ? 'insumo' : 'insumos'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit or Add Dialog Panel */}
        <div className="bg-[#0c1622] border border-white/10 rounded-3xl p-6 h-fit shadow-sm space-y-4">
          {!isFormOpen ? (
            <div className="py-12 text-center space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                FICHA TECNICA DE PREPARO
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                {isReadOnly 
                  ? 'Selecione um prato para ver seus insumos e especificacoes.'
                  : 'Selecione "EDITAR" em um prato ou clique em "NOVO PRATO" para abrir o formulario.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-[10px] font-extrabold uppercase text-white tracking-widest">
                  {editingItem ? 'EDITAR PROPRIEDADES' : 'REGISTRAR NOVO PRATO'}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-slate-500 hover:text-slate-300 font-mono text-xs cursor-pointer px-1"
                >
                  FECHAR
                </button>
              </div>

              {/* Form inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nome do Prato</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Salada Caesar com Frango"
                    className="w-full bg-[#070b14] border border-white/10 focus:border-white/50 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Categoria</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-[#070b14] border border-white/10 focus:border-white/50 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer h-[38px]"
                    >
                      <option value="Mains">Pratos Principais</option>
                      <option value="Appetizers">Entradas / Porcoes</option>
                      <option value="Desserts">Sobremesas</option>
                      <option value="Beverages">Bebidas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Preco de Venda (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Ex: 34.90"
                      className="w-full bg-[#070b14] border border-white/10 focus:border-white/50 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Descricao do Item</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Destaque sabores, peso da porcao ou detalhes de preparo..."
                    className="w-full bg-[#070b14] border border-white/10 focus:border-white/50 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none h-16 resize-none"
                  />
                </div>

                {/* Recipe builder section */}
                <details className="group bg-[#070b14] rounded-xl border border-white/10 overflow-hidden transition-all">
                  <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-4">
                    <span className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                      FICHA TECNICA (INSUMOS DA RECEITA) - Total Estoque: {inventory?.length || 0}
                    </span>
                    <span className="transition group-open:rotate-180 text-slate-500">
                      <svg fill="none" height="16" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="16"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                  </summary>
                  
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10/50 mt-1 pt-3">
                  {/* Current ingredients linked */}
                  {recipe.length === 0 ? (
                    <p className="text-[10px] text-slate-500 text-center py-2 italic leading-relaxed">
                      Nenhum insumo vinculado a esta receita.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {recipe.map((recipeItem) => {
                        const ing = Array.isArray(inventory) ? inventory.find(i => (i?.id || `temp-${i?.name}`) === recipeItem.ingredientId) : undefined;
                        return (
                          <div key={recipeItem.ingredientId} className="flex justify-between items-center text-[11px] bg-[#0c1622] border border-white/10 px-3 py-1.5 rounded-lg">
                            <span className="font-semibold text-slate-300 truncate max-w-[120px]">{ing?.name || 'Insumo Excluído'}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-400">
                                {recipeItem.quantityNeeded} {ing?.unit || 'un'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveRecipeItem(recipeItem.ingredientId)}
                                className="text-slate-500 hover:text-rose-400 font-mono text-[9px] font-bold cursor-pointer"
                              >
                                REMOVER
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* Add recipe ingredient inputs */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
                    <select
                      value={selectedIngredientId}
                      onChange={(e) => setSelectedIngredientId(e.target.value)}
                      className="bg-[#0c1622] border border-white/20 focus:border-white/50 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer w-full shadow-sm"
                    >
                      <option value="" disabled>Selecione um Insumo...</option>
                      {inventory && inventory.length > 0 ? (
                        inventory.map((ing) => (
                          <option key={ing.id || `temp-${ing.name}`} value={ing.id || `temp-${ing.name}`}>
                            {ing.name} (Estoque: {ing.quantity} {ing.unit})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Cadastre insumos no Estoque primeiro</option>
                      )}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.001"
                        value={ingredientQuantity}
                        onChange={(e) => setIngredientQuantity(e.target.value)}
                        placeholder="Quantidade Necessária"
                        className="bg-[#0c1622] border border-white/10 focus:border-white/50 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none font-mono flex-1 h-[36px]"
                      />
                      <button
                        type="button"
                        onClick={handleAddRecipeItem}
                        disabled={!selectedIngredientId || !ingredientQuantity || Number(ingredientQuantity) <= 0}
                        className={`px-4 rounded-lg text-[10px] font-bold cursor-pointer h-[36px] transition-colors ${
                          (!selectedIngredientId || !ingredientQuantity || Number(ingredientQuantity) <= 0)
                          ? 'bg-[#14293a] text-slate-500 cursor-not-allowed'
                          : 'bg-white hover:bg-slate-200 text-black shadow-sm'
                        }`}
                      >
                        INCLUIR
                      </button>
                    </div>
                  </div>
                  </div>
                </details>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
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
                  SALVAR PRATO
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
