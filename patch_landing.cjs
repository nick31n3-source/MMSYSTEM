const fs = require('fs');

const content = `import React from 'react';
import { motion } from 'motion/react';
import { Settings, Zap, Target, Hexagon, ChevronDown, Facebook, Twitter, Linkedin, Github } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const scrollToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const aboutSection = document.getElementById('sobre-nos');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#070b14]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 100 100" className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                <polygon points="50,10 88,32 88,68 50,90 12,68 12,32" fill="#083344" stroke="#22d3ee" strokeWidth="6" />
                <path d="M32 66 L32 38 L50 52 L68 38 L68 66" fill="none" stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-bold text-sm tracking-widest text-white uppercase">MM SYSTEMS</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 bg-white/5 px-6 py-1.5 rounded-full border border-white/10 text-sm">
            <a href="#sobre-nos" onClick={scrollToAbout} className="font-medium text-slate-300 hover:text-cyan-400 transition-colors">
              Sobre
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={onLoginClick}
              className="px-6 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-[#070b14] text-sm font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]"
            >
              Acesse o sistema
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-[1000px] mx-auto space-y-32">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-[44px] md:text-[56px] font-bold tracking-tight leading-[1.1] text-white"
            >
              Inove com eficiência:<br/>
              o futuro da sua gestão<br/>
              começa aqui.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-slate-400 text-[15px] max-w-[400px]"
            >
              A MM Systems impulsiona sua gestão com inteligência artificial avançada.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="pt-2"
            >
              <button onClick={onLoginClick} className="px-8 py-3 rounded-full border border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] cursor-pointer">
                Conhecer Funcionalidades
              </button>
            </motion.div>
          </div>

          <div className="flex-1 relative flex justify-center items-center h-[400px]">
            {/* Glowing Hexagon Graphic */}
            <div className="relative w-full h-full flex justify-center items-center">
              <div className="absolute inset-0 bg-cyan-500/20 blur-[120px] rounded-full" />
              <svg width="100%" height="100%" viewBox="0 0 100 100" className="relative z-10 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
                <defs>
                   <filter id="cyan-glow">
                      <feGaussianBlur stdDeviation="1.5" result="blur" />
                      <feMerge>
                         <feMergeNode in="blur" />
                         <feMergeNode in="SourceGraphic" />
                      </feMerge>
                   </filter>
                </defs>
                <polygon points="50,5 93,27 93,73 50,95 7,73 7,27" fill="none" stroke="#22d3ee" strokeWidth="0.5" opacity="0.3" />
                <polygon points="50,15 84,33 84,67 50,85 16,67 16,33" fill="none" stroke="#22d3ee" strokeWidth="0.8" opacity="0.5" />
                <polygon points="50,22 78,37 78,63 50,78 22,63 22,37" fill="none" stroke="#22d3ee" strokeWidth="1.5" filter="url(#cyan-glow)" />
                
                {/* Connecting lines */}
                <line x1="50" y1="5" x2="50" y2="22" stroke="#22d3ee" strokeWidth="0.8" opacity="0.5" />
                <line x1="50" y1="95" x2="50" y2="78" stroke="#22d3ee" strokeWidth="0.8" opacity="0.5" />
                <line x1="7" y1="27" x2="22" y2="37" stroke="#22d3ee" strokeWidth="0.8" opacity="0.5" />
                <line x1="93" y1="27" x2="78" y2="37" stroke="#22d3ee" strokeWidth="0.8" opacity="0.5" />
                <line x1="7" y1="73" x2="22" y2="63" stroke="#22d3ee" strokeWidth="0.8" opacity="0.5" />
                <line x1="93" y1="73" x2="78" y2="63" stroke="#22d3ee" strokeWidth="0.8" opacity="0.5" />

                {/* Inner Hexagon with M */}
                <polygon points="50,33 64,41 64,59 50,67 36,59 36,41" fill="#083344" stroke="#22d3ee" strokeWidth="1" filter="url(#cyan-glow)" />
                <path d="M42 56 L42 45 L50 51 L58 45 L58 56" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </section>

        {/* Scroll Indicator */}
        <div className="flex justify-center -mt-10">
          <div className="w-16 h-16 relative flex justify-center items-center animate-bounce">
             <div className="absolute inset-0 bg-cyan-500/20 blur-[20px] rounded-full" />
             <svg width="40" height="40" viewBox="0 0 100 100" className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] relative z-10">
                <polygon points="50,10 88,32 88,68 50,90 12,68 12,32" fill="#083344" stroke="#22d3ee" strokeWidth="4" />
                <path d="M32 66 L32 38 L50 52 L68 38 L68 66" fill="none" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Inovação em Escala */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
             Inovação em escala
          </h2>
          <div className="w-full h-72 bg-[#091018] border border-[#14293a] rounded-[1.5rem] p-6 relative overflow-hidden flex flex-col justify-between shadow-[0_0_30px_rgba(6,182,212,0.05)]">
             <div className="flex justify-between items-start text-cyan-500 font-mono z-10 relative">
                <div>
                   <div className="text-2xl font-bold text-white">99.9%</div>
                   <div className="text-[10px] tracking-widest text-slate-500 font-sans font-bold uppercase mt-1">ACCURACY</div>
                </div>
                <div className="text-right">
                   <div className="text-2xl font-bold text-white">99.9%</div>
                   <div className="text-[10px] tracking-widest text-slate-500 font-sans font-bold uppercase mt-1">ACCURACY</div>
                </div>
             </div>
             
             {/* Network Visual SVG */}
             <div className="absolute inset-0 flex items-center justify-center opacity-90 pointer-events-none mt-8">
                <svg width="100%" height="100%" viewBox="0 0 800 300" className="opacity-90">
                  <defs>
                    <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0891b2" stopOpacity="0.1" />
                      <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#0891b2" stopOpacity="0.1" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Connections */}
                  <g stroke="url(#line-grad)" strokeWidth="1.5" opacity="0.6">
                    {/* Just some paths for neural network look */}
                    <path d="M 150 150 Q 250 50, 400 150 T 650 150" fill="none" />
                    <path d="M 150 150 Q 250 250, 400 150 T 650 150" fill="none" />
                    <path d="M 250 100 L 400 150 L 550 100" fill="none" />
                    <path d="M 250 200 L 400 150 L 550 200" fill="none" />
                    <path d="M 100 100 L 250 100 L 400 50 L 550 100 L 700 100" fill="none" />
                    <path d="M 100 200 L 250 200 L 400 250 L 550 200 L 700 200" fill="none" />
                    
                    {/* Additional complex connections */}
                    <path d="M 250 100 L 400 50" fill="none" />
                    <path d="M 250 200 L 400 250" fill="none" />
                    <path d="M 400 50 L 550 200" fill="none" />
                    <path d="M 400 250 L 550 100" fill="none" />
                    <path d="M 100 150 L 250 100" fill="none" />
                    <path d="M 100 150 L 250 200" fill="none" />
                    <path d="M 550 100 L 700 150" fill="none" />
                    <path d="M 550 200 L 700 150" fill="none" />
                  </g>
                  
                  {/* Nodes */}
                  <g fill="#0891b2" filter="url(#glow)">
                    {/* Layer 1 */}
                    <circle cx="100" cy="100" r="4" fill="#22d3ee" />
                    <circle cx="100" cy="150" r="5" fill="#22d3ee" />
                    <circle cx="100" cy="200" r="4" fill="#22d3ee" />
                    {/* Layer 2 */}
                    <circle cx="250" cy="50" r="6" />
                    <circle cx="250" cy="100" r="8" fill="#22d3ee" />
                    <circle cx="250" cy="150" r="8" fill="#22d3ee" />
                    <circle cx="250" cy="200" r="8" fill="#22d3ee" />
                    <circle cx="250" cy="250" r="6" />
                    {/* Layer 3 - Center */}
                    <circle cx="400" cy="50" r="10" />
                    <circle cx="400" cy="150" r="18" fill="#22d3ee" />
                    <circle cx="400" cy="250" r="10" />
                    {/* Layer 4 */}
                    <circle cx="550" cy="50" r="6" />
                    <circle cx="550" cy="100" r="8" fill="#22d3ee" />
                    <circle cx="550" cy="150" r="8" fill="#22d3ee" />
                    <circle cx="550" cy="200" r="8" fill="#22d3ee" />
                    <circle cx="550" cy="250" r="6" />
                    {/* Layer 5 */}
                    <circle cx="700" cy="100" r="4" fill="#22d3ee" />
                    <circle cx="700" cy="150" r="5" fill="#22d3ee" />
                    <circle cx="700" cy="200" r="4" fill="#22d3ee" />
                  </g>
                  
                  {/* Center Node Details */}
                  <circle cx="400" cy="150" r="10" fill="#083344" />
                </svg>
             </div>
             
             <div className="text-right z-10 relative">
                <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                   NEURAL NETWORK<br/>INCREASE RATE
                </div>
             </div>
          </div>
        </section>

        {/* Eficiência em cada passo */}
        <section className="space-y-12">
          <h2 className="text-xl font-bold text-white">
             Eficiência em cada passo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center px-4">
            <div className="flex flex-col items-center gap-4">
               <div className="w-16 h-16 rounded-2xl border border-cyan-500/20 bg-[#0c1622] flex items-center justify-center text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Settings className="w-8 h-8 stroke-[1.5]" />
               </div>
               <h3 className="font-medium text-sm text-white">Optimized<br/>Workflows</h3>
            </div>
            <div className="flex flex-col items-center gap-4">
               <div className="w-16 h-16 rounded-2xl border border-cyan-500/20 bg-[#0c1622] flex items-center justify-center text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Zap className="w-8 h-8 stroke-[1.5]" />
               </div>
               <h3 className="font-medium text-sm text-white">Faster Time to<br/>Insight</h3>
            </div>
            <div className="flex flex-col items-center gap-4">
               <div className="w-16 h-16 rounded-2xl border border-cyan-500/20 bg-[#0c1622] flex items-center justify-center text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Target className="w-8 h-8 stroke-[1.5]" />
               </div>
               <h3 className="font-medium text-sm text-white">Data-Driven<br/>Decisions</h3>
            </div>
          </div>
        </section>

        {/* Sobre nós */}
        <section id="sobre-nos" className="space-y-6 pt-10 pb-10">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Sobre nós</h2>
            <p className="text-slate-400 text-[13px]">Our Vision for Intelligent Efficiency</p>
          </div>
          
          <div className="text-slate-500 text-sm leading-relaxed max-w-3xl">
            <p>
              A MM Systems representa um novo padrão em eficiência. Aplicamos machine learning de ponta para entregar uma plataforma que não apenas gerencia dados, mas antecipa e otimiza sua operação, num processo preditivo e cuidadoso de processamento, predição de dados e tomada de decisão de excelência sem erros.
            </p>
          </div>

          <div className="flex justify-center pt-24 pb-8">
             <div className="relative w-16 h-16 flex justify-center items-center">
                <div className="absolute inset-0 bg-cyan-500/30 blur-[25px] rounded-full" />
                <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-[0_0_8px_rgba(34,211,238,1)] relative z-10">
                  <polygon points="50,10 88,32 88,68 50,90 12,68 12,32" fill="#083344" stroke="#22d3ee" strokeWidth="4" />
                  <path d="M32 66 L32 38 L50 52 L68 38 L68 66" fill="none" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
             </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 bg-[#070b14]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors"><Linkedin className="w-4 h-4" /></a>
            <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors"><Github className="w-4 h-4" /></a>
          </div>
          
          <div className="text-xs text-slate-500 flex flex-col md:flex-row items-center gap-4 md:gap-12 w-full md:w-auto justify-between md:justify-end">
            <span>&copy; {new Date().getFullYear()} MM Systems. Todos os direitos reservados.</span>
            <div className="flex gap-6">
               <a href="#" className="hover:text-cyan-400 transition-colors">Contato</a>
               <a href="#" className="hover:text-cyan-400 transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
`
fs.writeFileSync('src/components/LandingPage.tsx', content);

