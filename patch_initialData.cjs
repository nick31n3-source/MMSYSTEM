const fs = require('fs');
let code = fs.readFileSync('src/data/initialData.ts', 'utf8');

code = code.replace(/\['dashboard', 'reports', 'menu', 'inventory', 'supplies', 'waiter', 'kitchen', 'billing', 'employees', 'master_dashboard'\]/g, "['dashboard', 'reports', 'menu', 'inventory', 'supplies', 'waiter', 'kitchen', 'billing', 'employees', 'master_dashboard', 'settings', 'audit']");

fs.writeFileSync('src/data/initialData.ts', code);
