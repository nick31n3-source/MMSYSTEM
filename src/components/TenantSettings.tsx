import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';

export const TenantSettings: React.FC = () => {
  const { tenantSettings, updateTenantSettings, currentUser } = useRestaurant();
  
  const [restaurantName, setRestaurantName] = useState(tenantSettings.restaurantName || '');
  const [cnpj, setCnpj] = useState(tenantSettings.cnpj || '');
  const [contactEmail, setContactEmail] = useState(tenantSettings.contactEmail || '');
  const [contactPhone, setContactPhone] = useState(tenantSettings.contactPhone || '');
  const [address, setAddress] = useState(tenantSettings.address || '');
  const [receiptMessage, setReceiptMessage] = useState(tenantSettings.receiptMessage || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superuser' && currentUser.role !== 'manager')) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold text-white">Acesso Negado</h2>
        <p className="text-slate-400 mt-2">Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    
    try {
      updateTenantSettings({
        restaurantName,
        cnpj,
        contactEmail,
        contactPhone,
        address,
        receiptMessage
      });
      setSuccessMsg('Configurações atualizadas com sucesso!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Configurações da Conta</h1>
        
      </div>

      <div className="bg-[#0c1622] border border-white/10 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Nome do Restaurante</label>
              <input 
                type="text" 
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">CNPJ</label>
              <input 
                type="text" 
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">E-mail de Contato</label>
              <input 
                type="email" 
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Telefone de Contato</label>
              <input 
                type="text" 
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Endereço Completo</label>
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Mensagem de Rodapé (Cupom Fiscal)</label>
              <textarea 
                value={receiptMessage}
                onChange={(e) => setReceiptMessage(e.target.value)}
                className="w-full border border-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all resize-none"
                rows={3}
                placeholder="Ex: Obrigado pela preferência! Volte sempre."
              />
            </div>
          </div>
          
          {successMsg && (
            <div className="p-4 bg-white/5 border border-white/20 text-slate-300 rounded-xl text-sm font-medium">
              {successMsg}
            </div>
          )}
          
          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-white hover:bg-slate-200 text-black font-bold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
