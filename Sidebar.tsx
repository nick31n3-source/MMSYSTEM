/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRestaurant } from '../context/RestaurantContext';
import { UserRole, DEFAULT_PERMISSIONS } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, onToggle }) => {
  const restaurantContext = useRestaurant();
  const { currentUser, users, logout } = restaurantContext;



  if (!currentUser) return null;

  // Translation mapping for human display
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'waiter': return 'Garcom';
      case 'cook': return 'Cozinheiro';
      default: return role;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'ADM';
      case 'manager': return 'GER';
      case 'waiter': return 'GAR';
      case 'cook': return 'COZ';
      default: return role.substring(0, 3).toUpperCase();
    }
  };

  // Initials generator
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Master list of all navigable components/views and their corresponding permission tokens
  const allNavItems = [
    { label: 'Painel Geral', view: 'dashboard', permission: 'dashboard' },
    { label: 'Caixa / Fechamento', view: 'billing', permission: 'billing' },
    { label: 'Gerenciar Cardapio', view: 'menu', permission: 'menu' },
    { label: 'Controle de Estoque', view: 'inventory', permission: 'inventory' },
    { label: 'Gestão de Suprimentos', view: 'supplies', permission: 'supplies' },
    { label: 'Painel do Garcom', view: 'waiter', permission: 'waiter' },
    { label: 'Tela da Cozinha', view: 'kitchen', permission: 'kitchen' },
    { label: 'Funcionários & Permissões', view: 'employees', permission: 'employees' },
  ];

  const dbUser = users?.find(u => u.id === currentUser.id);
  const rawPermissions = dbUser?.permissions || currentUser.permissions || DEFAULT_PERMISSIONS[currentUser.role] || [];
  
  // Ensure admins and superusers always have access to settings even if their old DB record lacks it
  const userPermissions = (currentUser.role === 'admin' || currentUser.role === 'superuser') && !rawPermissions.includes('settings')
    ? [...rawPermissions, 'settings']
    : rawPermissions;

  const allowedItems = allNavItems.filter(item => userPermissions.includes(item.permission));

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-[#0c1622] border-r border-white/10
        transition-transform duration-300 transform lg:translate-x-0 lg:static lg:h-screen
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/20 bg-white/5">
          <div>
            <h1 className="text-sm font-extrabold font-sans tracking-tight text-white leading-none">MM Systems</h1>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest mt-1 block font-mono">CLIENT BUSINESS PORTAL</span>
          </div>
          <button 
            onClick={onToggle}
            className="p-2 border border-white/30 text-white hover:text-slate-300 lg:hidden rounded-lg hover:bg-white/10 cursor-pointer text-xs font-mono"
          >
            FECHAR
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 mb-4">
            <span className="text-[9px] font-bold uppercase text-white tracking-wider font-mono">
              Modulos Habilitados
            </span>
          </div>

          {allowedItems.length === 0 ? (
            <div className="px-3 py-4 text-xs text-slate-400 italic bg-[#070b14] border border-white/10 rounded-xl">
              Nenhuma permissao habilitada.
            </div>
          ) : (
            allowedItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => {
                    setView(item.view);
                    onToggle(); // Close mobile drawer
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? 'bg-white text-black shadow-md shadow-white/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <span>{item.label.toUpperCase()}</span>
                  {isActive && (
                    <span className="font-mono text-[9px] bg-[#0c1622]/20 text-white px-1.5 py-0.5 rounded uppercase">
                      ATIVO
                    </span>
                  )}
                </button>
              );
            })
          )}
          
          <div className="px-3 mt-8 mb-4">
            <span className="text-[9px] font-bold uppercase text-white tracking-wider font-mono">
              Configurações
            </span>
          </div>
          
          <div className="px-3 space-y-2">
            {userPermissions.includes('settings') && (
              <button
                onClick={() => {
                  setView('settings');
                  onToggle();
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  currentView === 'settings'
                    ? 'bg-white text-black shadow-md shadow-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>CONFIGURAÇÕES DA CONTA</span>
                {currentView === 'settings' && (
                  <span className="font-mono text-[9px] bg-[#0c1622]/20 text-white px-1.5 py-0.5 rounded uppercase">
                    ATIVO
                  </span>
                )}
              </button>
            )}

            {userPermissions.includes('reports') && (
              <button
                onClick={() => {
                  setView('reports');
                  onToggle();
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  currentView === 'reports'
                    ? 'bg-white text-black shadow-md shadow-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>RELATÓRIOS FINANCEIROS</span>
                {currentView === 'reports' && (
                  <span className="font-mono text-[9px] bg-[#0c1622]/20 text-white px-1.5 py-0.5 rounded uppercase">
                    ATIVO
                  </span>
                )}
              </button>
            )}
            
            {userPermissions.includes('audit') && (
              <button
                onClick={() => {
                  setView('audit');
                  onToggle();
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  currentView === 'audit'
                    ? 'bg-white text-black shadow-md shadow-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>LOGS E AUDITORIA</span>
                {currentView === 'audit' && (
                  <span className="font-mono text-[9px] bg-[#0c1622]/20 text-white px-1.5 py-0.5 rounded uppercase">
                    ATIVO
                  </span>
                )}
              </button>
            )}
          </div>
        </nav>

        {/* Active Employee Card Footer */}
        <div className="p-4 border-t border-white/10 bg-[#070b14] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="px-2 py-1 bg-[#0c1622] border border-white/10 font-mono text-[10px] font-bold text-slate-200 shrink-0 uppercase tracking-wider">
              {getRoleBadge(currentUser.role)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {currentUser.name.toUpperCase()}
              </p>
              <span className="inline-block text-[9px] font-bold text-slate-400 tracking-wider mt-0.5">
                {getRoleLabel(currentUser.role).toUpperCase()}
              </span>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="px-2 py-1 bg-[#0c1622] hover:bg-rose-950/30 hover:text-rose-400 hover:border-rose-200 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400 transition-all cursor-pointer"
          >
            SAIR
          </button>
        </div>
      </aside>
    </>
  );
};
