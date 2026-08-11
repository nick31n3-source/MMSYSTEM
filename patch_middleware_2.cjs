const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /\/\/ IP Validation Middleware[\s\S]*?\(req as any\)\.tenantId = targetTenantId;/;

const newCheck = `// IP Validation Middleware
    try {
      // For superusers, validate against 'global' IP list. For tenants, validate against their specific tenant ID list.
      const ipCheckTenant = isSuperuser ? "global" : targetTenantId;
      const allowedIps = await getAccountIps(ipCheckTenant);
      
      if (allowedIps.length > 0) {
        const clientIp = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '';
        const cleanIp = clientIp.replace(/^.*:/, '');
        
        if (!allowedIps.includes(clientIp) && !allowedIps.includes(cleanIp)) {
          console.warn(\`Unauthorized IP \${clientIp} attempted to access tenant \${ipCheckTenant}\`);
          return res.status(403).json({
            success: false,
            error: "Acesso bloqueado por restrição de IP (403 Unauthorized)."
          });
        }
      }
    } catch (err) {
      console.error("IP Validation error", err);
    }
    
    (req as any).tenantId = targetTenantId;`;

code = code.replace(regex, newCheck);

fs.writeFileSync('server.ts', code);
