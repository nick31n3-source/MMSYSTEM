const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCheck = `    try {
      const allowedIps = await getAccountIps(targetTenantId);
      if (allowedIps.length > 0) {
        const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '';
        if (!allowedIps.includes(clientIp) && !allowedIps.includes(clientIp.replace(/^.*:/, ''))) {
          // Audit attempt
          console.warn(\\\`Unauthorized IP \${clientIp} attempted to access tenant \${targetTenantId}\\\`);
          return res.status(403).json({
            success: false,
            error: "Acesso bloqueado por restrição de IP (403 Unauthorized)."
          });
        }
      }
    } catch (err) {
      console.error("IP Validation error", err);
    }`;

const newCheck = `    try {
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
    }`;

code = code.replace(oldCheck, newCheck);

// Let's make sure that's correct
fs.writeFileSync('server.ts', code);
