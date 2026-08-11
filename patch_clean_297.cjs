const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

code = code.replace(
  "tenantId: currentUser?.tenantId || 'global' || 'global'",
  "tenantId: currentUser?.tenantId || 'global'"
);

fs.writeFileSync('src/context/RestaurantContext.tsx', code);
