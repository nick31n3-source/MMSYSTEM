const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

content = content.replace("? 'bg-white/10 border-white/30 text-white'", "? 'bg-[#070b14] border-amber-400 text-white shadow-[0_0_10px_rgba(251,191,36,0.15)]'");

content = content.replace("isBusy ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-400'", "isBusy ? 'bg-amber-900/40 border border-amber-200 text-amber-400' : 'bg-white/5 text-slate-400'");

fs.writeFileSync('src/components/DashboardOverview.tsx', content);
