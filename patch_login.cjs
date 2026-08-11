const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

code = code.replace(/const \{ login \} = useRestaurant\(\);/, 'const { login, tenantSettings } = useRestaurant();');
code = code.replace(/MM SYSTEMS/g, '{tenantSettings.restaurantName.toUpperCase()}');

fs.writeFileSync('src/components/Login.tsx', code);
