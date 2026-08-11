const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace require with import
content = content.replace(/const admin = require\('firebase-admin'\);\n/m, "import admin from 'firebase-admin';\n");

fs.writeFileSync('server.ts', content);
