const performanceHistory = [{ name: "00:00", cpu: 12, latency: 15 }, { name: "01:00", cpu: 15, latency: 18 }, { name: "02:00", cpu: 18, latency: 22 }, { name: "03:00", cpu: 14, latency: 16 }, { name: "04:00", cpu: 22, latency: 30 }, { name: "05:00", cpu: 25, latency: 35 }, { name: "06:00", cpu: 19, latency: 20 }];
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { ClientInstance, formatCurrency } from '../types';
import { motion } from 'motion/react';

// Layout badge styling helpers (NO emojis or icons used)
const getTierBadgeClass = (tier: string) => {
  switch (tier) {
    case 'trial':
      return 'border-white/10 bg-[#070b14] text-slate-400 font-mono';
    case 'standard':
      return 'border-white/20 bg-[#091018] text-slate-200 font-mono';
    case 'premium':
      return 'border-white/50 bg-white text-black font-mono';
    case 'enterprise':
      return 'border-double border-white/50 bg-[#070b14] text-white font-bold font-mono';
    default:
      return 'border-white/10 bg-[#0c1622] text-slate-400 font-mono';
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-[#091018] text-slate-200 border border-white/20 font-bold uppercase';
    case 'suspended':
      return 'bg-red-950/30 text-red-400 border border-red-200 font-bold uppercase';
    case 'expired':
      return 'bg-amber-950/30 text-amber-400 border border-amber-200 font-bold uppercase';
    default:
      return 'bg-[#070b14] text-slate-500 border border-white/10 uppercase';
  }
};


const CustomSelect = ({ value, onChange, options, className }: { value: string, onChange: (val: string) => void, options: {label: string, value: string}[], className?: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className={`relative ${className || ''}`}>
      <div 
        className="w-full h-full flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate pr-2">{selectedOption?.label}</span>
        <span className="text-[8px] opacity-50">▼</span>
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-1 w-full bg-[#0c1622] border border-white/10 rounded-lg shadow-xl z-[101] overflow-hidden min-w-[120px]">
            {options.map(opt => (
              <div 
                key={opt.value}
                className="px-3 py-2 text-xs font-mono hover:bg-white/10 hover:text-white cursor-pointer border-b border-white/5 last:border-0"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ClientRow = React.memo(({ client, isEditing, handleSaveEdit, setEditingClientId, startEditing, handleDeleteClient }: any) => {
  const [localForm, setLocalForm] = React.useState({
    subscriptionTier: client.subscriptionTier,
    subscriptionStatus: client.subscriptionStatus,
    subscriptionCost: client.subscriptionCost,
    nextBillingDate: client.nextBillingDate
  });
  
  const [ips, setIps] = React.useState<string[]>([]);
  const [newIp, setNewIp] = React.useState('');
  const [isIpLoading, setIsIpLoading] = React.useState(false);

  React.useEffect(() => {
    if (isEditing && (localForm.subscriptionTier === 'premium' || localForm.subscriptionTier === 'enterprise')) {
      setIsIpLoading(true);
      fetch(`/api/superuser/ips?targetTenantId=${client.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('mm_jwt_token') || ''}` }
      }).then(res => res.json()).then(data => {
        if (data.success) setIps(data.ips || []);
        setIsIpLoading(false);
      }).catch(err => {
        console.error(err);
        setIsIpLoading(false);
      });
    }
  }, [isEditing, localForm.subscriptionTier, client.id]);

  const handleAddIp = async () => {
    if (!newIp) return;
    try {
      await fetch('/api/superuser/ips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('mm_jwt_token') || ''}` },
        body: JSON.stringify({ targetTenantId: client.id, ip: newIp })
      });
      setIps([...ips, newIp]);
      setNewIp('');
    } catch (err) {}
  };

  const handleRemoveIp = async (ipToRemove: string) => {
    try {
      await fetch('/api/superuser/ips', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('mm_jwt_token') || ''}` },
        body: JSON.stringify({ targetTenantId: client.id, ip: ipToRemove })
      });
      setIps(ips.filter(ip => ip !== ipToRemove));
    } catch (err) {}
  };

  React.useEffect(() => {
    if (isEditing) {
      setLocalForm({
        subscriptionTier: client.subscriptionTier,
        subscriptionStatus: client.subscriptionStatus,
        subscriptionCost: client.subscriptionCost,
        nextBillingDate: client.nextBillingDate
      });
    }
  }, [isEditing, client]);

  return (
    <div className="flex flex-col border-b border-neutral-150 hover:bg-[#070b14]/50 transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 items-start">
      {/* Name & ID */}
      <div className="lg:col-span-2 flex flex-col">
        <span className="lg:hidden text-[9px] font-bold text-slate-500 uppercase mb-1">Restaurante / ID</span>
        <span className="block font-bold text-white text-xs font-sans">{client.name}</span>
        <span className="block text-[9px] text-slate-500 mt-0.5">{client.id.toUpperCase()}</span>
      </div>
      {/* Owner & Contact */}
      <div className="lg:col-span-2 flex flex-col">
        <span className="lg:hidden text-[9px] font-bold text-slate-500 uppercase mb-1">Responsável / Contato</span>
        <span className="block text-slate-200 font-sans">{client.ownerName}</span>
        <span className="block text-[10px] text-slate-500 mt-0.5">{client.email}</span>
        {client.adminUsername && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className="inline-block text-[9px] bg-[#091018] border border-white/10 text-slate-400 px-1.5 py-0.5 rounded font-mono">
              Login: <span className="font-bold text-white">{client.adminUsername}</span>
            </span>
            <span className="inline-block text-[9px] bg-[#091018] border border-white/10 text-slate-400 px-1.5 py-0.5 rounded font-mono">
              Senha: <span className="font-bold text-white">{client.adminPassword}</span>
            </span>
          </div>
        )}
      </div>
      {/* Contract Plan */}
      <div className="lg:col-span-2 flex flex-col items-start lg:items-stretch">
        <span className="lg:hidden text-[9px] font-bold text-slate-500 uppercase mb-1">Plano Contratual</span>
        {isEditing ? (
                    <CustomSelect
            value={localForm.subscriptionTier}
            onChange={(tier) => {
              let cost = localForm.subscriptionCost;
              if (tier === 'trial') cost = 0;
              else if (tier === 'standard') cost = 299.90;
              else if (tier === 'premium') cost = 499.90;
              else if (tier === 'enterprise') cost = 999.90;
              setLocalForm({ ...localForm, subscriptionTier: tier as any, subscriptionCost: cost });
            }}
            options={[
              { value: 'trial', label: 'TRIAL' },
              { value: 'standard', label: 'STANDARD' },
              { value: 'premium', label: 'PREMIUM' },
              { value: 'enterprise', label: 'ENTERPRISE' }
            ]}
            className="bg-[#070b14] border border-white/20 rounded px-1.5 py-1 text-[10px] w-full lg:w-28 font-bold"
          />
        ) : (
          <span className={`inline-block border px-2 py-0.5 rounded text-[9px] font-bold uppercase w-max ${getTierBadgeClass(client.subscriptionTier)}`}>
            {client.subscriptionTier}
          </span>
        )}
      </div>

      {/* Status */}
      <div className="lg:col-span-1 flex flex-col items-start">
        <span className="lg:hidden text-[9px] font-bold text-slate-500 uppercase mb-1">Status</span>
        {isEditing ? (
          <CustomSelect
            value={localForm.subscriptionStatus}
            onChange={(status) => setLocalForm({ ...localForm, subscriptionStatus: status as any })}
            options={[
              { value: 'active', label: 'ATIVO' },
              { value: 'suspended', label: 'SUSPENSO' },
              { value: 'expired', label: 'EXPIRADO' }
            ]}
            className="bg-[#070b14] border border-white/20 rounded px-1.5 py-1 text-[10px] w-full lg:w-28 font-bold"
          />
        ) : (
          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] tracking-wide w-max ${getStatusBadgeClass(client.subscriptionStatus)}`}>
            {client.subscriptionStatus}
          </span>
        )}
      </div>
      {/* Fatura Mensal */}
      <div className="lg:col-span-1 flex flex-col">
        <span className="lg:hidden text-[9px] font-bold text-slate-500 uppercase mb-1">Fatura Mensal</span>
        <div className="font-bold text-white text-xs font-mono">{formatCurrency(client.subscriptionCost)}</div>
      </div>
      {/* Próx. Vencimento */}
      <div className="lg:col-span-1 flex flex-col">
        <span className="lg:hidden text-[9px] font-bold text-slate-500 uppercase mb-1">Próx. Vencimento</span>
        {isEditing ? (
          <input
            type="date"
            value={localForm.nextBillingDate}
            onChange={(e) => setLocalForm({ ...localForm, nextBillingDate: e.target.value })}
            className="bg-[#070b14] border border-white/20 rounded px-1.5 py-1 text-[10px] w-full lg:w-28 outline-none"
          />
        ) : (
          <span className="text-slate-400 text-[10px]">{client.nextBillingDate}</span>
        )}
      </div>
      {/* Host info / db info */}
      <div className="lg:col-span-1 flex flex-col text-slate-400 leading-relaxed text-[10px]">
        <span className="lg:hidden text-[9px] font-bold text-slate-500 uppercase mb-1">Métricas RDS</span>
        <div>DB: <span className="text-slate-200 font-bold">{client.databaseSizeMB.toFixed(1)} MB</span></div>
        <div className="text-[9px] text-slate-500 font-bold">{client.dbHost}</div>
      </div>
      {/* Actions button */}
      <div className="lg:col-span-2 flex flex-col justify-center lg:items-end lg:text-right mt-2 lg:mt-0 border-t border-white/5 lg:border-none pt-3 lg:pt-0">
        {isEditing ? (
          <div className="flex justify-start lg:justify-end gap-1.5 w-full">
            <button
              type="button"
              onClick={() => handleSaveEdit(client.id, localForm)}
              className="flex-1 lg:flex-none bg-[#040810] hover:bg-white text-white font-mono font-bold px-2 py-1.5 lg:py-1 rounded text-[9px] uppercase cursor-pointer"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setEditingClientId(null)}
              className="flex-1 lg:flex-none bg-[#091018] hover:bg-[#14293a] text-slate-300 border border-white/20 font-mono font-bold px-2 py-1.5 lg:py-1 rounded text-[9px] uppercase cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex justify-start lg:justify-end gap-1.5 w-full">
            <button
              onClick={() => startEditing(client)}
              className="flex-1 lg:flex-none bg-[#0c1622] hover:bg-[#091018] border border-white/10 text-slate-300 font-mono font-bold px-2 py-1.5 lg:py-1 rounded text-[9px] uppercase cursor-pointer"
            >
              Editar
            </button>
            <button
              onClick={() => handleDeleteClient(client.id)}
              className="flex-1 lg:flex-none bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-200 font-mono font-bold px-2 py-1.5 lg:py-1 rounded text-[9px] uppercase cursor-pointer"
            >
              Remover
            </button>
          </div>
        )}
      </div>
      </div>
      
      {isEditing && (localForm.subscriptionTier === 'premium' || localForm.subscriptionTier === 'enterprise') && (
        <div className="p-4 bg-[#091018]/50 border-t border-white/10 font-mono">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Controle de Acesso por IP (Premium/Enterprise)</span>
            <span className="text-[9px] text-slate-400 mb-2">Restrinja o acesso ao painel desta instância para IPs específicos. Deixe vazio para permitir todos os acessos.</span>
            
            <div className="flex gap-2 max-w-sm mb-2">
              <input 
                type="text" 
                value={newIp} 
                onChange={e => setNewIp(e.target.value)} 
                placeholder="Ex: 192.168.1.1" 
                className="flex-1 bg-[#0c1622] border border-white/20 rounded px-2 py-1.5 text-xs outline-none" 
              />
              <button 
                type="button"
                onClick={handleAddIp} 
                className="bg-white hover:bg-slate-200 text-black font-bold px-3 py-1.5 rounded text-[10px] uppercase cursor-pointer"
              >
                Adicionar
              </button>
            </div>
            
            {isIpLoading ? (
              <div className="text-xs text-slate-500 italic">Carregando whitelist...</div>
            ) : (
              <ul className="space-y-1.5 max-w-sm">
                {ips.map(ip => (
                  <li key={ip} className="flex justify-between items-center bg-[#0c1622] p-2 rounded border border-white/10 text-xs shadow-sm">
                    <span className="font-bold text-white">{ip}</span>
                    <button type="button" onClick={() => handleRemoveIp(ip)} className="text-[10px] text-red-400 hover:text-red-400 font-bold uppercase cursor-pointer">Remover</button>
                  </li>
                ))}
                {ips.length === 0 && <li className="text-[10px] text-slate-500 italic border border-dashed border-white/20 p-2 rounded bg-[#070b14]">Nenhuma restrição de IP ativa. Acesso aberto.</li>}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export const MasterDashboard = () => {
  const { clientInstances, addClientInstance, deleteClientInstance, updateClientSubscription, auditLogs, addAuditLog, logout } = useRestaurant();

  // Navigation tab
  const [activeTab, setActiveTab] = React.useState<'instances' | 'audit'>('instances');

  // Search & Filter
  const [clientSearch, setClientSearch] = React.useState('');
  const [tierFilter, setTierFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // Form state for new instance
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newInstance, setNewInstance] = React.useState({
    name: '',
    ownerName: '',
    email: '',
    subscriptionTier: 'standard' as ClientInstance['subscriptionTier'],
    subscriptionStatus: 'active' as ClientInstance['subscriptionStatus'],
    subscriptionCost: 299.90,
    nextBillingDate: '2026-08-15',
    dbHost: 'prod-db-06.mmsystems.net',
    adminUsername: '',
    adminPassword: ''
  });

  // Selected client for subscription editing
  const [editingClientId, setEditingClientId] = React.useState<string | null>(null);
  
  // Audit Logs search
  const [auditSearch, setAuditSearch] = React.useState('');

  const [successMsg, setSuccessMsg] = React.useState('');

  const [confirmState, setConfirmState] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
    confirmText?: string;
  } | null>(null);

  const startEditing = (client: ClientInstance) => {
    setEditingClientId(client.id);
  };

  const handleSaveEdit = (clientId: string, form: any) => {
    updateClientSubscription(
      clientId,
      form.subscriptionTier,
      form.subscriptionStatus,
      form.subscriptionCost,
      form.nextBillingDate
    );
    setEditingClientId(null);
    setSuccessMsg('Planos e faturamento atualizados com sucesso.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDeleteClient = (clientId: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Remover Instância do Cliente?',
      message: 'Esta ação é destrutiva e irá purgar todo o banco de dados do cliente (Cloud SQL), configurações e contas de usuário associadas.\n\nDeseja prosseguir com a remoção permanente?',
      onConfirm: () => {
        deleteClientInstance(clientId);
        setSuccessMsg('Instância removida com sucesso.');
        setTimeout(() => setSuccessMsg(''), 4000);
      },
      isDanger: true,
      confirmText: 'Remover Permanentemente'
    });
  };

  const handleCreateInstance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstance.name || !newInstance.ownerName || !newInstance.email || !newInstance.adminUsername || !newInstance.adminPassword) {
      setSuccessMsg('Erro: Preencha todos os campos obrigatórios, incluindo o login e senha de acesso.');
      setTimeout(() => setSuccessMsg(''), 5000);
      return;
    }
    
    setConfirmState({
      isOpen: true,
      title: 'Confirmar Provisionamento?',
      message: `Iremos provisionar uma nova instância de banco de dados (tenant) para: "${newInstance.name}".\n\nO usuário administrador ${newInstance.adminUsername} será criado.`,
      onConfirm: async () => {
        try { await addClientInstance(newInstance); setSuccessMsg(`Instância ${newInstance.name} provisionada com sucesso.`); setTimeout(() => setSuccessMsg(''), 5000); setShowAddForm(false); } catch(e: any) { alert(e.message); }
        setNewInstance({
          name: '',
          ownerName: '',
          email: '',
          subscriptionTier: 'standard',
          subscriptionStatus: 'active',
          subscriptionCost: 299.90,
          nextBillingDate: '2026-08-15',
          dbHost: 'prod-db-06.mmsystems.net',
          adminUsername: '',
          adminPassword: ''
        });
      },
      confirmText: 'Provisionar Instância'
    });
  };


  const filteredClients = useMemo(() => {
    return clientInstances.filter(client => {
      const matchesSearch =
        client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        client.ownerName.toLowerCase().includes(clientSearch.toLowerCase()) ||
        client.email.toLowerCase().includes(clientSearch.toLowerCase());
      const matchesTier = tierFilter === 'all' || client.subscriptionTier === tierFilter;
      const matchesStatus = statusFilter === 'all' || client.subscriptionStatus === statusFilter;
      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [clientInstances, clientSearch, tierFilter, statusFilter]);

  const renderedClients = useMemo(() => {
    if (filteredClients.length === 0) {
      return (
        <div className="flex w-full items-center justify-center text-center py-12 text-slate-500 italic">
          Nenhuma instancia de cliente localizada com os filtros aplicados.
        </div>
      );
    }
    
    return filteredClients.map((client) => {
      const isEditing = editingClientId === client.id;
      return (
        <ClientRow 
           key={client.id} 
           client={client} 
           isEditing={isEditing} 
           handleSaveEdit={handleSaveEdit} 
           setEditingClientId={setEditingClientId} 
           startEditing={startEditing} 
           handleDeleteClient={handleDeleteClient} 
         />
      );
    });
  }, [filteredClients, editingClientId]);

  // Filter audit logs
  const filteredLogs = auditLogs.filter(log => {
    const query = auditSearch.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.actor.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      log.ipAddress.includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#070b14] p-6 md:p-10 font-sans text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white font-display tracking-tight">Superuser Control Panel</h1>
            
          </div>
          <div className="flex gap-2">
            <button
              onClick={logout}
              className="bg-white hover:bg-slate-200 text-black font-mono font-bold py-2 px-4 rounded-lg text-[9px] uppercase transition-colors cursor-pointer"
            >
              SAIR DA SESSÃO GLOBAL
            </button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Instâncias Ativas', value: clientInstances.filter(c => c.subscriptionStatus === 'active').length, details: `${clientInstances.length} instâncias totais registradas` },
            { label: 'Faturamento de Assinaturas (MRR)', value: formatCurrency(clientInstances.reduce((acc, c) => acc + (c.subscriptionStatus === 'active' ? c.subscriptionCost : 0), 0)), details: 'Recorrência mensal ativa consolidada' },
            { label: 'Uso de Banco Consolidado', value: `${clientInstances.reduce((acc, c) => acc + c.databaseSizeMB, 0).toFixed(1)} MB`, details: 'Soma dos buckets de armazenamento RDS' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-[#0c1622] border border-white/10 rounded-2xl p-5 shadow-sm hover:border-white/30 transition-colors">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
              <div className={`text-2xl font-bold mt-1 text-white`}>
                {stat.value}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 leading-tight">{stat.details}</p>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab('instances')}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'instances' ? 'border-b-2 border-white/50 text-white' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Gerenciamento de Clientes
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'audit' ? 'border-b-2 border-white/50 text-white' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Logs de Auditoria
          </button>
        </div>

        {successMsg && (
          <div className="bg-white/5 border border-white/20 text-slate-300 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider animate-fade-in font-mono">
            ✅ {successMsg}
          </div>
        )}

        {/* Tab 1: Instances Management */}
        {activeTab === 'instances' && (
          <div className="space-y-6 animate-fade-in">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c1622] border border-white/10 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Filtrar por nome, dono ou email..."
                  className="bg-[#070b14] border border-white/10 focus:border-white/50 focus:bg-[#0c1622] rounded-lg py-1.5 px-3 text-xs outline-none w-full sm:w-64 font-mono"
                />
<CustomSelect
                  value={tierFilter}
                  onChange={setTierFilter}
                  options={[
                    { value: 'all', label: 'TODOS PLANOS' },
                    { value: 'trial', label: 'TRIAL' },
                    { value: 'standard', label: 'STANDARD' },
                    { value: 'premium', label: 'PREMIUM' },
                    { value: 'enterprise', label: 'ENTERPRISE' }
                  ]}
                  className="bg-[#070b14] border border-white/10 rounded-lg py-1.5 px-3 text-xs outline-none font-mono min-w-[140px]"
                />
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'all', label: 'TODOS STATUS' },
                    { value: 'active', label: 'ATIVOS' },
                    { value: 'suspended', label: 'SUSPENSOS' },
                    { value: 'expired', label: 'EXPIRADOS' }
                  ]}
                  className="bg-[#070b14] border border-white/10 rounded-lg py-1.5 px-3 text-xs outline-none font-mono min-w-[140px]"
                />
              </div>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-white hover:bg-slate-200 text-black font-mono font-bold py-2 px-4 rounded-xl text-xs uppercase cursor-pointer transition-colors whitespace-nowrap"
              >
                {showAddForm ? 'FECHAR FORMULÁRIO' : 'ADICIONAR CLIENTE'}
              </button>
            </div>

            {/* Create Client Form Container */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0c1622] border border-white rounded-2xl p-6 shadow-md"
              >
                <h3 className="text-xs font-mono font-bold uppercase text-white border-b border-white/5 pb-3 mb-4">
                  Criar Nova Instancia de Estabelecimento (Injeção de Schema RDS)
                </h3>
                <form onSubmit={handleCreateInstance} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase text-slate-500 mb-1">Nome do Restaurante *</label>
                    <input
                      type="text"
                      required
                      value={newInstance.name}
                      onChange={(e) => setNewInstance({ ...newInstance, name: e.target.value })}
                      placeholder="Ex: Pizzaria Forno Nobre"
                      className="bg-[#070b14] border border-white/10 rounded-lg py-2 px-3 text-xs outline-none focus:border-white/50 focus:bg-[#0c1622] w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase text-slate-500 mb-1">Nome do Proprietário *</label>
                    <input
                      type="text"
                      required
                      value={newInstance.ownerName}
                      onChange={(e) => setNewInstance({ ...newInstance, ownerName: e.target.value })}
                      placeholder="Ex: Guilherme Costa"
                      className="bg-[#070b14] border border-white/10 rounded-lg py-2 px-3 text-xs outline-none focus:border-white/50 focus:bg-[#0c1622] w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase text-slate-500 mb-1">E-mail para Faturamento *</label>
                    <input
                      type="email"
                      required
                      value={newInstance.email}
                      onChange={(e) => setNewInstance({ ...newInstance, email: e.target.value })}
                      placeholder="Ex: financeiro@forno.com.br"
                      className="bg-[#070b14] border border-white/10 rounded-lg py-2 px-3 text-xs outline-none focus:border-white/50 focus:bg-[#0c1622] w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase text-slate-500 mb-1">Plano da Assinatura</label>
                    <CustomSelect
                      value={newInstance.subscriptionTier}
                      onChange={(tier: string) => {
                        let cost = 299.90;
                        if (tier === 'trial') cost = 0;
                        else if (tier === 'premium') cost = 499.90;
                        else if (tier === 'enterprise') cost = 999.90;
                        setNewInstance({ ...newInstance, subscriptionTier: tier as any, subscriptionCost: cost });
                      }}
                      options={[
                        { value: 'trial', label: 'TRIAL (R$ 0,00)' },
                        { value: 'standard', label: 'STANDARD (R$ 299,90)' },
                        { value: 'premium', label: 'PREMIUM (R$ 499,90)' },
                        { value: 'enterprise', label: 'ENTERPRISE (R$ 999,90)' }
                      ]}
                      className="bg-[#070b14] border border-white/10 rounded-lg py-2 px-3 text-xs w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase text-slate-500 mb-1">Custo Mensal (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newInstance.subscriptionCost}
                      onChange={(e) => setNewInstance({ ...newInstance, subscriptionCost: parseFloat(e.target.value) || 0 })}
                      className="bg-[#070b14] border border-white/10 rounded-lg py-2 px-3 text-xs outline-none focus:border-white/50 focus:bg-[#0c1622] w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase text-slate-500 mb-1">Servidor de Banco de Dados</label>
                    <input
                      type="text"
                      required
                      value={newInstance.dbHost}
                      onChange={(e) => setNewInstance({ ...newInstance, dbHost: e.target.value })}
                      className="bg-[#070b14] border border-white/10 rounded-lg py-2 px-3 text-xs outline-none focus:border-white/50 focus:bg-[#0c1622] w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase text-slate-500 mb-1">Data do Proximo Vencimento</label>
                    <input
                      type="date"
                      required
                      value={newInstance.nextBillingDate}
                      onChange={(e) => setNewInstance({ ...newInstance, nextBillingDate: e.target.value })}
                      className="bg-[#070b14] border border-white/10 rounded-lg py-2 px-3 text-xs outline-none focus:border-white/50 focus:bg-[#0c1622] w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase text-slate-500 mb-1">Login do Administrador *</label>
                    <input
                      type="text"
                      required
                      value={newInstance.adminUsername}
                      onChange={(e) => setNewInstance({ ...newInstance, adminUsername: e.target.value })}
                      placeholder="Ex: bistro_admin"
                      className="bg-[#070b14] border border-white/10 rounded-lg py-2 px-3 text-xs outline-none focus:border-white/50 focus:bg-[#0c1622] w-full font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold uppercase text-slate-500 mb-1">Senha de Acesso *</label>
                    <input
                      type="password"
                      required
                      value={newInstance.adminPassword}
                      onChange={(e) => setNewInstance({ ...newInstance, adminPassword: e.target.value })}
                      placeholder="Senha do cliente"
                      className="bg-[#070b14] border border-white/10 rounded-lg py-2 px-3 text-xs outline-none focus:border-white/50 focus:bg-[#0c1622] w-full font-mono"
                    />
                  </div>

                  <div className="md:col-span-3 flex justify-end gap-3 pt-3 border-t border-white/5 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="bg-[#070b14] hover:bg-[#0c1622] border border-white/10 text-slate-400 font-mono font-bold py-2 px-4 rounded-xl text-[10px] uppercase cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-white hover:bg-slate-200 text-black font-mono font-bold py-2 px-5 rounded-xl text-[10px] uppercase cursor-pointer"
                    >
                      Inicializar Instância de Software
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Clients Listing table */}
            <div className="bg-[#0c1622] border border-white/10 rounded-2xl shadow-sm overflow-visible">
              <div className="w-full overflow-visible">
                <div className="w-full flex flex-col font-mono text-xs">
                  <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-4 bg-[#070b14] border-b border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-wider p-4 rounded-t-2xl">
                    <div className="lg:col-span-2">Restaurante / ID</div>
                    <div className="lg:col-span-2">Responsável / Contato</div>
                    <div className="lg:col-span-2">Plano Contratual</div>
                    <div className="lg:col-span-1">Status</div>
                    <div className="lg:col-span-1">Fatura Mensal</div>
                    <div className="lg:col-span-1">Próx. Vencimento</div>
                    <div className="lg:col-span-1">Métricas RDS</div>
                    <div className="lg:col-span-2 text-right">Ações de Controle</div>
                  </div>
                  <div className="flex flex-col divide-y divide-neutral-150">
                    {renderedClients}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: System Telemetry, Performance & Infrastructure Actions */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-fade-in font-mono">
            
            {/* Search filter for audit */}
            <div className="bg-[#0c1622] border border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Filtrar Log:</span>
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Filtrar logs por acao, autor, IP ou detalhes..."
                className="bg-[#070b14] border border-white/10 focus:border-white/50 focus:bg-[#0c1622] rounded-lg py-1.5 px-3 text-xs outline-none flex-1"
              />
            </div>

            {/* Simulated Black Monospaced Terminal Output Console */}
            <div className="bg-white border border-[#14293a] rounded-2xl p-6 text-slate-300 text-xs shadow-inner space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>SYSTEM CONSOLE LOGS - ESTADOS DE TRANSACAO SECURA SSL</span>
                <span>CONEXÃO ONLINE - {new Date().toLocaleTimeString()}</span>
              </div>

              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2 divide-y divide-neutral-900">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 italic">
                    Nenhum registro de auditoria corresponde ao filtro especificado.
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="pt-3.5 first:pt-0 leading-relaxed">
                      <div className="flex flex-col sm:flex-row justify-between text-[10px] text-slate-400 font-bold mb-1 gap-1">
                        <span>TIMESTAMP: {new Date(log.timestamp).toISOString()}</span>
                        <span>IP: {log.ipAddress}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 items-center mb-1">
                        <span className="bg-[#070b14] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                          {log.action}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          ACTOR: {log.actor.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-slate-300 font-medium whitespace-pre-wrap leading-tight mt-1.5">
                        {log.details}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Custom Confirmation Modal */}
        {confirmState && confirmState.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0c1622] border-2 border-[#14293a] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-2.5 border-b border-white/5 pb-3 text-sm font-mono font-bold uppercase tracking-wider">
                {confirmState.isDanger ? (
                  <span className="text-red-400">⚠️ {confirmState.title}</span>
                ) : (
                  <span className="text-white">ℹ️ {confirmState.title}</span>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold whitespace-pre-wrap">
                {confirmState.message}
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmState(null)}
                  className="bg-[#091018] hover:bg-[#14293a] text-slate-200 border border-white/20 font-mono font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmState.onConfirm();
                    setConfirmState(null);
                  }}
                  className={`font-mono font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer transition-colors ${
                    confirmState.isDanger
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-white hover:bg-slate-200 text-black'
                  }`}
                >
                  {confirmState.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
};
