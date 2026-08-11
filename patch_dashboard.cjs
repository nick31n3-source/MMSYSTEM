const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

code = code.replace(/MM SYSTEMS/g, '{tenantSettings.restaurantName.toUpperCase()}');
if (!code.includes('tenantSettings')) {
    code = code.replace(/sales,/, 'tenantSettings, sales,');
}

fs.writeFileSync('src/components/DashboardOverview.tsx', code);
