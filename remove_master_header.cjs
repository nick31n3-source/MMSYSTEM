const fs = require('fs');

let content = fs.readFileSync('src/components/MasterDashboard.tsx', 'utf8');

content = content.replace(/<p className="text-sm text-slate-400 font-mono mt-1[^>]*>[\s\S]*?<\/p>/g, '');

fs.writeFileSync('src/components/MasterDashboard.tsx', content);
