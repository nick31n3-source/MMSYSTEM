/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';

export const AuditLogs: React.FC = () => {
  const { auditLogs, currentUser } = useRestaurant();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const filteredLogs = useMemo(() => {
    return auditLogs
      .filter(log => {
        if (currentUser?.role === 'superuser' && !currentUser.tenantId) return true;
        if (!currentUser?.tenantId) return !log.tenantId || log.tenantId === 'global' || log.actor === currentUser?.username;
        return log.tenantId === currentUser.tenantId || log.actor === currentUser.username;
      })
      .filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [auditLogs, currentUser, searchTerm]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-white animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white">
            Logs e Auditoria do Sistema
          </h2>
          
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar logs..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-64 bg-[#0c1622] border border-white/10 focus:border-white/50 rounded-xl px-4 py-2 text-xs text-white outline-none transition-colors shadow-sm"
          />
        </div>
      </div>

      <div className="bg-[#0c1622] border border-white/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-white/5 bg-[#070b14] flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            Histórico de Eventos
          </h3>
          <span className="text-[10px] font-mono bg-[#14293a] text-slate-400 px-2 py-1 rounded-md uppercase font-bold">
            {filteredLogs.length} registros
          </span>
        </div>
        
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 bg-[#0c1622] z-10 shadow-sm">
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-[#0c1622]">Data/Hora</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-[#0c1622]">Usuário/Ator</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-[#0c1622]">Ação</th>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-[#0c1622]">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => {
                  const dateObj = new Date(log.timestamp);
                  const dateStr = dateObj.toLocaleDateString('pt-BR');
                  const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  
                  let actionColor = 'bg-[#091018] text-slate-300';
                  const actionUpper = log.action.toUpperCase();
                  if (actionUpper.includes('CREATED') || actionUpper.includes('ADD') || actionUpper.includes('NEW')) actionColor = 'bg-white/5 text-slate-300';
                  else if (actionUpper.includes('DELETED') || actionUpper.includes('REMOVE') || actionUpper.includes('FAIL')) actionColor = 'bg-rose-900/40 text-rose-800';
                  else if (actionUpper.includes('UPDATE') || actionUpper.includes('EDIT') || actionUpper.includes('MODIFY')) actionColor = 'bg-white/20 text-white';
                  else if (actionUpper.includes('AUTH') || actionUpper.includes('LOGIN')) actionColor = 'bg-amber-900/40 text-amber-800';

                  return (
                    <tr key={`${log.id}-${index}`} className="border-b border-white/5 last:border-0 hover:bg-[#070b14] transition-colors">
                      <td className="py-3 px-4 text-xs font-mono font-medium text-slate-300 whitespace-nowrap">
                        {dateStr} <span className="text-slate-500 ml-1">{timeStr}</span>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono font-medium text-slate-400 whitespace-nowrap">
                        {log.actor}
                      </td>
                      <td className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md ${actionColor}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-400 leading-relaxed min-w-[300px]">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-xs text-slate-500 italic">
                    Nenhum registro de auditoria encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
          {filteredLogs.length > itemsPerPage && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredLogs.length)} de {filteredLogs.length} logs
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredLogs.length / itemsPerPage), p + 1))}
                  disabled={currentPage >= Math.ceil(filteredLogs.length / itemsPerPage)}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
