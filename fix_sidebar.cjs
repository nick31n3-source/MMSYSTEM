const fs = require('fs');

let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

sidebar = sidebar.replace(
  "          </div>\n          {userPermissions.includes('settings') && (",
  "          <div className=\"px-3 space-y-2\">\n          {userPermissions.includes('settings') && ("
);

fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

