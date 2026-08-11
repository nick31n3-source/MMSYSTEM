/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { User, UserRole, DEFAULT_PERMISSIONS } from '../types';

export const EmployeesControl: React.FC = () => {
  const { users: allUsers, currentUser, registerUser, updateUserPermissions, deleteUser } = useRestaurant();
  
  // Filter and show only employees belonging to the specific tenant of the currently logged-in user
  // to prevent cross-tenant data leakage, while keeping the master 'Nick User' account hidden.
  const users = allUsers.filter(u => {
    // 1. Hide the master 'Nick User' account from all clients' list of collaborators
    if (
      u.username === 'nick31' || 
      u.email === 'nick31.N3@gmail.com' || 
      u.role === 'superuser' || 
      u.id.includes('nick31')
    ) {
      return false;
    }

    // 2. Filter employees by their specific tenantId to prevent cross-tenant data leakage
    if (currentUser && currentUser.tenantId) {
      return u.tenantId === currentUser.tenantId;
    }

    return true;
  });
  
  // Registration state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('waiter');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [employeeToDelete, setEmployeeToDelete] = useState<User | null>(null);

  // CPF formatter helper: 000.000.000-00
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Apply mask
    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{1,3})$/, '$1.$2');
    }
    
    setCpf(value);
  };

  // Phone formatter helper: (00) 00000-0000
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Apply mask
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    
    setPhone(value);
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Por favor, informe o nome completo.');
    if (!cpf.trim() || cpf.length < 14) return setError('Por favor, informe um CPF valido.');
    if (!phone.trim() || phone.length < 14) return setError('Por favor, informe um telefone valido.');
    if (!email.trim() || !email.includes('@')) return setError('Por favor, informe um e-mail valido.');
    if (!username.trim()) return setError('Por favor, informe um nome de usuario.');
    if (username.includes(' ')) return setError('O usuario nao pode conter espacos.');
    if (!password.trim()) return setError('Por favor, informe uma senha de acesso.');
    if (password.length < 4) return setError('A senha deve conter no minimo 4 caracteres.');

    const res = await registerUser({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      role,
      password: password.trim(),
      cpf,
      phone,
      email: email.trim(),
      avatar: '' // Completely empty of any avatars
    });

    if (res.success) {
      setSuccess('Funcionario cadastrado com sucesso!');
      setError('');
      setName('');
      setCpf('');
      setPhone('');
      setEmail('');
      setUsername('');
      setPassword('');
      setTimeout(() => {
        setSuccess('');
        setShowAddForm(false);
      }, 1500);
    } else {
      setError(res.error || 'Erro ao salvar funcionario.');
    }
  };

  const handleTogglePermission = (userId: string, permToken: string, isAllowed: boolean, currentPerms: string[]) => {
    let updatedPerms: string[];
    if (isAllowed) {
      updatedPerms = currentPerms.filter(p => p !== permToken);
    } else {
      updatedPerms = [...currentPerms, permToken];
    }
    updateUserPermissions(userId, updatedPerms);
  };

  const handleDeleteClick = (employee: User) => {
    if (currentUser?.id === employee.id) {
      setError('Voce nao pode remover a si mesmo para evitar perda de acesso.');
      return;
    }
    setEmployeeToDelete(employee);
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      deleteUser(employeeToDelete.id);
      setEmployeeToDelete(null);
      setSuccess('Funcionario excluido com sucesso!');
      setError('');
      setTimeout(() => {
        setSuccess('');
      }, 1500);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-[#091018] text-white border-white/20';
      case 'manager': return 'bg-[#070b14] text-slate-200 border-white/10';
      case 'waiter': return 'bg-[#070b14] text-slate-300 border-white/10';
      case 'cook': return 'bg-[#070b14] text-slate-400 border-white/10';
      default: return 'bg-[#070b14] text-slate-400 border-white/10';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      case 'waiter': return 'Garcom';
      case 'cook': return 'Cozinheiro';
      default: return role;
    }
  };

  // Helper to extract initials
  const getNameInitials = (fullName: string) => {
    const parts = fullName.trim().toUpperCase().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`;
    }
    return parts[0].substring(0, 2);
  };

  // List of possible permissions to toggle in UI
  const availablePermissions = [
    { token: 'dashboard', label: 'Painel Geral' },
    { token: 'reports', label: 'Relatórios Financeiros' },
    { token: 'menu', label: 'Cardapio' },
    { token: 'inventory', label: 'Estoque' },
    { token: 'supplies', label: 'Suprimentos' },
    { token: 'waiter', label: 'Pedidos (Garcom)' },
    { token: 'kitchen', label: 'Cozinha' },
    { token: 'billing', label: 'Caixa / Fechamento' },
    { token: 'employees', label: 'Funcionarios (Admin)' },
    { token: 'audit', label: 'Logs e Auditoria' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white">
            Controle de Funcionarios & Permissoes
          </h2>
          
        </div>
        <div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-white hover:bg-slate-200 text-black text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all active:scale-[0.98] uppercase shadow-sm"
          >
            {showAddForm ? 'FECHAR FORMULARIO' : '+ ADICIONAR NOVO FUNCIONARIO'}
          </button>
        </div>
      </div>

      {/* Register Form Section */}
      {showAddForm && (
        <div className="bg-[#0c1622] border border-white/10 rounded-3xl p-6 shadow-sm max-w-2xl animate-fade-in">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-widest mb-4">
            CADASTRAR NOVO COLABORADOR
          </h3>

          <form onSubmit={handleCreateEmployee} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Souza"
                  className="w-full bg-[#070b14] border border-white/10 focus:border-neutral-400 rounded-xl py-2 px-3.5 text-white text-xs outline-none transition-all h-[38px]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  CPF
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  className="w-full bg-[#070b14] border border-white/10 focus:border-neutral-400 rounded-xl py-2 px-3.5 text-white text-xs outline-none transition-all h-[38px]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Telefone / Celular
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-[#070b14] border border-white/10 focus:border-neutral-400 rounded-xl py-2 px-3.5 text-white text-xs outline-none transition-all h-[38px]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Endereco de E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@mmsystems.com"
                  className="w-full bg-[#070b14] border border-white/10 focus:border-neutral-400 rounded-xl py-2 px-3.5 text-white text-xs outline-none transition-all h-[38px]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nome de Usuario (Acesso)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: carlos.souza"
                  className="w-full bg-[#070b14] border border-white/10 focus:border-neutral-400 rounded-xl py-2 px-3.5 text-white text-xs outline-none transition-all h-[38px]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Senha de Acesso
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full bg-[#070b14] border border-white/10 focus:border-neutral-400 rounded-xl py-2 px-3.5 text-white text-xs outline-none transition-all h-[38px]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Cargo Inicial
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-[#070b14] border border-white/10 focus:border-neutral-400 rounded-xl py-2 px-3 text-white text-xs outline-none transition-all h-[38px] cursor-pointer"
                >
                  <option value="waiter">Garcom</option>
                  <option value="cook">Cozinheiro</option>
                  <option value="manager">Gerente</option>
                  <option value="admin">Administrador (Total)</option>
                </select>
              </div>
            </div>

            {error && <p className="text-rose-400 text-xs font-bold font-mono uppercase">[ERRO: {error}]</p>}
            {success && (
              <p className="text-slate-300 text-xs font-bold font-mono uppercase">
                [OK: {success}]
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:bg-[#070b14] text-xs font-bold cursor-pointer transition-colors"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                SALVAR COLABORADOR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roster of Employees Table / Matrix Layout */}
      <div className="bg-[#0c1622] border border-white/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-neutral-150 bg-[#070b14]/20 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            QUADRO DE COLABORADORES CADASTRADOS ({users.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 text-[9px] uppercase tracking-wider text-slate-500 font-bold bg-[#070b14]/50">
                <th className="py-3.5 px-6">Funcionario / Dados de Acesso</th>
                <th className="py-3.5 px-6">CPF / Documento</th>
                <th className="py-3.5 px-6">Contato / E-mail</th>
                <th className="py-3.5 px-6">Controle de Permissoes por Modulo</th>
                <th className="py-3.5 px-6 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {users.map((employee) => {
                const isSelf = currentUser?.id === employee.id;
                const currentPerms = employee.permissions || DEFAULT_PERMISSIONS[employee.role] || [];

                return (
                  <tr key={employee.id} className="hover:bg-[#070b14]/30 transition-colors">
                    {/* Basic info with capital initials box instead of avatar/emoji */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-[#091018] border border-white/10 flex items-center justify-center font-mono font-bold text-slate-300 text-xs select-none">
                          {getNameInitials(employee.name)}
                        </span>
                        <div>
                          <p className="font-bold text-white flex items-center gap-2">
                            {employee.name}
                            {isSelf && (
                              <span className="text-[8px] bg-[#040810] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                VOCE
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 font-mono">
                            <span className="text-[9px] text-slate-500 font-bold">
                              @{employee.username}
                            </span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border ${getRoleBadgeColor(employee.role)}`}>
                              {getRoleLabel(employee.role).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CPF */}
                    <td className="py-4 px-6 text-slate-400 font-mono text-xs">
                      {employee.cpf || 'NAO INFORMADO'}
                    </td>

                    {/* Contact details */}
                    <td className="py-4 px-6 space-y-1 text-slate-400">
                      <p className="block">
                        {employee.email || 'N/A'}
                      </p>
                      <p className="block font-mono text-[11px] text-slate-500">
                        {employee.phone || 'N/A'}
                      </p>
                    </td>

                    {/* Permissions checklist */}
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {availablePermissions.map((perm) => {
                          const hasPerm = currentPerms.includes(perm.token);
                          return (
                            <button
                              key={perm.token}
                              onClick={() => handleTogglePermission(employee.id, perm.token, hasPerm, currentPerms)}
                              title={`${hasPerm ? 'REVOGAR' : 'CONCEDER'} acesso`}
                              className={`
                                px-2 py-1 rounded text-[9px] font-bold uppercase border transition-all cursor-pointer
                                ${hasPerm 
                                  ? 'bg-[#040810] border-[#14293a] text-white font-bold' 
                                  : 'bg-[#070b14] border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20'
                                }
                              `}
                            >
                              {perm.label.toUpperCase()}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Actions bar (Delete) */}
                    <td className="py-4 px-6 text-right">
                      {isSelf ? (
                        <span className="text-[9px] font-bold text-slate-500 uppercase">[RESTRITO]</span>
                      ) : (
                        <button
                          onClick={() => handleDeleteClick(employee)}
                          className="px-2.5 py-1.5 rounded border border-white/10 hover:border-rose-300 hover:bg-rose-950/30 hover:text-rose-750 text-slate-400 font-bold text-[9px] transition-all cursor-pointer uppercase"
                        >
                          EXCLUIR
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#0c1622] border border-white/10 rounded-3xl p-6 shadow-xl max-w-sm w-full space-y-4">
            <h3 className="text-sm font-extrabold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              ⚠️ CONFIRMAR EXCLUSÃO
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tem certeza de que deseja excluir o funcionário <strong className="text-white font-bold">{employeeToDelete.name}</strong> (@{employeeToDelete.username})? Esta ação é irreversível e revogará todos os seus acessos permanentemente.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:bg-[#070b14] text-xs font-bold cursor-pointer transition-colors"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                SIM, EXCLUIR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
