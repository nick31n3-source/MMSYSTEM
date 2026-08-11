const fs = require('fs');
let code = fs.readFileSync('src/components/BillClosing.tsx', 'utf8');

code = code.replace(/MM SYSTEMS CO\./g, '{tenantSettings.restaurantName}');
code = code.replace(/'MM SYSTEMS RESTAURANTE'/g, 'tenantSettings.restaurantName');
code = code.replace(/'--- MM SYSTEMS AGRADECE A PREFERENCIA ---'/g, '`--- ${tenantSettings.receiptMessage || tenantSettings.restaurantName + " AGRADECE A PREFERÊNCIA"} ---`');
if (!code.includes('tenantSettings')) {
    code = code.replace(/tables,/, 'tenantSettings, tables,');
}
fs.writeFileSync('src/components/BillClosing.tsx', code);
