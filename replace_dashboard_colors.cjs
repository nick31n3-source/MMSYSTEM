const fs = require('fs');

let content = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

content = content.replace("? 'bg-amber-950/30 border-amber-300 text-amber-800'", "? 'bg-white/10 border-white/30 text-white'");
content = content.replace(": 'bg-emerald-950/30/40 border-emerald-100 text-emerald-800'", ": 'bg-[#0c1622] border-white/10 text-slate-400'");
content = content.replace("? 'bg-amber-900/40 text-amber-800'", "? 'bg-white/20 text-white'");
content = content.replace(": 'bg-emerald-900/40 text-emerald-800'", ": 'bg-white/5 text-slate-400'");

fs.writeFileSync('src/components/DashboardOverview.tsx', content);
