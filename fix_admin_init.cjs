const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Fix the admin initializeApp call to not use undefined admin.credential
content = content.replace(/credential: admin\.credential\.applicationDefault\(\)/m, "// Use default credentials implicitly\n      // credential: admin.credential.applicationDefault()");

fs.writeFileSync('server.ts', content);
