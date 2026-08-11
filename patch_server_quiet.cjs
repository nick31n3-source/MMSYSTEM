const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'catch(e) { console.warn("Failed to create superuser custom token. Make sure Firebase Admin SDK has iam.serviceAccounts.signBlob permission."); }',
  'catch(e) { /* Silently fail if custom tokens cannot be created (e.g. missing IAM permission) */ }'
);

code = code.replace(
  'catch(e) { console.warn("Failed to create custom token. Make sure Firebase Admin SDK has iam.serviceAccounts.signBlob permission."); }',
  'catch(e) { /* Silently fail if custom tokens cannot be created */ }'
);

fs.writeFileSync('server.ts', code);
