const fs = require('fs');

let content = fs.readFileSync('src/components/TenantSettings.tsx', 'utf8');

content = content.replace(/<p className="text-sm text-slate-400 mt-1[^>]*>[\s\S]*?<\/p>/g, '');

fs.writeFileSync('src/components/TenantSettings.tsx', content);
