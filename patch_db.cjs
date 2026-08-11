const fs = require('fs');
let code = fs.readFileSync('src/lib/db.ts', 'utf8');
code = code.replace(
  "console.log(\"PostgreSQL schema bootstrapped successfully with tenant isolation.\");",
  `await executePostgresQuery(\`
      CREATE TABLE IF NOT EXISTS account_ips (
        tenant_id VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (tenant_id, ip_address)
      );
    \`);
    console.log("PostgreSQL schema bootstrapped successfully with tenant isolation.");`
);
fs.writeFileSync('src/lib/db.ts', code);
