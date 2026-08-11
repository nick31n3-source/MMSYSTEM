const fs = require('fs');
let code = fs.readFileSync('src/lib/db.ts', 'utf8');
code += `

export async function getAccountIps(tenantId: string): Promise<string[]> {
  try {
    const res = await executePostgresQuery('SELECT ip_address FROM account_ips WHERE tenant_id = $1', [tenantId]);
    return res.rows.map((r: any) => r.ip_address);
  } catch (err) {
    console.error("Failed to get account IPs:", err);
    return [];
  }
}

export async function addAccountIp(tenantId: string, ip: string): Promise<void> {
  try {
    await executePostgresQuery('INSERT INTO account_ips (tenant_id, ip_address) VALUES ($1, $2) ON CONFLICT DO NOTHING', [tenantId, ip]);
  } catch (err) {
    console.error("Failed to add account IP:", err);
  }
}

export async function removeAccountIp(tenantId: string, ip: string): Promise<void> {
  try {
    await executePostgresQuery('DELETE FROM account_ips WHERE tenant_id = $1 AND ip_address = $2', [tenantId, ip]);
  } catch (err) {
    console.error("Failed to remove account IP:", err);
  }
}
`;
fs.writeFileSync('src/lib/db.ts', code);
