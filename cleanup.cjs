const fs = require('fs');

// Read server.ts
let server = fs.readFileSync('server.ts', 'utf8');

// Remove /api/sync/get
server = server.replace(/app\.get\("\/api\/sync\/get"[\s\S]*?}\);/g, '');

// Remove /api/sync/save
server = server.replace(/app\.post\("\/api\/sync\/save"[\s\S]*?}\);/g, '');

// Remove /api/db-test
server = server.replace(/app\.post\("\/api\/db-test"[\s\S]*?}\);/g, '');

// Replace old imports
server = server.replace(/import { getDatabaseStatus, saveSyncPayload, getSyncPayload, executePostgresQuery, bootstrapSchemaIfNeeded, getAllSyncPayloads, getAccountIps, addAccountIp, removeAccountIp } from "\.\/src\/lib\/db";/g, 'import { getAccountIps, addAccountIp, removeAccountIp } from "./src/lib/db";');

fs.writeFileSync('server.ts', server);
