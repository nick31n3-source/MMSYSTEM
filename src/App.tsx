/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { TenantSettings } from './components/TenantSettings';
import { DashboardOverview } from './components/DashboardOverview';
import { MenuManagement } from './components/MenuManagement';
import { InventoryControl } from './components/InventoryControl';
import { WaiterDashboard } from './components/WaiterDashboard';
import { KitchenDisplay } from './components/KitchenDisplay';
import { BillClosing } from './components/BillClosing';
import { EmployeesControl } from './components/EmployeesControl';
import { MasterDashboard } from './components/MasterDashboard';
import { SuppliesControl } from './components/SuppliesControl';
import { FinancialReports } from './components/FinancialReports';
import { AuditLogs } from './components/AuditLogs';
import { LandingPage } from './components/LandingPage';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const [isBlocked, setIsBlocked] = useState(false);
  useEffect(() => {
    const handleBlock = () => setIsBlocked(true);
    window.addEventListener('ip-blocked', handleBlock);
    return () => window.removeEventListener('ip-blocked', handleBlock);
  }, []);

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-[#040810] flex flex-col justify-center items-center p-6 text-white font-mono">
        <div className="max-w-md w-full bg-black border border-red-500/30 p-8 rounded-2xl shadow-2xl shadow-red-900/20 text-center">
          <div className="text-red-400 mb-4 flex justify-center">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 uppercase tracking-widest text-red-400">403 Forbidden</h1>
          <p className="text-slate-500 text-sm mb-6 uppercase tracking-wider">
            Acesso bloqueado. Seu endereço IP não tem permissão para acessar esta instância.
          </p>
          <div className="text-xs text-slate-400 bg-[#040810]/50 p-4 rounded-lg uppercase">
            Incidente registrado nos logs de segurança.
          </div>
        </div>
      </div>
    );
  }

  const { currentUser, currentView, setView } = useRestaurant();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  if (!currentUser) {
    if (showLogin) return <Login onBack={() => setShowLogin(false)} />;
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  // If superuser, completely bypass the client app layout and return the exclusive master control panel
  if (currentUser.role === 'superuser') {
    return <MasterDashboard />;
  }

  // Double check authorization mapping
  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        if (currentUser.role === 'admin' || currentUser.role === 'manager') return <DashboardOverview />;
        break;
      case 'menu':
        return <MenuManagement />; // Waiter can read-only view
      case 'inventory':
        if (currentUser.role !== 'waiter') return <InventoryControl />; // Cooks and Admins can view
        break;
      case 'supplies':
        if (currentUser.role !== 'waiter') return <SuppliesControl />; // Cooks, Managers and Admins can access
        break;
      case 'waiter':
        if (currentUser.role !== 'cook') return <WaiterDashboard />; // Waiter, Admin, Manager can access
        break;
      case 'kitchen':
        if (currentUser.role !== 'waiter') return <KitchenDisplay />; // Cook, Admin, Manager can access
        break;
      case 'billing':
        if (currentUser.role !== 'cook') return <BillClosing />; // Waiters, Admin, Managers can access
        break;
      case 'employees':
        if (currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.role === 'superuser') return <EmployeesControl />;
        break;
      case 'settings':
        if (currentUser.role === 'admin' || currentUser.role === 'superuser' || currentUser.role === 'manager') return <TenantSettings />;
        break;
      case 'reports':
        if (currentUser.role === 'admin' || currentUser.role === 'manager') return <FinancialReports />;
        break;
      case 'audit':
        if (currentUser.role === 'admin' || currentUser.role === 'manager') return <AuditLogs />;
        break;
      default:
        break;
    }
    // Fallback if role is not permitted to this screen
    return (
      <div className="py-20 text-center space-y-3 bg-[#0c1622] border border-white/10 rounded-3xl p-8 shadow-sm">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest font-display">Acesso não Autorizado</h3>
        <p className="text-xs text-slate-400">Seu cargo "{getRoleLabel(currentUser.role)}" não possui privilégios para acessar este painel.</p>
      </div>
    );
  };

  const getBreadcrumbLabel = () => {
    switch (currentView) {
      case 'dashboard': return 'Painel de Controle e Desempenho Operacional';
      case 'menu': return 'Gerenciamento do Cardápio e Fichas Técnicas';
      case 'inventory': return 'Controle Integrado de Estoque de Insumos';
      case 'supplies': return 'Gestão de Suprimentos & Fornecedores';
      case 'waiter': return 'Terminal de Lançamento de Pedidos';
      case 'kitchen': return 'Monitor de Preparo de Pedidos (KDS)';
      case 'billing': return 'Fechamento de Contas e Caixa';
      case 'employees': return 'Controle de Funcionários & Permissões';
      case 'settings': return 'Configurações da Conta';
      case 'reports': return 'Relatórios Financeiros Consolidados';
      case 'audit': return 'Logs e Auditoria do Sistema';
      default: return 'Painel de Controle de Operações';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'waiter': return 'Garçom';
      case 'cook': return 'Cozinheiro';
      default: return role;
    }
  };

  return (
    <div className="flex h-screen bg-[#070b14] text-white font-sans overflow-hidden">
      
      {/* Drawer sidebar on mobile, static on desktop */}
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      {/* Main Panel Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-20 border-b border-white/10 bg-[#0c1622] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden px-3 py-1.5 border border-white/10 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer text-xs font-mono font-bold"
            >
              MENU
            </button>
            
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold block font-sans">
                MM Systems &middot; Client Business Portal
              </span>
              <h2 className="text-sm font-bold text-white mt-0.5 leading-none font-display">
                {getBreadcrumbLabel()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3.5 text-xs">
            <span className="hidden md:flex items-center gap-1.5 font-bold uppercase tracking-wider text-white bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-[9px]">
              Sessão: {getRoleLabel(currentUser.role)}
            </span>
          </div>
        </header>

        {/* Dynamic page container with scroll */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative bg-[#070b14]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="max-w-7xl mx-auto h-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <RestaurantProvider>
      <AppContent />
    </RestaurantProvider>
  );
}
