const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

code = code.replace(
  "    // Inject 'reports' permission for existing privileged users to prevent real-time state desync upon module activation\n    if (['admin', 'manager', 'superuser'].includes(u.role)) {\n      if (!u.permissions) {\n        return { ...u, permissions: DEFAULT_PERMISSIONS[u.role as UserRole] || [] };\n      } else if (!u.permissions.includes('reports')) {\n        return { ...u, permissions: [...u.permissions, 'reports'] };\n      }\n    }",
  "    if (!u.permissions) {\n      return { ...u, permissions: DEFAULT_PERMISSIONS[u.role as UserRole] || [] };\n    }"
);

fs.writeFileSync('src/context/RestaurantContext.tsx', code);
