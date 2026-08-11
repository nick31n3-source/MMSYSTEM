const fs = require('fs');

// Patch Login.tsx
let login = fs.readFileSync('src/components/Login.tsx', 'utf8');
login = login.replace(
  "{tenantSettings.restaurantName.toUpperCase()}",
  "MM SYSTEMS"
);
fs.writeFileSync('src/components/Login.tsx', login);

// Patch Sidebar.tsx
let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  "{tenantSettings.restaurantName}",
  "MM Systems"
);
sidebar = sidebar.replace(
  "CONEXAO GLOBAL",
  "CLIENT BUSINESS PORTAL"
);
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

