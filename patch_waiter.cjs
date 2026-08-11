const fs = require('fs');
let code = fs.readFileSync('src/components/WaiterDashboard.tsx', 'utf8');

code = code.replace(/MM SYSTEMS CO\./g, '{tenantSettings.restaurantName}');
if (!code.includes('tenantSettings')) {
    code = code.replace(/const \{\s*menu,\s*orders,\s*tables,\s*currentUser,/, 'const { tenantSettings, menu, orders, tables, currentUser,');
}

fs.writeFileSync('src/components/WaiterDashboard.tsx', code);
