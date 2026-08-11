const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// First add imports for getAccountIps
code = code.replace(
  "import { getDatabaseStatus, saveSyncPayload, getSyncPayload, executePostgresQuery, bootstrapSchemaIfNeeded, getAllSyncPayloads } from \"./src/lib/db\";",
  "import { getDatabaseStatus, saveSyncPayload, getSyncPayload, executePostgresQuery, bootstrapSchemaIfNeeded, getAllSyncPayloads, getAccountIps, addAccountIp, removeAccountIp } from \"./src/lib/db\";"
);

// Add IP validation check
const ipCheck = `
    // IP Validation Middleware
    try {
      const allowedIps = await getAccountIps(targetTenantId);
      if (allowedIps.length > 0) {
        const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '';
        if (!allowedIps.includes(clientIp) && !allowedIps.includes(clientIp.replace(/^.*:/, ''))) {
          // Audit attempt
          console.warn(\`Unauthorized IP \${clientIp} attempted to access tenant \${targetTenantId}\`);
          return res.status(403).json({
            success: false,
            error: "Acesso bloqueado por restrição de IP (403 Unauthorized)."
          });
        }
      }
    } catch (err) {
      console.error("IP Validation error", err);
    }
    
    (req as any).tenantId = targetTenantId;
`;
code = code.replace("(req as any).tenantId = targetTenantId;", ipCheck);

fs.writeFileSync('server.ts', code);
