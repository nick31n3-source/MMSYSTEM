const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

code = code.replace(
  "{(userPermissions.includes('reports') || userPermissions.includes('employees')) && (",
  "{userPermissions.includes('audit') && ("
);

fs.writeFileSync('src/components/Sidebar.tsx', code);
