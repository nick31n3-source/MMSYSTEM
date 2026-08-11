const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  "const { tenantSettings, currentUser, currentView, setView } = useRestaurant();",
  "const { currentUser, currentView, setView } = useRestaurant();"
);
fs.writeFileSync('src/App.tsx', app);

let dashboard = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');
dashboard = dashboard.replace(
  "const { tenantSettings, sales = [], inventory = [], orders = [], tables = [], menu = [] } = restaurantContext;",
  "const { sales = [], inventory = [], orders = [], tables = [], menu = [] } = restaurantContext;"
);
fs.writeFileSync('src/components/DashboardOverview.tsx', dashboard);

