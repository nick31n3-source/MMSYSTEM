const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

// Update imports
code = code.replace(/UserRole \} from '\.\.\/types';/, "UserRole, TenantSettings } from '../types';");

// Add context types
code = code.replace(/interface RestaurantContextType \{/, "interface RestaurantContextType {\n  tenantSettings: TenantSettings;\n  updateTenantSettings: (settings: Partial<TenantSettings>) => void;");

fs.writeFileSync('src/context/RestaurantContext.tsx', code);
