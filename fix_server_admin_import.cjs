const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/import admin from 'firebase-admin';/, "import * as admin from 'firebase-admin';");

fs.writeFileSync('server.ts', content);
