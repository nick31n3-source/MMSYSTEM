const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/if \(\(admin as any\)\.apps\.length > 0\) \{/g, 'if (((admin as any).apps && (admin as any).apps.length > 0) || ((admin as any).getApps && (admin as any).getApps().length > 0)) {');
content = content.replace(/if \(!admin\.getApps\(\)\.length\) \{/g, 'if (!(admin as any).getApps().length) {');
content = content.replace(/admin\.initializeApp\(\{/g, '(admin as any).initializeApp({');

fs.writeFileSync('server.ts', content);
