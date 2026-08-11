const fs = require('fs');
let code = fs.readFileSync('src/context/RestaurantContext.tsx', 'utf8');

const defaultTenantSettings = `  const [tenantSettings, setTenantSettings] = useState<TenantSettings>({
    id: 'global',
    restaurantName: 'MM Systems',
    receiptMessage: 'Obrigado pela preferência!'
  });`;

code = code.replace(/const \[auditLogs, setAuditLogs\] = useState<AuditLog\[\]>\(\[\]\);/, "const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);\n" + defaultTenantSettings);

fs.writeFileSync('src/context/RestaurantContext.tsx', code);
