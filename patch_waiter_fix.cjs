const fs = require('fs');
let code = fs.readFileSync('src/components/WaiterDashboard.tsx', 'utf8');

code = code.replace(/tables,/, 'tenantSettings, tables,');
fs.writeFileSync('src/components/WaiterDashboard.tsx', code);
