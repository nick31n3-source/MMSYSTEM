/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { motion } from 'motion/react';

export const Login: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { login } = useRestaurant();
  
  // Login states
  const [loginMode, setLoginMode] = useState<'client' | 'superuser'>('client');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Por favor, informe o seu nome de usuário.');
      return;
    }
    if (!password) {
      setErrorMsg('Por favor, digite a sua senha de acesso.');
      return;
    }

    if (loginMode === 'superuser') {
      if (username.trim().toLowerCase() !== 'nick31' || password !== 'password') {
        setErrorMsg('Credenciais de superusuário inválidas. Acesso restrito exclusivamente ao perfil nick31.N3@gmail.com.');
        return;
      }
    }

    const success = await login(username, password, loginMode === 'superuser');
    if (!success) {
      setErrorMsg('Nome de usuário ou senha incorretos. Tente novamente.');
    }
  };

  const toggleMode = () => {
    setLoginMode(prev => prev === 'client' ? 'superuser' : 'client');
    setUsername('');
    setPassword('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-[#02050A] flex flex-col justify-center items-center p-6 relative font-sans overflow-hidden">
      
      {/* Circuit Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,#02050A_75%)]"></div>
        <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#0ea5e9" strokeWidth="2" fill="none">
            {/* Left side */}
            <path d="M 100 0 L 100 200 L 200 300 L 200 700 L 100 800 L 100 1000" />
            <circle cx="100" cy="200" r="5" fill="#02050A" stroke="#0ea5e9" strokeWidth="2" />
            <circle cx="200" cy="300" r="5" fill="#0ea5e9" />
            <circle cx="200" cy="700" r="5" fill="#0ea5e9" />
            <circle cx="100" cy="800" r="5" fill="#02050A" stroke="#0ea5e9" strokeWidth="2" />
            
            <path d="M 150 0 L 150 150 L 250 250 L 250 750 L 150 850 L 150 1000" opacity="0.6" />
            <path d="M 50 0 L 50 250 L 150 350 L 150 650 L 50 750 L 50 1000" opacity="0.3" />

            {/* Right side */}
            <path d="M 900 0 L 900 200 L 800 300 L 800 700 L 900 800 L 900 1000" />
            <circle cx="900" cy="200" r="5" fill="#02050A" stroke="#0ea5e9" strokeWidth="2" />
            <circle cx="800" cy="300" r="5" fill="#0ea5e9" />
            <circle cx="800" cy="700" r="5" fill="#0ea5e9" />
            <circle cx="900" cy="800" r="5" fill="#02050A" stroke="#0ea5e9" strokeWidth="2" />

            <path d="M 850 0 L 850 150 L 750 250 L 750 750 L 850 850 L 850 1000" opacity="0.6" />
            <path d="M 950 0 L 950 250 L 850 350 L 850 650 L 950 750 L 950 1000" opacity="0.3" />

            {/* Inner details */}
            <path d="M 250 0 L 250 100 L 350 200 L 350 300 L 300 350" />
            <circle cx="300" cy="350" r="4" fill="#0ea5e9" />
            <path d="M 750 0 L 750 100 L 650 200 L 650 300 L 700 350" />
            <circle cx="700" cy="350" r="4" fill="#0ea5e9" />

            <path d="M 350 1000 L 350 900 L 450 800 L 450 700" />
            <circle cx="450" cy="700" r="4" fill="#0ea5e9" />
            <path d="M 650 1000 L 650 900 L 550 800 L 550 700" />
            <circle cx="550" cy="700" r="4" fill="#0ea5e9" />
            
            {/* Horizontal accents */}
            <path d="M 0 450 L 50 450 L 100 500" opacity="0.4" />
            <path d="M 1000 550 L 950 550 L 900 500" opacity="0.4" />
          </g>
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm z-10 relative flex flex-col items-center"
      >
        {/* Logo Section */}
        <div className="mb-4 flex flex-col items-center">
          <svg width="90" height="90" viewBox="0 0 100 100" className="drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] mb-2">
            <path d="M 20 67 L 20 17 L 50 47 L 80 17 L 80 67 L 65 82 L 65 37 L 50 52 L 35 37 L 35 82 Z" fill="none" stroke="#22d3ee" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="text-[28px] font-medium tracking-wide text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            MM SYSTEMS
          </h1>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center justify-center gap-4 mb-8 mt-4">
          <span className={`text-[15px] leading-tight font-medium transition-colors text-right ${loginMode === 'client' ? 'text-slate-200' : 'text-slate-500'}`}>
            Acesso<br/>Cliente
          </span>
          <div 
            className="w-[60px] h-8 rounded-full border border-cyan-500/60 p-[3px] cursor-pointer flex items-center bg-[#070b14]/50 shadow-[0_0_12px_rgba(34,211,238,0.15)] relative"
            onClick={toggleMode}
          >
            <motion.div 
              className="w-[26px] h-[26px] bg-cyan-500 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.8)]"
              animate={{ x: loginMode === 'client' ? 0 : 26 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
          <span className={`text-[15px] leading-tight font-medium transition-colors text-left ${loginMode === 'superuser' ? 'text-slate-200' : 'text-slate-500'}`}>
            Acesso<br/>Superusuário
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="w-full space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="username" className="block text-[15px] font-medium text-white drop-shadow-sm">
              Nome de Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrorMsg('');
              }}
              placeholder={loginMode === 'client' ? 'digite seu usuário' : 'digite o usuário master'}
              autoComplete="off"
              className="w-full bg-[#070b14]/60 border border-cyan-500/50 focus:border-cyan-400 focus:bg-[#070b14]/80 rounded-full py-3.5 px-6 text-white placeholder-slate-500 text-[15px] transition-all outline-none shadow-[inset_0_0_10px_rgba(34,211,238,0.1)] focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] backdrop-blur-md"
            />
          </div>
          
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-[15px] font-medium text-white drop-shadow-sm">
              Senha de Segurança
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg('');
              }}
              placeholder="digite sua senha"
              className="w-full bg-[#070b14]/60 border border-cyan-500/50 focus:border-cyan-400 focus:bg-[#070b14]/80 rounded-full py-3.5 px-6 text-white placeholder-slate-500 text-[15px] transition-all outline-none shadow-[inset_0_0_10px_rgba(34,211,238,0.1)] focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] backdrop-blur-md"
            />
          </div>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="text-center text-sm font-medium text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)] pt-2"
            >
              {errorMsg}
            </motion.div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-bold py-4 px-4 rounded-xl text-[15px] transition-all cursor-pointer uppercase tracking-wide shadow-[0_0_20px_rgba(34,211,238,0.6)] hover:shadow-[0_0_30px_rgba(34,211,238,0.8)]"
            >
              VALIDAR CREDENCIAIS E ENTRAR
            </button>
          </div>
        </form>

        {onBack && (
          <div className="mt-8 text-center">
            <button
              onClick={onBack}
              type="button"
              className="text-[15px] font-medium text-slate-400 hover:text-cyan-400 transition-colors underline underline-offset-4 cursor-pointer"
            >
              voltar para a home
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
