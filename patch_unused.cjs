const fs = require('fs');

// Patch Login.tsx
let login = fs.readFileSync('src/components/Login.tsx', 'utf8');
login = login.replace(
  "const { login, tenantSettings } = useRestaurant();",
  "const { login } = useRestaurant();"
);
fs.writeFileSync('src/components/Login.tsx', login);

// Patch Sidebar.tsx
let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(
  "const { tenantSettings, currentUser, currentView, setView, logout } = useRestaurant();",
  "const { currentUser, currentView, setView, logout } = useRestaurant();"
);
// just in case
sidebar = sidebar.replace(
  "const { tenantSettings, currentUser, currentView, setView } = useRestaurant();",
  "const { currentUser, currentView, setView } = useRestaurant();"
);

fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

