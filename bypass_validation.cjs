const fs = require('fs');
let code = fs.readFileSync('src/components/MasterDashboard.tsx', 'utf8');

code = code.replace(
  'if (!newInstance.name || !newInstance.ownerName || !newInstance.email || !newInstance.adminUsername || !newInstance.adminPassword) {',
  'if (false) {'
);

fs.writeFileSync('src/components/MasterDashboard.tsx', code);
