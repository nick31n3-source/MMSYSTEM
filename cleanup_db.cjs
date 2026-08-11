const fs = require('fs');
let db = fs.readFileSync('src/lib/db.ts', 'utf8');

// I'll keep the IP functions but mock them if Postgres is not present to prevent crashing.
// Since getAccountIps uses executePostgresQuery, I'll leave executePostgresQuery intact but I should remove saveSyncPayload and getSyncPayload.

db = db.replace(/export async function saveSyncPayload[\s\S]*?export async function getSyncPayload/g, 'export async function getSyncPayload');
db = db.replace(/export async function getSyncPayload[\s\S]*?export async function getAllSyncPayloads/g, 'export async function getAllSyncPayloads');
db = db.replace(/export async function getAllSyncPayloads[\s\S]*?export async function getAccountIps/g, 'export async function getAccountIps');

fs.writeFileSync('src/lib/db.ts', db);
