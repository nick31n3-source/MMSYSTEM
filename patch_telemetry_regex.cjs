const fs = require('fs');
let dashboardOverview = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

const regex = /\{\/\*\s*Platform Status\s*\*\/\}\s*<div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-sm">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

dashboardOverview = dashboardOverview.replace(regex, '');
fs.writeFileSync('src/components/DashboardOverview.tsx', dashboardOverview);
