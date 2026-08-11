const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');
code = code.replace(/const \{ sales = \[\], inventory = \[\], orders = \[\], tables = \[\], menu = \[\] \} = restaurantContext;/, "const { tenantSettings, sales = [], inventory = [], orders = [], tables = [], menu = [] } = restaurantContext;");
fs.writeFileSync('src/components/DashboardOverview.tsx', code);
