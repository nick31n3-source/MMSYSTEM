const fs = require('fs');
let code = fs.readFileSync('src/components/MasterDashboard.tsx', 'utf8');
code = code.replace(/\$\{stat\.isSuccess \? 'text-green-600' : 'text-neutral-900'\}/g, "text-neutral-900");
fs.writeFileSync('src/components/MasterDashboard.tsx', code);
