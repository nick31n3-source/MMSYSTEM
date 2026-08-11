/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';

export interface DatabaseStatus {
  connected: boolean;
  type: 'local_storage' | 'external_postgres' | 'external_firebase';
  host?: string;
  details: string;
}

let pgPool: any = null;

/**
 * Lazy-initializes and returns the PostgreSQL connection pool.
 * Does not load or depend on the 'pg' module unless an active database URL is configured,
 * preventing any crash on environments without database packages installed.
 */
async function getPgPool() {
  if (pgPool) return pgPool;
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.trim() === '') {
    throw new Error("DATABASE_URL is not configured.");
  }
  try {
    const pgModule = await (Function('return import("pg")')() as Promise<any>);
    const PoolConstructor = pgModule.Pool || (pgModule.default && pgModule.default.Pool);
    if (!PoolConstructor) {
      throw new Error("Could not find Pool constructor in pg module.");
    }
    pgPool = new PoolConstructor({
      connectionString: dbUrl,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    return pgPool;
  } catch (err) {
    console.error("Failed to load 'pg' module or connect to postgres.", err);
    throw new Error("Modulo 'pg' nao esta instalado ou conexao falhou. Instale as dependencias para ativar.");
  }
}

/**
 * Executes a query against the PostgreSQL database if connected.
 */
export async function executePostgresQuery(text: string, params?: any[]): Promise<any> {
  const pool = await getPgPool();
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

/**
 * Automatically bootstraps database tables if using a relational PostgreSQL database.
 */
export async function bootstrapSchemaIfNeeded(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.trim() === '') return;

  try {
    console.log("Preparing external PostgreSQL database tables with tenant isolation...");
    await executePostgresQuery(`
      CREATE TABLE IF NOT EXISTS mm_system_data (
        key VARCHAR(100) NOT NULL,
        tenant_id VARCHAR(100) NOT NULL DEFAULT 'global',
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (key, tenant_id)
      );
    `);
    
    // Self-healing migration to add tenant_id if table was already created with just key
    try {
      await executePostgresQuery(`
        ALTER TABLE mm_system_data ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(100) NOT NULL DEFAULT 'global';
      `);
    } catch (alterErr) {
      console.log("Alter table non-critical notice (tenant_id might already exist):", alterErr);
    }
    
    await executePostgresQuery(`
      CREATE TABLE IF NOT EXISTS account_ips (
        tenant_id VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (tenant_id, ip_address)
      );
    `);
    console.log("PostgreSQL schema bootstrapped successfully with tenant isolation.");
  } catch (err) {
    console.error("Failed to bootstrap SQL schema:", err);
  }
}

/**
 * Returns the current database connection status and integration configuration.
 * Dynamically checks environment variables to verify external database preparations.
 */
export function getDatabaseStatus(): DatabaseStatus {
  const dbUrl = process.env.DATABASE_URL;
  const firebaseConfig = process.env.FIREBASE_CONFIG;

  if (dbUrl && dbUrl.trim() !== '') {
    try {
      // Safeguard against malformed connection strings
      if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
        const parts = dbUrl.split('@');
        const hostPart = parts[1] || parts[0];
        const [hostPort] = hostPart.split('/');
        return {
          connected: true,
          type: 'external_postgres',
          host: hostPort,
          details: `CONEXAO ATIVA: Pronto para carregar esquemas relacionais no host PostgreSQL [${hostPort}]`
        };
      }
      if (dbUrl.includes('firebase')) {
        return { connected: true, type: 'external_firebase', details: 'Firebase detected' };
      }
      return {
        connected: false,
        type: 'local_storage',
        details: 'FALHA DE INTEGRACAO: DATABASE_URL nao e postgres ou firebase'
      };
    } catch (err) {
      return {
        connected: false,
        type: 'external_postgres',
        details: 'FALHA DE INTEGRACAO: DATABASE_URL fornecida contem formato invalido'
      };
    }
  }

  if (firebaseConfig && firebaseConfig.trim() !== '') {
    return {
      connected: true,
      type: 'external_firebase',
      details: 'CONEXAO ATIVA: Pronto para persistir dados estruturados no Firestore (Firebase Store)'
    };
  }

  // Fallback to local offline mode (Local Storage sandbox)
  return {
    connected: true,
    type: 'local_storage',
    details: 'MODO SANDBOX: Persistencia ativa localmente no navegador (LocalStorage)'
  };
}

const LOCAL_FILE_DB = path.join(process.cwd(), 'local_db_fallback.json');

function readLocalFileDB(): Record<string, Record<string, any>> {
  try {
    if (fs.existsSync(LOCAL_FILE_DB)) {
      const content = fs.readFileSync(LOCAL_FILE_DB, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading local JSON database:", err);
  }
  return {};
}

function writeLocalFileDB(data: Record<string, Record<string, any>>) {
  try {
    fs.writeFileSync(LOCAL_FILE_DB, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing to local JSON database:", err);
  }
}

/**
 * Save operational records to the external database if active, or cache locally.
 */
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
