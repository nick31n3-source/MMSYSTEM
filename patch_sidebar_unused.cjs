const fs = require('fs');
let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  "const { tenantSettings, currentUser, users, logout } = restaurantContext;",
  "const { currentUser, users, logout } = restaurantContext;"
);
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);
