const fs = require('fs');
let code = fs.readFileSync('src/components/BillClosing.tsx', 'utf8');
code = code.replace(/const \{ tables, orders, closeBill \} = useRestaurant\(\);/, "const { tenantSettings, tables, orders, closeBill } = useRestaurant();");
fs.writeFileSync('src/components/BillClosing.tsx', code);
